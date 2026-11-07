// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/insights/route";

const validCheckIns = [
  { date: "2026-11-03", energyLevel: 4, outputLevel: 3, matchedRoutine: true },
  {
    date: "2026-11-04",
    energyLevel: 2,
    outputLevel: 2,
    matchedRoutine: false,
    note: "  too tired  ",
  },
  { date: "2026-11-05", energyLevel: 5, outputLevel: 5, matchedRoutine: true },
];

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/insights", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

function geminiReply(text: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  } as unknown as Response;
}

async function errorCode(response: Response): Promise<string> {
  const body = await response.json();
  return body.error.code;
}

describe("POST /api/insights", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe("rejects bad requests before calling the AI", () => {
    it("returns 400 when the body is not JSON", async () => {
      const response = await post("not json");

      expect(response.status).toBe(400);
      expect(await errorCode(response)).toBe("INVALID_REQUEST");
      expect(fetch).not.toHaveBeenCalled();
    });

    it("returns 400 when a check-in has an out-of-range rating", async () => {
      const response = await post({
        checkIns: [{ ...validCheckIns[0], energyLevel: 9 }, ...validCheckIns],
      });

      expect(response.status).toBe(400);
      expect(await errorCode(response)).toBe("INVALID_REQUEST");
    });

    it("returns 400 when checkIns is missing", async () => {
      const response = await post({});

      expect(response.status).toBe(400);
      expect(await errorCode(response)).toBe("INVALID_REQUEST");
    });

    it("returns 400 when there are fewer than 3 check-ins", async () => {
      const response = await post({ checkIns: validCheckIns.slice(0, 2) });

      expect(response.status).toBe(400);
      expect(await errorCode(response)).toBe("INSUFFICIENT_DATA");
      expect(fetch).not.toHaveBeenCalled();
    });

    it("returns 503 when the API key is not configured", async () => {
      vi.stubEnv("GEMINI_API_KEY", "");

      const response = await post({ checkIns: validCheckIns });

      expect(response.status).toBe(503);
      expect(await errorCode(response)).toBe("MISSING_API_KEY");
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("handles failures from the AI service", () => {
    it("returns 502 when the request cannot reach the service", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("network down"));

      const response = await post({ checkIns: validCheckIns });

      expect(response.status).toBe(502);
      expect(await errorCode(response)).toBe("UPSTREAM_ERROR");
    });

    it("returns 502 when the service responds with an error", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "internal error",
      } as unknown as Response);

      const response = await post({ checkIns: validCheckIns });

      expect(response.status).toBe(502);
      expect(await errorCode(response)).toBe("UPSTREAM_ERROR");
      expect(console.error).toHaveBeenCalled();
    });

    it("returns 502 with a rate-limit message on HTTP 429", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
      } as unknown as Response);

      const response = await post({ checkIns: validCheckIns });
      const body = await response.json();

      expect(response.status).toBe(502);
      expect(body.error.message).toMatch(/rate-limited/);
    });

    it("returns 502 when the service reply is not readable JSON", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("bad json");
        },
      } as unknown as Response);

      const response = await post({ checkIns: validCheckIns });

      expect(response.status).toBe(502);
    });

    it("returns 502 when the service reply has no text", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ candidates: [] }),
      } as unknown as Response);

      const response = await post({ checkIns: validCheckIns });
      const body = await response.json();

      expect(response.status).toBe(502);
      expect(body.error.message).toMatch(/empty response/);
    });

    it("returns 502 when the text is not the expected JSON shape", async () => {
      vi.mocked(fetch).mockResolvedValue(
        geminiReply(JSON.stringify({ insight: "", confidence: "certain" })),
      );

      const response = await post({ checkIns: validCheckIns });
      const body = await response.json();

      expect(response.status).toBe(502);
      expect(body.error.message).toMatch(/unexpected format/);
    });
  });

  describe("on success", () => {
    it("returns the insight and confidence from the service", async () => {
      vi.mocked(fetch).mockResolvedValue(
        geminiReply(
          JSON.stringify({
            insight: "Output dropped on the day you missed your routine.",
            confidence: "medium",
          }),
        ),
      );

      const response = await post({ checkIns: validCheckIns });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        insight: "Output dropped on the day you missed your routine.",
        confidence: "medium",
      });
    });

    it("accepts JSON wrapped in a markdown code fence", async () => {
      vi.mocked(fetch).mockResolvedValue(
        geminiReply(
          '```json\n{"insight":"Energy is highest mid-week.","confidence":"low"}\n```',
        ),
      );

      const response = await post({ checkIns: validCheckIns });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        insight: "Energy is highest mid-week.",
        confidence: "low",
      });
    });

    it("sends the key in a header, the data in the prompt, and never leaks the key", async () => {
      vi.mocked(fetch).mockResolvedValue(
        geminiReply(JSON.stringify({ insight: "A pattern.", confidence: "low" })),
      );

      const response = await post({ checkIns: validCheckIns });

      const [url, init] = vi.mocked(fetch).mock.calls[0];
      expect(String(url)).toContain(":generateContent");
      expect(String(url)).not.toContain("test-key");
      expect((init?.headers as Record<string, string>)["x-goog-api-key"]).toBe(
        "test-key",
      );

      const sent = JSON.parse(String(init?.body));
      const prompt: string = sent.contents[0].parts[0].text;
      expect(prompt).toContain("2026-11-04");
      expect(prompt).toContain("too tired");
      expect(prompt).not.toContain("  too tired  ");

      expect(JSON.stringify(await response.json())).not.toContain("test-key");
    });
  });
});

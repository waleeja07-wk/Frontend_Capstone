// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";
import { mockDailyLogs } from "@/lib/mock-data";

describe("GET /api/health", () => {
  it("returns the mock daily logs as JSON", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(mockDailyLogs);
  });

  it("returns entries with the fields the health page renders", async () => {
    const logs = await (await GET()).json();

    expect(logs.length).toBeGreaterThan(0);
    for (const log of logs) {
      expect(log).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          energyLevel: expect.any(Number),
          outputSummary: expect.any(String),
        }),
      );
    }
  });
});

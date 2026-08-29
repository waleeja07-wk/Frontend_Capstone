import type { CheckIn } from "@/src/types/checkin";

const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MIN_CHECK_INS = 3;

type InsightConfidence = "low" | "medium" | "high";

type InsightResponse = {
  insight: string;
  confidence: InsightConfidence;
};

type CheckInPayload = Pick<
  CheckIn,
  "date" | "energyLevel" | "outputLevel" | "matchedRoutine" | "note"
>;

type InsightsRequestBody = {
  checkIns?: unknown;
};

type ApiErrorCode =
  | "INVALID_REQUEST"
  | "INSUFFICIENT_DATA"
  | "MISSING_API_KEY"
  | "UPSTREAM_ERROR"
  | "INVALID_RESPONSE";

function jsonError(
  code: ApiErrorCode,
  message: string,
  status: number,
): Response {
  return Response.json({ error: { code, message } }, { status });
}

function isRatingLevel(value: unknown): value is CheckIn["energyLevel"] {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function isCheckInPayload(value: unknown): value is CheckInPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
    isRatingLevel(entry.energyLevel) &&
    isRatingLevel(entry.outputLevel) &&
    typeof entry.matchedRoutine === "boolean" &&
    (entry.note === undefined ||
      entry.note === null ||
      typeof entry.note === "string")
  );
}

function normalizeCheckIns(value: unknown): CheckInPayload[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (!value.every(isCheckInPayload)) {
    return null;
  }

  return value.map(
    ({ date, energyLevel, outputLevel, matchedRoutine, note }) => ({
      date,
      energyLevel,
      outputLevel,
      matchedRoutine,
      ...(typeof note === "string" && note.trim() ? { note: note.trim() } : {}),
    }),
  );
}

function isInsightConfidence(value: unknown): value is InsightConfidence {
  return value === "low" || value === "medium" || value === "high";
}

function parseInsightResponse(rawText: string): InsightResponse | null {
  const trimmed = rawText.trim();

  const candidates = [
    trimmed,
    trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim(),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);

      if (
        parsed &&
        typeof parsed === "object" &&
        typeof (parsed as InsightResponse).insight === "string" &&
        (parsed as InsightResponse).insight.trim().length > 0 &&
        isInsightConfidence((parsed as InsightResponse).confidence)
      ) {
        return {
          insight: (parsed as InsightResponse).insight.trim(),
          confidence: (parsed as InsightResponse).confidence,
        };
      }
    } catch {
      continue;
    }
  }

  return null;
}

function buildPrompt(checkIns: CheckInPayload[]): string {
  const historyJson = JSON.stringify(checkIns, null, 2);

  return `You are analyzing daily check-in data for Daybook, a personal journal about energy, output, and routine adherence. The tone is quiet and honest — never motivational, gamified, or prescriptive.

Each check-in includes:
- date (yyyy-mm-dd)
- energyLevel (1-5)
- outputLevel (1-5)
- matchedRoutine (boolean — whether the day matched their planned routine)
- note (optional free text)

Data:
${historyJson}

Task: Identify ONE specific pattern grounded in this data. When supported, connect energy, output, and routine adherence rather than commenting on a single field in isolation.

Strong examples:
- "Your output tends to drop the day after you report high energy."
- "On days you matched your routine, output was generally higher than on days you did not."
- "Weekday entries in this set show lower energy than weekend entries."

Avoid:
- Generic encouragement or coaching ("Keep going!", "You're doing great!")
- Wellness clichés not supported by the data
- Multiple insights in one response
- Referencing information not present in the data

Return ONLY valid JSON:
{
  "insight": "one sentence, specific and honest",
  "confidence": "low" | "medium" | "high"
}

Confidence:
- high: consistent pattern across most entries
- medium: visible trend with gaps or a small sample
- low: early read — reflect uncertainty in the insight wording

No markdown. No preamble. JSON only.`;
}

async function callClaude(
  checkIns: CheckInPayload[],
  apiKey: string,
): Promise<{ ok: true; data: InsightResponse } | { ok: false; message: string }> {
  let response: Response;

  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 512,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: buildPrompt(checkIns),
          },
        ],
      }),
    });
  } catch {
    return {
      ok: false,
      message: "Could not reach the insights service.",
    };
  }

  if (response.status === 429) {
    return {
      ok: false,
      message: "Insights are temporarily rate-limited.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      message: "The insights service returned an error.",
    };
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    return {
      ok: false,
      message: "Received an unreadable response from the insights service.",
    };
  }

  const textBlock = (
    payload as { content?: Array<{ type?: string; text?: string }> }
  ).content?.find((block) => block.type === "text");

  if (!textBlock?.text) {
    return {
      ok: false,
      message: "The insights service returned an empty response.",
    };
  }

  const parsed = parseInsightResponse(textBlock.text);

  if (!parsed) {
    return {
      ok: false,
      message: "The insights service returned an unexpected format.",
    };
  }

  return { ok: true, data: parsed };
}

export async function POST(request: Request): Promise<Response> {
  let body: InsightsRequestBody;

  try {
    body = (await request.json()) as InsightsRequestBody;
  } catch {
    return jsonError(
      "INVALID_REQUEST",
      "Request body must be valid JSON.",
      400,
    );
  }

  const checkIns = normalizeCheckIns(body.checkIns);

  if (!checkIns) {
    return jsonError(
      "INVALID_REQUEST",
      "Expected { checkIns: [{ date, energyLevel, outputLevel, matchedRoutine, note? }] }.",
      400,
    );
  }

  if (checkIns.length < MIN_CHECK_INS) {
    return jsonError(
      "INSUFFICIENT_DATA",
      `At least ${MIN_CHECK_INS} check-ins are required to generate insights.`,
      400,
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return jsonError(
      "MISSING_API_KEY",
      "Insights are not configured on the server.",
      503,
    );
  }

  const result = await callClaude(checkIns, apiKey);

  if (!result.ok) {
    return jsonError("UPSTREAM_ERROR", result.message, 502);
  }

  return Response.json(result.data);
}

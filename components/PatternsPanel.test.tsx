import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PatternsPanel } from "./PatternsPanel";
import { getAllCheckIns } from "@/src/lib/storage";
import type { CheckIn } from "@/src/types/checkin";

vi.mock("@/src/lib/storage", () => ({
  getAllCheckIns: vi.fn(),
}));

function makeCheckIns(count: number): CheckIn[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    date: `2026-11-0${i + 1}`,
    energyLevel: 3,
    outputLevel: 3,
    matchedRoutine: true,
  })) as CheckIn[];
}

const mockedGetAllCheckIns = vi.mocked(getAllCheckIns);

describe("PatternsPanel", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("asks for more check-ins when there are fewer than 3", async () => {
    mockedGetAllCheckIns.mockReturnValue(makeCheckIns(2));

    render(<PatternsPanel />);

    expect(
      await screen.findByText("Log a few more days to see your patterns."),
    ).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows the fallback message when the insights API returns an error", async () => {
    mockedGetAllCheckIns.mockReturnValue(makeCheckIns(3));
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    } as unknown as Response);

    render(<PatternsPanel />);

    expect(
      await screen.findByText("Couldn't generate insights right now."),
    ).toBeTruthy();
  });

  it("shows the fallback message when the request itself fails", async () => {
    mockedGetAllCheckIns.mockReturnValue(makeCheckIns(3));
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    render(<PatternsPanel />);

    expect(
      await screen.findByText("Couldn't generate insights right now."),
    ).toBeTruthy();
  });

  it("shows the fallback message when the response has an unexpected shape", async () => {
    mockedGetAllCheckIns.mockReturnValue(makeCheckIns(3));
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ unexpected: true }),
    } as unknown as Response);

    render(<PatternsPanel />);

    expect(
      await screen.findByText("Couldn't generate insights right now."),
    ).toBeTruthy();
  });

  it("shows the insight and confidence when the API succeeds", async () => {
    mockedGetAllCheckIns.mockReturnValue(makeCheckIns(3));
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        insight: "Output tends to drop after high-energy days.",
        confidence: "medium",
      }),
    } as unknown as Response);

    render(<PatternsPanel />);

    expect(
      await screen.findByText("Output tends to drop after high-energy days."),
    ).toBeTruthy();
    expect(screen.getByText(/confidence: medium/i)).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith(
      "/api/insights",
      expect.objectContaining({ method: "POST" }),
    );
  });
});

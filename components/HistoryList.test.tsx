import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HistoryList } from "@/components/HistoryList";
import { getAllCheckIns } from "@/src/lib/storage";
import type { CheckIn } from "@/src/types/checkin";

vi.mock("@/src/lib/storage", () => ({
  getAllCheckIns: vi.fn(),
}));

const mockedGetAllCheckIns = vi.mocked(getAllCheckIns);

function entry(
  overrides: Partial<CheckIn> & Pick<CheckIn, "id" | "date">,
): CheckIn {
  return {
    energyLevel: 3,
    outputLevel: 3,
    matchedRoutine: true,
    ...overrides,
  };
}

describe("HistoryList", () => {
  it("shows an empty state when there are no check-ins", async () => {
    mockedGetAllCheckIns.mockReturnValue([]);

    render(<HistoryList />);

    expect(
      await screen.findByText(
        "No check-ins yet. Entries from Today will appear here.",
      ),
    ).toBeInTheDocument();
  });

  it("lists check-ins with the most recent first", async () => {
    mockedGetAllCheckIns.mockReturnValue([
      entry({ id: "a", date: "2026-11-03", note: "oldest entry" }),
      entry({ id: "c", date: "2026-11-05", note: "newest entry" }),
      entry({ id: "b", date: "2026-11-04", note: "middle entry" }),
    ]);

    render(<HistoryList />);

    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("newest entry");
    expect(items[1]).toHaveTextContent("middle entry");
    expect(items[2]).toHaveTextContent("oldest entry");
  });

  it("shows energy, output and routine answers for each entry", async () => {
    const withoutRoutineAnswer: Partial<CheckIn> = entry({
      id: "old",
      date: "2026-11-01",
      energyLevel: 2,
      outputLevel: 5,
    });
    delete withoutRoutineAnswer.matchedRoutine;

    mockedGetAllCheckIns.mockReturnValue([
      entry({
        id: "new",
        date: "2026-11-02",
        energyLevel: 4,
        outputLevel: 1,
        matchedRoutine: false,
      }),
      withoutRoutineAnswer as CheckIn,
    ]);

    render(<HistoryList />);

    await screen.findAllByRole("listitem");
    expect(screen.getByText("4/5")).toBeInTheDocument();
    expect(screen.getByText("1/5")).toBeInTheDocument();
    expect(screen.getByText("2/5")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Not recorded")).toBeInTheDocument();
  });
});

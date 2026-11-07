import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CheckInConfirmation } from "@/components/CheckInConfirmation";
import type { CheckIn } from "@/src/types/checkin";

const baseCheckIn: CheckIn = {
  id: "checkin-1",
  date: "2026-11-05",
  energyLevel: 4,
  outputLevel: 3,
  matchedRoutine: true,
};

describe("CheckInConfirmation", () => {
  it("shows the recorded date, energy, output and routine match", () => {
    render(<CheckInConfirmation checkIn={baseCheckIn} />);

    expect(screen.getByText("Recorded for today")).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    expect(screen.getByText("4/5")).toBeInTheDocument();
    expect(screen.getByText("3/5")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("shows 'No' when the day did not match the routine", () => {
    render(
      <CheckInConfirmation checkIn={{ ...baseCheckIn, matchedRoutine: false }} />,
    );

    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("shows the note only when one was written", () => {
    const { rerender } = render(<CheckInConfirmation checkIn={baseCheckIn} />);
    expect(screen.queryByText("Note")).not.toBeInTheDocument();

    rerender(
      <CheckInConfirmation
        checkIn={{ ...baseCheckIn, note: "Deep work block" }}
      />,
    );
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("Deep work block")).toBeInTheDocument();
  });

  it("falls back to 'Not recorded' for entries without a routine answer", () => {
    const legacy: Partial<CheckIn> = { ...baseCheckIn };
    delete legacy.matchedRoutine;

    render(<CheckInConfirmation checkIn={legacy as CheckIn} />);

    expect(screen.getByText("Not recorded")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RoutineLockedView } from "@/components/RoutineLockedView";
import type { Routine } from "@/src/types/routine";

const routine: Routine = {
  id: "routine-1",
  items: ["Write for 30 minutes", "Evening walk"],
  createdAt: "2026-11-01T10:00:00.000Z",
  lockedUntil: "2026-11-08",
};

describe("RoutineLockedView", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-05T10:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lists every anchor task", () => {
    render(<RoutineLockedView routine={routine} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Write for 30 minutes")).toBeInTheDocument();
    expect(screen.getByText("Evening walk")).toBeInTheDocument();
  });

  it("shows the unlock date and how many days remain", () => {
    render(<RoutineLockedView routine={routine} />);

    expect(screen.getByText(/Locked until/)).toBeInTheDocument();
    expect(screen.getByText(/3 days remaining/)).toBeInTheDocument();
  });

  it("uses the singular when one day remains", () => {
    render(
      <RoutineLockedView routine={{ ...routine, lockedUntil: "2026-11-06" }} />,
    );

    expect(screen.getByText(/1 day remaining/)).toBeInTheDocument();
  });
});

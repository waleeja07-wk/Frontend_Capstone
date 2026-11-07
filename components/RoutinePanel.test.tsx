import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { RoutinePanel } from "@/components/RoutinePanel";
import type { Routine } from "@/src/types/routine";

const ROUTINE_KEY = "daybook:routine";

function seedRoutine(lockedUntil: string) {
  const routine: Routine = {
    id: "routine-1",
    items: ["Write", "Walk"],
    createdAt: "2026-11-01T10:00:00.000Z",
    lockedUntil,
  };
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
}

describe("RoutinePanel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the creation form when no routine exists", async () => {
    render(<RoutinePanel />);

    expect(
      await screen.findByRole("button", { name: "Save routine" }),
    ).toBeInTheDocument();
  });

  it("saves a new routine and then shows it locked", async () => {
    const user = userEvent.setup();
    render(<RoutinePanel />);

    await user.type(
      await screen.findByLabelText("Anchor tasks"),
      "Write for 30 minutes{Enter}",
    );
    await user.click(screen.getByRole("button", { name: "Save routine" }));

    expect(await screen.findByText(/Locked until/)).toBeInTheDocument();
    expect(screen.getByText("Write for 30 minutes")).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem(ROUTINE_KEY) ?? "null");
    expect(stored.items).toEqual(["Write for 30 minutes"]);
  });

  it("shows the locked view, with no edit form, while the lock is active", async () => {
    seedRoutine("2999-01-01");

    render(<RoutinePanel />);

    expect(await screen.findByText(/Locked until/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Update routine" }),
    ).not.toBeInTheDocument();
  });

  it("lets the user edit again once the lock has expired", async () => {
    seedRoutine("2000-01-01");

    render(<RoutinePanel />);

    expect(
      await screen.findByRole("button", { name: "Update routine" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Write")).toBeInTheDocument();
    expect(screen.getByText("Walk")).toBeInTheDocument();
  });
});

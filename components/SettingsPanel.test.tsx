import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "@/components/SettingsPanel";
import type { Routine } from "@/src/types/routine";

const ROUTINE_KEY = "daybook:routine";
const CHECK_INS_KEY = "daybook:check-ins";

function seedRoutine(lockedUntil: string) {
  const routine: Routine = {
    id: "routine-1",
    items: ["Write", "Walk"],
    createdAt: "2026-11-01T10:00:00.000Z",
    lockedUntil,
  };
  localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
}

describe("SettingsPanel", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-05T10:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("says no routine is saved when storage is empty", async () => {
    render(<SettingsPanel />);

    expect(await screen.findByText("No routine saved yet.")).toBeInTheDocument();
  });

  it("reports the lock and how many days remain", async () => {
    seedRoutine("2026-11-08");

    render(<SettingsPanel />);

    expect(
      await screen.findByText(/Routine edits locked until/),
    ).toBeInTheDocument();
    expect(screen.getByText(/3 days remaining/)).toBeInTheDocument();
  });

  it("uses the singular when one day remains", async () => {
    seedRoutine("2026-11-06");

    render(<SettingsPanel />);

    expect(await screen.findByText(/1 day remaining/)).toBeInTheDocument();
  });

  it("says edits are available once the lock has expired", async () => {
    seedRoutine("2026-11-01");

    render(<SettingsPanel />);

    expect(
      await screen.findByText("Routine edits are available now."),
    ).toBeInTheDocument();
  });

  it("asks for confirmation before clearing and can be cancelled", async () => {
    const user = userEvent.setup();
    seedRoutine("2026-11-08");
    render(<SettingsPanel />);

    await user.click(
      await screen.findByRole("button", { name: "Clear all data" }),
    );
    expect(
      screen.getByText(/This cannot be undone/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText(/This cannot be undone/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear all data" })).toBeVisible();
    expect(localStorage.getItem(ROUTINE_KEY)).not.toBeNull();
  });

  it("clears check-ins and the routine after confirmation", async () => {
    const user = userEvent.setup();
    seedRoutine("2026-11-08");
    localStorage.setItem(CHECK_INS_KEY, JSON.stringify([{ id: "1" }]));
    render(<SettingsPanel />);

    await user.click(
      await screen.findByRole("button", { name: "Clear all data" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Yes, clear all data" }),
    );

    expect(localStorage.getItem(ROUTINE_KEY)).toBeNull();
    expect(localStorage.getItem(CHECK_INS_KEY)).toBeNull();
    expect(await screen.findByText("No routine saved yet.")).toBeInTheDocument();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Routine } from "@/src/types/routine";
import {
  ROUTINE_LOCK_DAYS,
  clearAllData,
  getAllCheckIns,
  getCurrentRoutine,
  getDaysUntilUnlock,
  getTodayCheckIn,
  isRoutineLocked,
  saveCheckIn,
  saveRoutine,
} from "@/src/lib/storage";

const FIXED_TODAY = new Date("2026-08-27T10:00:00");

describe("check-in storage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TODAY);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("saves a check-in and retrieves it", () => {
    const saved = saveCheckIn({
      energyLevel: 4,
      outputLevel: 3,
      matchedRoutine: true,
      note: "Focused morning",
    });

    expect(saved).toMatchObject({
      date: "2026-08-27",
      energyLevel: 4,
      outputLevel: 3,
      matchedRoutine: true,
      note: "Focused morning",
    });
    expect(saved.id).toBeTruthy();

    expect(getTodayCheckIn()).toEqual(saved);
    expect(getAllCheckIns()).toHaveLength(1);
  });

  it("updates an existing check-in for the same date instead of duplicating", () => {
    const first = saveCheckIn({
      energyLevel: 2,
      outputLevel: 2,
      matchedRoutine: false,
      note: "Slow start",
    });

    const updated = saveCheckIn({
      energyLevel: 5,
      outputLevel: 4,
      matchedRoutine: true,
    });

    expect(getAllCheckIns()).toHaveLength(1);
    expect(updated.id).toBe(first.id);
    expect(updated.date).toBe("2026-08-27");
    expect(updated.energyLevel).toBe(5);
    expect(updated.outputLevel).toBe(4);
    expect(updated.matchedRoutine).toBe(true);
    expect(updated.note).toBeUndefined();
    expect(getTodayCheckIn()).toEqual(updated);
  });

  it("returns an empty list when stored check-ins are invalid JSON", () => {
    localStorage.setItem("daybook:check-ins", "{ not valid json");

    expect(getAllCheckIns()).toEqual([]);
  });
});

describe("isRoutineLocked", () => {
  const baseRoutine: Routine = {
    id: "routine-1",
    items: ["Write", "Walk"],
    createdAt: "2026-08-27T10:00:00.000Z",
    lockedUntil: "2026-09-03",
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when today is before lockedUntil", () => {
    vi.setSystemTime(new Date("2026-08-27T10:00:00"));

    expect(isRoutineLocked(baseRoutine)).toBe(true);
  });

  it("returns false when today is on or after lockedUntil", () => {
    vi.setSystemTime(new Date("2026-09-03T10:00:00"));
    expect(isRoutineLocked(baseRoutine)).toBe(false);

    vi.setSystemTime(new Date("2026-09-10T10:00:00"));
    expect(isRoutineLocked(baseRoutine)).toBe(false);
  });
});

describe("check-in storage edge cases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TODAY);
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("returns null when there is no check-in for today", () => {
    expect(getTodayCheckIn()).toBeNull();
  });

  it("returns an empty list when the stored value is not an array", () => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    localStorage.setItem("daybook:check-ins", JSON.stringify({ not: "a list" }));

    expect(getAllCheckIns()).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it("keeps entries from other days when saving today's check-in", () => {
    localStorage.setItem(
      "daybook:check-ins",
      JSON.stringify([
        {
          id: "earlier",
          date: "2026-08-26",
          energyLevel: 3,
          outputLevel: 3,
          matchedRoutine: true,
        },
      ]),
    );

    saveCheckIn({ energyLevel: 4, outputLevel: 4, matchedRoutine: false });

    expect(getAllCheckIns().map((entry) => entry.date)).toEqual([
      "2026-08-26",
      "2026-08-27",
    ]);
  });

  it("drops a note that is only whitespace", () => {
    const saved = saveCheckIn({
      energyLevel: 3,
      outputLevel: 3,
      matchedRoutine: true,
      note: "   ",
    });

    expect(saved.note).toBeUndefined();
  });
});

describe("routine storage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TODAY);
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("returns null when no routine is saved", () => {
    expect(getCurrentRoutine()).toBeNull();
  });

  it("returns null when the stored routine is invalid JSON", () => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    localStorage.setItem("daybook:routine", "{ broken");

    expect(getCurrentRoutine()).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it("returns null when the stored routine is not an object", () => {
    vi.spyOn(console, "error").mockImplementation(() => { });
    localStorage.setItem("daybook:routine", "42");

    expect(getCurrentRoutine()).toBeNull();
  });

  it("saves a routine that locks for the configured number of days", () => {
    const saved = saveRoutine(["Write", "Walk"]);

    expect(ROUTINE_LOCK_DAYS).toBe(7);
    expect(saved.items).toEqual(["Write", "Walk"]);
    expect(saved.lockedUntil).toBe("2026-09-03");
    expect(getCurrentRoutine()).toEqual(saved);
    expect(isRoutineLocked(saved)).toBe(true);
  });

  it("trims tasks and drops blank ones", () => {
    const saved = saveRoutine(["  Write  ", "", "   ", "Walk"]);

    expect(saved.items).toEqual(["Write", "Walk"]);
  });

  it("rejects a routine with no tasks", () => {
    expect(() => saveRoutine(["", "   "])).toThrow(
      "Routine must include at least one anchor task.",
    );
    expect(getCurrentRoutine()).toBeNull();
  });

  it("keeps the same id and creation date when the routine is updated", () => {
    const first = saveRoutine(["Write"]);

    vi.setSystemTime(new Date("2026-09-05T10:00:00"));
    const updated = saveRoutine(["Write", "Walk"]);

    expect(updated.id).toBe(first.id);
    expect(updated.createdAt).toBe(first.createdAt);
    expect(updated.items).toEqual(["Write", "Walk"]);
    expect(updated.lockedUntil).toBe("2026-09-12");
  });
});

describe("getDaysUntilUnlock", () => {
  const routine: Routine = {
    id: "routine-1",
    items: ["Write"],
    createdAt: "2026-08-27T10:00:00.000Z",
    lockedUntil: "2026-09-03",
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts the days left while the routine is locked", () => {
    vi.setSystemTime(new Date("2026-08-27T10:00:00"));
    expect(getDaysUntilUnlock(routine)).toBe(7);

    vi.setSystemTime(new Date("2026-09-02T10:00:00"));
    expect(getDaysUntilUnlock(routine)).toBe(1);
  });

  it("counts correctly across a month boundary", () => {
    vi.setSystemTime(new Date("2026-08-30T10:00:00"));

    expect(getDaysUntilUnlock(routine)).toBe(4);
  });

  it("returns 0 on the unlock day and after it", () => {
    vi.setSystemTime(new Date("2026-09-03T10:00:00"));
    expect(getDaysUntilUnlock(routine)).toBe(0);

    vi.setSystemTime(new Date("2026-09-20T10:00:00"));
    expect(getDaysUntilUnlock(routine)).toBe(0);
  });
});

describe("clearAllData", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes check-ins and the routine but leaves unrelated data alone", () => {
    localStorage.setItem("daybook:check-ins", "[]");
    localStorage.setItem("daybook:routine", "{}");
    localStorage.setItem("something-else", "keep me");

    clearAllData();

    expect(localStorage.getItem("daybook:check-ins")).toBeNull();
    expect(localStorage.getItem("daybook:routine")).toBeNull();
    expect(localStorage.getItem("something-else")).toBe("keep me");
  });
});

describe("server-side guards", () => {
  beforeEach(() => {
    vi.stubGlobal("window", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads return empty values when there is no browser", () => {
    expect(getAllCheckIns()).toEqual([]);
    expect(getCurrentRoutine()).toBeNull();
  });

  it("writes refuse to run when there is no browser", () => {
    expect(() =>
      saveCheckIn({ energyLevel: 3, outputLevel: 3, matchedRoutine: true }),
    ).toThrow("browser");
    expect(() => saveRoutine(["Write"])).toThrow("browser");
    expect(() => clearAllData()).toThrow("browser");
  });
});


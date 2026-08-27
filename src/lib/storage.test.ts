import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Routine } from "@/src/types/routine";
import {
  getAllCheckIns,
  getTodayCheckIn,
  isRoutineLocked,
  saveCheckIn,
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
      note: "Focused morning",
    });

    expect(saved).toMatchObject({
      date: "2026-08-27",
      energyLevel: 4,
      outputLevel: 3,
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
      note: "Slow start",
    });

    const updated = saveCheckIn({
      energyLevel: 5,
      outputLevel: 4,
    });

    expect(getAllCheckIns()).toHaveLength(1);
    expect(updated.id).toBe(first.id);
    expect(updated.date).toBe("2026-08-27");
    expect(updated.energyLevel).toBe(5);
    expect(updated.outputLevel).toBe(4);
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

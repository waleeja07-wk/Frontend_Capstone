import type { CheckIn } from "@/src/types/checkin";
import type { Routine } from "@/src/types/routine";

const STORAGE_KEY = "daybook:check-ins";
const ROUTINE_STORAGE_KEY = "daybook:routine";

export const ROUTINE_LOCK_DAYS = 7;

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getAllCheckIns(): CheckIn[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error("Failed to parse check-ins: expected an array.", parsed);
      return [];
    }

    return parsed as CheckIn[];
  } catch (error) {
    console.error("Failed to parse check-ins from localStorage:", error);
    return [];
  }
}

export function getTodayCheckIn(): CheckIn | null {
  const today = getTodayDateString();
  return getAllCheckIns().find((entry) => entry.date === today) ?? null;
}

export type SaveCheckInInput = {
  energyLevel: CheckIn["energyLevel"];
  outputLevel: CheckIn["outputLevel"];
  matchedRoutine: boolean;
  note?: string;
};

export function saveCheckIn(input: SaveCheckInInput): CheckIn {
  if (typeof window === "undefined") {
    throw new Error("saveCheckIn can only be called in the browser.");
  }

  const today = getTodayDateString();
  const checkIns = getAllCheckIns();
  const existingIndex = checkIns.findIndex((entry) => entry.date === today);
  const trimmedNote = input.note?.trim();

  const checkIn: CheckIn = {
    id: existingIndex >= 0 ? checkIns[existingIndex].id : crypto.randomUUID(),
    date: today,
    energyLevel: input.energyLevel,
    outputLevel: input.outputLevel,
    matchedRoutine: input.matchedRoutine,
    ...(trimmedNote ? { note: trimmedNote } : {}),
  };

  if (existingIndex >= 0) {
    checkIns[existingIndex] = checkIn;
  } else {
    checkIns.push(checkIn);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkIns));
  return checkIn;
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysToDateString(dateString: string, days: number): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getCurrentRoutine(): Routine | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(ROUTINE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      console.error("Failed to parse routine: expected an object.", parsed);
      return null;
    }

    return parsed as Routine;
  } catch (error) {
    console.error("Failed to parse routine from localStorage:", error);
    return null;
  }
}

export function isRoutineLocked(routine: Routine): boolean {
  const today = getTodayDateString();
  return today < routine.lockedUntil.slice(0, 10);
}

export function getDaysUntilUnlock(routine: Routine): number {
  const today = getTodayDateString();
  const lockedUntil = routine.lockedUntil.slice(0, 10);

  if (today >= lockedUntil) {
    return 0;
  }

  const todayDate = parseDateString(today);
  const unlockDate = parseDateString(lockedUntil);
  const diffMs = unlockDate.getTime() - todayDate.getTime();

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function saveRoutine(items: string[]): Routine {
  if (typeof window === "undefined") {
    throw new Error("saveRoutine can only be called in the browser.");
  }

  const trimmedItems = items.map((item) => item.trim()).filter(Boolean);

  if (trimmedItems.length === 0) {
    throw new Error("Routine must include at least one anchor task.");
  }

  const today = getTodayDateString();
  const existing = getCurrentRoutine();

  const routine: Routine = {
    id: existing?.id ?? crypto.randomUUID(),
    items: trimmedItems,
    lockedUntil: addDaysToDateString(today, ROUTINE_LOCK_DAYS),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };

  localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routine));
  return routine;
}

export function clearAllData(): void {
  if (typeof window === "undefined") {
    throw new Error("clearAllData can only be called in the browser.");
  }

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ROUTINE_STORAGE_KEY);
}

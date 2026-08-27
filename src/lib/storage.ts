import type { CheckIn } from "@/src/types/checkin";

const STORAGE_KEY = "daybook:check-ins";

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

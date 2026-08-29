export const MOOD_OPTIONS = [
  "Calm",
  "Stressed",
  "Motivated",
  "Tired",
] as const;

export type Mood = (typeof MOOD_OPTIONS)[number];

export type CheckIn = {
  id: string;
  date: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  outputLevel: 1 | 2 | 3 | 4 | 5;
  matchedRoutine: boolean;
  mood?: Mood;
  note?: string;
};

export type RatingLevel = CheckIn["energyLevel"];

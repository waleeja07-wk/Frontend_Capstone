export type CheckIn = {
  id: string;
  date: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  outputLevel: 1 | 2 | 3 | 4 | 5;
  matchedRoutine: boolean;
  note?: string;
};

export type RatingLevel = CheckIn["energyLevel"];

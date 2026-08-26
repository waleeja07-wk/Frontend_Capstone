import type { DailyLogEntry } from "./types";

export const mockDailyLogs: DailyLogEntry[] = [
  {
    id: "log-001",
    date: "2026-08-20",
    energyLevel: 3,
    outputSummary: "Moderate focus; finished one small task.",
  },
  {
    id: "log-002",
    date: "2026-08-21",
    energyLevel: 2,
    outputSummary: "Low energy; mostly admin and email.",
  },
  {
    id: "log-003",
    date: "2026-08-22",
    energyLevel: 4,
    outputSummary: "Strong morning block; shipped a draft.",
  },
  {
    id: "log-004",
    date: "2026-08-23",
    energyLevel: 3,
    outputSummary: "Steady but scattered afternoon.",
  },
  {
    id: "log-005",
    date: "2026-08-24",
    energyLevel: 1,
    outputSummary: "Rest day; minimal output by design.",
  },
];

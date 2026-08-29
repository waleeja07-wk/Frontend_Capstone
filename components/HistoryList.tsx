"use client";

import { useEffect, useState } from "react";
import { getAllCheckIns } from "@/src/lib/storage";
import type { CheckIn } from "@/src/types/checkin";

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRoutineMatch(matchedRoutine: boolean | undefined): string {
  if (matchedRoutine === undefined) {
    return "Not recorded";
  }

  return matchedRoutine ? "Yes" : "No";
}

function sortByDateDesc(checkIns: CheckIn[]): CheckIn[] {
  return [...checkIns].sort((a, b) => b.date.localeCompare(a.date));
}

export function HistoryList() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCheckIns(sortByDateDesc(getAllCheckIns()));
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <p className="mt-8 text-sm text-muted">Loading...</p>;
  }

  if (checkIns.length === 0) {
    return (
      <p className="mt-8 rounded border border-border bg-surface-raised p-5 text-sm text-muted">
        No check-ins yet. Entries from Today will appear here.
      </p>
    );
  }

  return (
    <ul className="mt-8 space-y-4">
      {checkIns.map((checkIn) => (
        <li
          key={checkIn.id}
          className="rounded border border-border bg-surface-raised p-5"
        >
          <p className="text-base font-medium text-foreground">
            {formatDate(checkIn.date)}
          </p>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Energy</dt>
              <dd className="font-medium text-foreground">
                {checkIn.energyLevel}/5
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Output</dt>
              <dd className="font-medium text-foreground">
                {checkIn.outputLevel}/5
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Matched routine</dt>
              <dd className="font-medium text-foreground">
                {formatRoutineMatch(checkIn.matchedRoutine)}
              </dd>
            </div>
            {checkIn.note ? (
              <div>
                <dt className="text-muted">Note</dt>
                <dd className="mt-1 text-foreground">{checkIn.note}</dd>
              </div>
            ) : null}
          </dl>
        </li>
      ))}
    </ul>
  );
}

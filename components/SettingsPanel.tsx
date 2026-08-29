"use client";

import { useEffect, useState } from "react";
import {
  clearAllData,
  getCurrentRoutine,
  getDaysUntilUnlock,
  isRoutineLocked,
} from "@/src/lib/storage";

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function SettingsPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [lockSummary, setLockSummary] = useState<string>(
    "No routine saved yet.",
  );
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const routine = getCurrentRoutine();

    if (!routine) {
      setLockSummary("No routine saved yet.");
    } else if (isRoutineLocked(routine)) {
      const daysRemaining = getDaysUntilUnlock(routine);
      const dayLabel = daysRemaining === 1 ? "day" : "days";
      setLockSummary(
        `Routine edits locked until ${formatDate(routine.lockedUntil)} (${daysRemaining} ${dayLabel} remaining).`,
      );
    } else {
      setLockSummary("Routine edits are available now.");
    }

    setIsLoading(false);
  }, [cleared]);

  function handleClearData() {
    clearAllData();
    setCleared(true);
    setShowConfirmClear(false);
    setLockSummary("No routine saved yet.");
  }

  if (isLoading) {
    return <p className="mt-8 text-sm text-muted">Loading...</p>;
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded border border-border bg-surface-raised p-5">
        <h2 className="text-sm font-medium text-foreground">Routine lock</h2>
        <p className="mt-2 text-sm text-muted">{lockSummary}</p>
      </section>

      <section className="rounded border border-border bg-surface-raised p-5">
        <h2 className="text-sm font-medium text-foreground">Data</h2>
        <p className="mt-2 text-sm text-muted">
          Remove all check-ins and your saved routine from this device.
        </p>

        {showConfirmClear ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-foreground">
              This cannot be undone. Clear all Daybook data on this device?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClearData}
                className="rounded border border-neutral-400 bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:bg-neutral-100"
              >
                Yes, clear all data
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="rounded border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirmClear(true)}
            className="mt-4 rounded border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-50 hover:text-foreground"
          >
            Clear all data
          </button>
        )}
      </section>
    </div>
  );
}

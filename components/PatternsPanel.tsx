"use client";

import { useEffect, useState } from "react";
import { getAllCheckIns } from "@/src/lib/storage";
import type { CheckIn } from "@/src/types/checkin";

const MIN_CHECK_INS = 3;

type InsightResult = {
  insight: string;
  confidence: "low" | "medium" | "high";
};

type LoadState =
  | { status: "loading" }
  | { status: "insufficient" }
  | { status: "success"; insight: InsightResult }
  | { status: "error" };

function toPayload(checkIns: CheckIn[]) {
  return checkIns.map(
    ({ date, energyLevel, outputLevel, matchedRoutine, note }) => ({
      date,
      energyLevel,
      outputLevel,
      matchedRoutine: matchedRoutine ?? false,
      ...(note ? { note } : {}),
    }),
  );
}

export function PatternsPanel() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    async function loadInsight() {
      const checkIns = getAllCheckIns();

      if (checkIns.length < MIN_CHECK_INS) {
        setState({ status: "insufficient" });
        return;
      }

      try {
        const response = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkIns: toPayload(checkIns) }),
        });

        if (!response.ok) {
          setState({ status: "error" });
          return;
        }

        const data: unknown = await response.json();

        if (
          data &&
          typeof data === "object" &&
          typeof (data as InsightResult).insight === "string" &&
          typeof (data as InsightResult).confidence === "string"
        ) {
          setState({ status: "success", insight: data as InsightResult });
          return;
        }

        setState({ status: "error" });
      } catch {
        setState({ status: "error" });
      }
    }

    void loadInsight();
  }, []);

  if (state.status === "loading") {
    return <p className="mt-8 text-sm text-muted">Loading...</p>;
  }

  if (state.status === "insufficient") {
    return (
      <p className="mt-8 rounded border border-border bg-surface-raised p-5 text-sm text-muted">
        Log a few more days to see your patterns.
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p className="mt-8 rounded border border-border bg-surface-raised p-5 text-sm text-muted">
        Couldn&apos;t generate insights right now.
      </p>
    );
  }

  return (
    <div className="mt-8 rounded border border-border bg-surface-raised p-5">
      <p className="text-sm text-muted">Observation</p>
      <p className="mt-3 text-base leading-relaxed text-foreground">
        {state.insight.insight}
      </p>
      <p className="mt-4 text-xs uppercase tracking-wide text-muted">
        Confidence: {state.insight.confidence}
      </p>
    </div>
  );
}

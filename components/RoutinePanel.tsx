"use client";

import { useEffect, useState } from "react";
import { RoutineForm } from "@/components/RoutineForm";
import { RoutineLockedView } from "@/components/RoutineLockedView";
import {
  getCurrentRoutine,
  isRoutineLocked,
  saveRoutine,
} from "@/src/lib/storage";
import type { Routine } from "@/src/types/routine";

export function RoutinePanel() {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setRoutine(getCurrentRoutine());
    setIsLoading(false);
  }, []);

  function handleSave(items: string[]) {
    const saved = saveRoutine(items);
    setRoutine(saved);
  }

  if (isLoading) {
    return <p className="mt-8 text-sm text-muted">Loading...</p>;
  }

  if (!routine) {
    return (
      <RoutineForm
        submitLabel="Save routine"
        onSave={handleSave}
      />
    );
  }

  if (isRoutineLocked(routine)) {
    return <RoutineLockedView routine={routine} />;
  }

  return (
    <RoutineForm
      initialItems={routine.items}
      submitLabel="Update routine"
      onSave={handleSave}
    />
  );
}

"use client";

import { useState } from "react";
import type { RatingLevel } from "@/src/types/checkin";
import type { SaveCheckInInput } from "@/src/lib/storage";
import { RatingInput } from "./RatingInput";

type CheckInFormProps = {
  onSubmit: (input: SaveCheckInInput) => void;
};

export function CheckInForm({ onSubmit }: CheckInFormProps) {
  const [energyLevel, setEnergyLevel] = useState<RatingLevel | null>(null);
  const [outputLevel, setOutputLevel] = useState<RatingLevel | null>(null);
  const [note, setNote] = useState("");

  const canSubmit = energyLevel !== null && outputLevel !== null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (energyLevel === null || outputLevel === null) {
      return;
    }

    onSubmit({
      energyLevel,
      outputLevel,
      note: note.trim() || undefined,
    });
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <RatingInput
        label="Energy"
        name="energy"
        value={energyLevel}
        onChange={setEnergyLevel}
      />

      <RatingInput
        label="Output"
        name="output"
        value={outputLevel}
        onChange={setOutputLevel}
      />

      <div>
        <label
          htmlFor="note"
          className="text-sm font-medium text-foreground"
        >
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Anything worth noting about today..."
          className="mt-2 w-full rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus:border-primary focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-muted disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500"
      >
        Save check-in
      </button>
    </form>
  );
}

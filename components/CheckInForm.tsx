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
  const [matchedRoutine, setMatchedRoutine] = useState<boolean | null>(null);
  const [note, setNote] = useState("");

  const canSubmit =
    energyLevel !== null &&
    outputLevel !== null &&
    matchedRoutine !== null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      energyLevel === null ||
      outputLevel === null ||
      matchedRoutine === null
    ) {
      return;
    }

    onSubmit({
      energyLevel,
      outputLevel,
      matchedRoutine,
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

      <fieldset>
        <legend className="text-sm font-medium text-foreground">
          Did today match my planned routine?
        </legend>
        <div className="mt-2 flex gap-2">
          {[true, false].map((value) => {
            const isSelected = matchedRoutine === value;
            const label = value ? "Yes" : "No";

            return (
              <button
                key={label}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setMatchedRoutine(value)}
                className={`rounded border px-4 py-2 text-sm transition-colors ${
                  isSelected
                    ? "border-primary bg-neutral-100 text-foreground"
                    : "border-border bg-surface-raised text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="note" className="text-sm font-medium text-foreground">
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Brief note about today"
          className="mt-2 w-full rounded border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus:border-primary focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded border border-primary bg-surface-raised px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400"
      >
        Save check-in
      </button>
    </form>
  );
}

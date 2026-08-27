import type { RatingLevel } from "@/src/types/checkin";

const LEVELS: RatingLevel[] = [1, 2, 3, 4, 5];

type RatingInputProps = {
  label: string;
  name: string;
  value: RatingLevel | null;
  onChange: (value: RatingLevel) => void;
};

export function RatingInput({ label, name, value, onChange }: RatingInputProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div
        className="mt-2 flex gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {LEVELS.map((level) => {
          const isSelected = value === level;

          return (
            <button
              key={level}
              type="button"
              name={name}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(level)}
              className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm transition-colors ${
                isSelected
                  ? "border-primary bg-neutral-100 text-primary"
                  : "border-border bg-surface-raised text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {level}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

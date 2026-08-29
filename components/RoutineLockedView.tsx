import type { Routine } from "@/src/types/routine";
import { getDaysUntilUnlock } from "@/src/lib/storage";

type RoutineLockedViewProps = {
  routine: Routine;
};

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function RoutineLockedView({ routine }: RoutineLockedViewProps) {
  const daysRemaining = getDaysUntilUnlock(routine);
  const unlockDate = formatDate(routine.lockedUntil);
  const dayLabel = daysRemaining === 1 ? "day" : "days";

  return (
    <div className="mt-8 space-y-4">
      <p className="rounded border border-border bg-surface-raised p-4 text-sm text-muted">
        Locked until {unlockDate}. {daysRemaining} {dayLabel} remaining.
      </p>

      <ul className="space-y-2">
        {routine.items.map((item, index) => (
          <li
            key={`${routine.id}-${index}`}
            className="rounded border border-border bg-surface-raised px-4 py-3 text-sm text-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

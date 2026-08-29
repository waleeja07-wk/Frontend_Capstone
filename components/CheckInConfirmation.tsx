import type { CheckIn } from "@/src/types/checkin";

type CheckInConfirmationProps = {
  checkIn: CheckIn;
};

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CheckInConfirmation({ checkIn }: CheckInConfirmationProps) {
  return (
    <div className="mt-8 rounded border border-border bg-surface-raised p-5">
      <p className="text-sm text-muted">Recorded for today</p>
      <p className="mt-1 text-base font-medium text-foreground">
        {formatDate(checkIn.date)}
      </p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Energy</dt>
          <dd className="font-medium text-foreground">{checkIn.energyLevel}/5</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Output</dt>
          <dd className="font-medium text-foreground">{checkIn.outputLevel}/5</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Matched routine</dt>
          <dd className="font-medium text-foreground">
            {checkIn.matchedRoutine === undefined
              ? "Not recorded"
              : checkIn.matchedRoutine
                ? "Yes"
                : "No"}
          </dd>
        </div>
        {checkIn.note ? (
          <div>
            <dt className="text-muted">Note</dt>
            <dd className="mt-1 text-foreground">{checkIn.note}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

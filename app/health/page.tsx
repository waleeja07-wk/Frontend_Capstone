import { headers } from "next/headers";
import type { DailyLogEntry } from "@/lib/types";

async function fetchDailyLogs(): Promise<DailyLogEntry[]> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const response = await fetch(`${protocol}://${host}/api/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch health data");
  }

  return response.json();
}

export default async function HealthPage() {
  const logs = await fetchDailyLogs();

  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
        Health
      </h1>
      <p className="mt-3 text-muted">
        Data-fetching check — mock daily log entries from{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
          /api/health
        </code>
        .
      </p>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-surface-raised">
        {logs.map((log) => (
          <li key={log.id} className="px-4 py-3">
            <p className="text-sm font-medium text-foreground">{log.date}</p>
            <p className="mt-1 text-sm text-muted">
              Energy: {log.energyLevel}/5 — {log.outputSummary}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

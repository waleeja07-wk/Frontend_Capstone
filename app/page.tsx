"use client";

import { CheckInForm } from "@/components/CheckInForm";
import { saveCheckIn } from "@/src/lib/storage";

export default function TodayPage() {
  function handleSubmit(input: Parameters<typeof saveCheckIn>[0]) {
    saveCheckIn(input);
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
        Today
      </h1>
      <p className="mt-3 text-muted">
        Log your energy and output for today. One check-in per day.
      </p>

      <CheckInForm onSubmit={handleSubmit} />
    </section>
  );
}

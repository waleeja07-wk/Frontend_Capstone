"use client";

import { useEffect, useState } from "react";
import { CheckInConfirmation } from "@/components/CheckInConfirmation";
import { CheckInForm } from "@/components/CheckInForm";
import { getTodayCheckIn, saveCheckIn } from "@/src/lib/storage";
import type { CheckIn } from "@/src/types/checkin";

export default function TodayPage() {
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCheckIn(getTodayCheckIn());
    setIsLoading(false);
  }, []);

  function handleSubmit(input: Parameters<typeof saveCheckIn>[0]) {
    const saved = saveCheckIn(input);
    setCheckIn(saved);
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
        Today
      </h1>
      <p className="mt-3 text-muted">
        Log your energy and output for today. One check-in per day.
      </p>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted">Loading...</p>
      ) : checkIn ? (
        <CheckInConfirmation checkIn={checkIn} />
      ) : (
        <CheckInForm onSubmit={handleSubmit} />
      )}
    </section>
  );
}

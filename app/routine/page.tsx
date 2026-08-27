import { RoutinePanel } from "@/components/RoutinePanel";

export default function RoutinePage() {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
        Routine
      </h1>
      <p className="mt-3 text-muted">
        Your anchor tasks, locked in place for a set period so you can focus
        on doing them—not redesigning them every day.
      </p>

      <RoutinePanel />
    </section>
  );
}

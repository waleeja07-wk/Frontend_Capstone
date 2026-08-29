import { PatternsPanel } from "@/components/PatternsPanel";

export default function PatternsPage() {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
        Patterns
      </h1>
      <p className="mt-3 text-muted">
        A plain read on what your check-ins suggest so far.
      </p>

      <PatternsPanel />
    </section>
  );
}

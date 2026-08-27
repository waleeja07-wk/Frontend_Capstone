import { HistoryList } from "@/components/HistoryList";

export default function HistoryPage() {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
        History
      </h1>
      <p className="mt-3 text-muted">
        Past daily check-ins, most recent first.
      </p>

      <HistoryList />
    </section>
  );
}

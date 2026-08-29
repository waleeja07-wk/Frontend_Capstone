import { SettingsPanel } from "@/components/SettingsPanel";

export default function SettingsPage() {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
        Settings
      </h1>
      <p className="mt-3 text-muted">
        Routine lock status and local data controls.
      </p>

      <SettingsPanel />
    </section>
  );
}

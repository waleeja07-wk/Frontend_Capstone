import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          FlyRank Capstone
        </h1>
        <p className="mt-2 text-muted">
          Build and manage your account settings with validated forms.
        </p>
      </div>
      <Link
        href="/settings"
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Open Settings
      </Link>
    </main>
  );
}

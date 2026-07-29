import Link from "next/link";
import SettingsForm from '@/components/SettingsForm'

export default function SettingsPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            ← Back home
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-2 text-muted">
            Manage your profile and notification preferences.
          </p>
        </header>

        <SettingsForm />
      </div>
    </main>
  );
}

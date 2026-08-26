import Link from "next/link";
import { MobileNavMenu } from "./MobileNavMenu";

const navLinks = [
  { href: "/", label: "Today" },
  { href: "/routine", label: "Routine" },
  { href: "/patterns", label: "Patterns" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
] as const;

export function NavBar() {
  return (
    <header className="relative border-b border-border bg-surface-raised">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link
          href="/"
          className="text-lg font-medium tracking-tight text-primary md:text-xl"
        >
          Daybook
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNavMenu links={[...navLinks]} />
      </div>
    </header>
  );
}

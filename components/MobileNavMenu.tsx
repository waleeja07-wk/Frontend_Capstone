"use client";

import Link from "next/link";
import { useState } from "react";

type NavLink = {
  href: string;
  label: string;
};

type MobileNavMenuProps = {
  links: NavLink[];
};

export function MobileNavMenu({ links }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-foreground"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        Menu
      </button>

      {isOpen ? (
        <nav
          id="mobile-nav-menu"
          aria-label="Mobile"
          className="absolute left-0 right-0 top-full z-20 border-b border-border bg-surface-raised px-4 py-3 shadow-sm"
        >
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-2 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}

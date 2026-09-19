import Link from "next/link";
import { getAppName } from "@/lib/env";

/**
 * Server Component (no "use client"), so it renders on the server.
 *
 * `getAppName()` reads NEXT_PUBLIC_APP_NAME. Because that name starts with
 * NEXT_PUBLIC_, the same call would also work inside a Client Component —
 * the value is baked into the JavaScript bundle at build time.
 */

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
  { href: "/status", label: "Status" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-[#fffbf5]/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden className="text-xl">🍜</span>
          <span className="text-stone-900">{getAppName()}</span>
        </Link>

        <ul className="flex items-center gap-1 text-sm sm:ml-auto">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-lg px-3 py-1.5 font-medium text-stone-600 transition-colors hover:bg-amber-100 hover:text-amber-900"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

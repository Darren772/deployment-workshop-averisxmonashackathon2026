import Link from "next/link";
import { getAppName } from "@/lib/env";

/**
 * Landing page. A Server Component (the default in the App Router), so this
 * code runs on the server and only the resulting HTML reaches the browser.
 */

const DESTINATIONS = [
  {
    href: "/dashboard",
    emoji: "🍽️",
    title: "Dashboard",
    description:
      "Browse 12 food spots fetched from our own API route, with a cuisine filter.",
    teaches: "Client-side fetching",
  },
  {
    href: "/admin",
    emoji: "🔒",
    title: "Admin",
    description:
      "Fake stats behind HTTP Basic Auth. Your browser will ask for a password.",
    teaches: "Protecting a route",
  },
  {
    href: "/status",
    emoji: "🩺",
    title: "Status",
    description:
      "Checks every environment variable is wired up — without ever printing a value.",
    teaches: "Debugging a deploy",
  },
] as const;

export default function HomePage() {
  const appName = getAppName();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/*
        The banner below proves NEXT_PUBLIC_APP_NAME made it into the build.
        Change it in .env.local, restart `npm run dev`, and watch it update.
      */}
      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
        <span aria-hidden>📣</span>
        <span className="text-amber-900">
          Running as{" "}
          <strong className="font-semibold">{appName}</strong>
        </span>
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs text-amber-800">
          NEXT_PUBLIC_APP_NAME
        </code>
      </div>

      {/* Hero */}
      <section className="py-14 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
          Malaysian food, mapped
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
          Find the good{" "}
          <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            makan
          </span>{" "}
          near you.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
          {appName} is a deliberately small Next.js app built for a deployment
          workshop. It has pages, an API route, a password-protected area, and
          four environment variables — everything you need to practise shipping
          to Vercel, and nothing you don&apos;t.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
          >
            Browse food spots →
          </Link>
          <Link
            href="/status"
            className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
          >
            Check my env vars
          </Link>
        </div>
      </section>

      {/* Where to go next */}
      <section className="pb-16">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-400">
          Three pages, three lessons
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {DESTINATIONS.map((destination) => (
            <Link
              key={destination.href}
              href={destination.href}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
            >
              <span aria-hidden className="text-2xl">{destination.emoji}</span>
              <h3 className="mt-3 font-semibold text-stone-900">
                {destination.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                {destination.description}
              </p>
              <span className="mt-4 text-xs font-medium uppercase tracking-wide text-amber-700">
                {destination.teaches}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

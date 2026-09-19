import { places, CUISINES } from "@/data/places";
import { getDeploymentEnv } from "@/lib/server-env";

/**
 * Admin dashboard.
 *
 * There is NO auth check in this file — and that's the point. By the time
 * this component renders, `proxy.ts` has already verified the HTTP Basic Auth
 * credentials. If they were wrong, the request never reached here.
 *
 * Look at `proxy.ts` to see the actual gate.
 */

// Env vars are read at request time, so don't pre-render this at build time.
export const dynamic = "force-dynamic";

/** Made-up submissions queue, so the page has something to show. */
const RECENT_SUBMISSIONS = [
  { name: "Mee Rebus Abu Bakar", area: "Johor Bahru", submittedBy: "aisyah", ago: "2 hours ago" },
  { name: "Sup Torpedo Pak Man", area: "Shah Alam", submittedBy: "wei_jie", ago: "5 hours ago" },
  { name: "Kuey Teow Th'ng Kampar", area: "Kampar, Perak", submittedBy: "meera", ago: "yesterday" },
  { name: "Roti John Special", area: "Kota Bharu", submittedBy: "danial", ago: "2 days ago" },
] as const;

/** Counts how many spots we have per cuisine and returns the biggest. */
function findTopCuisine() {
  const counts = CUISINES.map((cuisine) => ({
    cuisine,
    count: places.filter((place) => place.cuisine === cuisine).length,
  }));

  return counts.reduce((leader, current) =>
    current.count > leader.count ? current : leader,
  );
}

export default function AdminPage() {
  const topCuisine = findTopCuisine();
  const averageRating =
    places.reduce((total, place) => total + place.rating, 0) / places.length;

  const stats = [
    { label: "Total spots", value: String(places.length), hint: "in data/places.ts" },
    {
      label: "Top cuisine",
      value: topCuisine.cuisine,
      hint: `${topCuisine.count} spots listed`,
    },
    {
      label: "Average rating",
      value: averageRating.toFixed(2),
      hint: "out of 5.00",
    },
    {
      label: "Pending submissions",
      value: String(RECENT_SUBMISSIONS.length),
      hint: "awaiting review",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Admin</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800 ring-1 ring-green-200">
          <span aria-hidden>🔓</span> Authenticated
        </span>
      </div>

      <p className="mt-2 max-w-2xl text-stone-600">
        You got past HTTP Basic Auth, which means{" "}
        <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-sm">
          ADMIN_PASSWORD
        </code>{" "}
        is set correctly in the{" "}
        <span className="font-semibold">{getDeploymentEnv()}</span> environment.
      </p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-stone-500">{stat.hint}</p>
          </div>
        ))}
      </div>

      {/* Submissions */}
      <h2 className="mt-12 text-sm font-semibold uppercase tracking-widest text-stone-400">
        Recent submissions
      </h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <ul className="divide-y divide-stone-100">
          {RECENT_SUBMISSIONS.map((submission) => (
            <li
              key={submission.name}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4"
            >
              <div>
                <p className="font-medium text-stone-900">{submission.name}</p>
                <p className="text-sm text-stone-500">{submission.area}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-mono text-stone-600">@{submission.submittedBy}</p>
                <p className="text-stone-400">{submission.ago}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-sm text-stone-500">
        Submissions are hard-coded placeholder data — this demo has no database.
      </p>
    </div>
  );
}

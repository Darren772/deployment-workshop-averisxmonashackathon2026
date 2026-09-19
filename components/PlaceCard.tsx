import type { Place } from "@/data/places";

/**
 * One food spot, rendered as a card.
 *
 * This component only receives data through props, so it works in both
 * Server and Client Components. The /dashboard page is a Client Component
 * and renders these with data it fetched from /api/places.
 */
export function PlaceCard({ place }: { place: Place }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span aria-hidden className="text-3xl">{place.emoji}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
          <span aria-hidden>★</span>
          {place.rating.toFixed(1)}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-stone-900">{place.name}</h3>
      <p className="mt-0.5 text-sm text-stone-500">{place.area}</p>

      <p className="mt-3 text-sm leading-relaxed text-stone-600">{place.blurb}</p>

      <dl className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <dt className="sr-only">Cuisine</dt>
        <dd className="rounded-md bg-stone-100 px-2 py-1 font-medium text-stone-700">
          {place.cuisine}
        </dd>
        <dt className="sr-only">Price range</dt>
        <dd className="rounded-md bg-stone-100 px-2 py-1 font-mono font-medium text-stone-700">
          {place.priceRange}
        </dd>
      </dl>

      <p className="mt-auto pt-4 text-sm font-medium text-amber-800">
        Must try: {place.signatureDish}
      </p>
    </article>
  );
}

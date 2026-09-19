"use client";

import { useEffect, useState } from "react";
import { PlaceCard } from "@/components/PlaceCard";
import { CUISINES, type Place } from "@/data/places";

/**
 * "use client" at the top makes this a Client Component: it ships to the
 * browser and can use hooks like useState/useEffect.
 *
 * Because this code runs in the browser, it CANNOT read MAKAN_API_SECRET.
 * Instead it calls our own /api/places route, and that route — running on the
 * server — is the one that uses the secret. This is the standard pattern:
 *
 *     browser  →  /api/places (server, holds the secret)  →  data
 *
 * The secret never leaves the server.
 */

/** Shape of the JSON that /api/places sends back. */
type PlacesResponse = {
  count: number;
  cuisine: string;
  places: Place[];
};

export default function DashboardPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [cuisine, setCuisine] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Re-runs whenever `cuisine` changes, so picking a filter refetches.
  useEffect(() => {
    // Lets us ignore a slow response if the user changed the filter again.
    const controller = new AbortController();

    async function loadPlaces() {
      setIsLoading(true);
      setError(null);

      try {
        const url =
          cuisine === "All"
            ? "/api/places"
            : `/api/places?cuisine=${encodeURIComponent(cuisine)}`;

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          // This is what you'd see if MAKAN_API_SECRET were missing.
          throw new Error(`API responded with ${response.status}`);
        }

        const data: PlacesResponse = await response.json();
        setPlaces(data.places);
      } catch (caught) {
        // An aborted request isn't a real error — just a superseded one.
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "Something went wrong");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadPlaces();
    return () => controller.abort();
  }, [cuisine]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Food spots
          </h1>
          <p className="mt-2 text-stone-600">
            Fetched in your browser from{" "}
            <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-sm">
              /api/places
            </code>
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-stone-700">Cuisine</span>
          <select
            value={cuisine}
            onChange={(event) => setCuisine(event.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 font-medium text-stone-800 shadow-sm transition-colors hover:border-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="All">All cuisines</option>
            {CUISINES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </header>

      {/* Loading state: skeleton cards keep the layout from jumping. */}
      {isLoading && (
        <div
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">Loading food spots…</span>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-2xl border border-stone-200 bg-white/60"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-900">Couldn&apos;t load food spots</h2>
          <p className="mt-1 text-sm text-red-800">{error}</p>
          <p className="mt-3 text-sm text-red-700">
            The most likely cause is a missing{" "}
            <code className="font-mono">MAKAN_API_SECRET</code>. Visit{" "}
            <a href="/status" className="font-semibold underline">
              /status
            </a>{" "}
            to check.
          </p>
        </div>
      )}

      {/* Success state */}
      {!isLoading && !error && (
        <>
          <p className="mt-8 text-sm text-stone-500">
            {places.length} {places.length === 1 ? "spot" : "spots"}
            {cuisine !== "All" && ` · ${cuisine}`}
          </p>

          {places.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
              No spots for this cuisine yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

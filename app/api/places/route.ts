import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { places } from "@/data/places";
import { getApiVersion } from "@/lib/env";
import { getWeatherForCities, MissingApiKeyError } from "@/lib/weather";

/**
 * GET /api/places            → all 12 food spots, with live weather
 * GET /api/places?cuisine=Malay → only Malay spots
 *
 * This file is a Route Handler. It runs ONLY on the server — on your laptop
 * during `npm run dev`, and on Vercel's servers after you deploy. Its code is
 * never sent to the browser, which is exactly why it's safe to use a real API
 * key here.
 *
 * The browser asks US for food spots; WE ask weatherapi.com. The key never
 * travels to the browser, so nobody can steal your quota.
 */

// Don't cache the route itself — but note that the individual weather fetches
// inside getWeatherForCities() ARE cached for 10 minutes. See lib/weather.ts.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Step 1 — Read the optional ?cuisine= filter from the URL.
  const cuisine = request.nextUrl.searchParams.get("cuisine");

  const results =
    cuisine && cuisine !== "All"
      ? places.filter((place) => place.cuisine.toLowerCase() === cuisine.toLowerCase())
      : places;

  // Step 2 — Look up live weather for the cities these spots are in.
  let weather;
  try {
    weather = await getWeatherForCities(results.map((place) => place.city));
  } catch (error) {
    /**
     * Only ONE thing lands here: the key isn't configured at all.
     * Everything else (bad key, rate limit, network down) is handled inside
     * getWeatherForCities and degrades gracefully instead of throwing.
     *
     * This is the error you'll hit if you deploy and forget to add
     * MAKAN_API_SECRET in the Vercel dashboard.
     */
    if (error instanceof MissingApiKeyError) {
      return NextResponse.json(
        {
          error: "Server misconfigured",
          // Report the NAME of the missing variable, never a value.
          detail:
            "MAKAN_API_SECRET is not set. Add it to .env.local locally, or to Project Settings → Environment Variables on Vercel.",
        },
        { status: 500 },
      );
    }
    throw error;
  }

  // Step 3 — Attach each spot's city weather to the spot itself, so the
  // browser doesn't need to know about our city-grouping trick.
  const placesWithWeather = results.map((place) => ({
    ...place,
    weather: weather.byCity[place.city] ?? null,
  }));

  // Step 4 — Respond, stamping the public API version onto a custom header.
  // Open DevTools → Network → /api/places → Headers to see it.
  return NextResponse.json(
    {
      count: placesWithWeather.length,
      cuisine: cuisine ?? "All",
      // Tells the dashboard whether to show a "weather unavailable" note.
      weather: { ok: weather.ok, reason: weather.reason },
      places: placesWithWeather,
    },
    {
      headers: {
        "X-Api-Version": getApiVersion(),
      },
    },
  );
}

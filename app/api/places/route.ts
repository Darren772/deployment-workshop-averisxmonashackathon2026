import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { places } from "@/data/places";
import { getMakanApiSecret } from "@/lib/server-env";
import { getApiVersion } from "@/lib/env";

/**
 * GET /api/places            → all 12 food spots
 * GET /api/places?cuisine=Malay → only Malay spots
 *
 * This file is a Route Handler. It runs ONLY on the server — on your laptop
 * during `npm run dev`, and on Vercel's servers after you deploy. Its code is
 * never sent to the browser, which is exactly why it's safe to read a secret
 * here.
 */

// Don't cache: we want the secret check and the filter to run on every request.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  /**
   * Step 1 — Check the server-only secret.
   *
   * In a real app you'd now call a paid API with this key. Here we just prove
   * it exists, which is enough to demonstrate the important part: if you forget
   * to add MAKAN_API_SECRET in the Vercel dashboard, this endpoint fails loudly
   * in production instead of silently returning nothing.
   */
  const apiSecret = getMakanApiSecret();

  if (!apiSecret) {
    return NextResponse.json(
      {
        error: "Server misconfigured",
        // Note we report the NAME of the missing variable, never a value.
        detail:
          "MAKAN_API_SECRET is not set. Add it to .env.local locally, or to Project Settings → Environment Variables on Vercel.",
      },
      { status: 500 },
    );
  }

  // Step 2 — Read the optional ?cuisine= filter from the URL.
  const cuisine = request.nextUrl.searchParams.get("cuisine");

  const results =
    cuisine && cuisine !== "All"
      ? places.filter((place) => place.cuisine.toLowerCase() === cuisine.toLowerCase())
      : places;

  // Step 3 — Respond, stamping the public API version onto a custom header.
  // Open DevTools → Network → /api/places → Headers to see it.
  return NextResponse.json(
    {
      count: results.length,
      cuisine: cuisine ?? "All",
      places: results,
    },
    {
      headers: {
        "X-Api-Version": getApiVersion(),
      },
    },
  );
}

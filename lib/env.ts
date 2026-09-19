/**
 * lib/env.ts  —  PUBLIC environment variables (safe to use anywhere)
 *
 * ────────────────────────────────────────────────────────────────
 * THE ONE RULE OF NEXT.JS ENV VARS
 * ────────────────────────────────────────────────────────────────
 * A variable whose name starts with `NEXT_PUBLIC_` is INLINED into the
 * JavaScript bundle that browsers download. Anyone can read it with
 * View Source. Use it for non-secret config only: app names, versions,
 * public URLs, analytics IDs.
 *
 * Everything else (no `NEXT_PUBLIC_` prefix) stays on the server and is
 * stripped out of the browser bundle. See `lib/server-env.ts`.
 *
 * Note: `process.env.NEXT_PUBLIC_X` must be written out literally like
 * below. Next.js does a find-and-replace at build time, so a dynamic
 * lookup such as `process.env["NEXT_PUBLIC_" + key]` will NOT work.
 */

/** The name shown in the header and hero banner. */
export function getAppName(): string {
  return process.env.NEXT_PUBLIC_APP_NAME ?? "MakanFinder";
}

/** Version string we stamp onto API responses via the X-Api-Version header. */
export function getApiVersion(): string {
  return process.env.NEXT_PUBLIC_API_VERSION ?? "unknown";
}

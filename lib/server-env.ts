/**
 * lib/server-env.ts  —  SERVER-ONLY environment variables
 *
 * ⚠️ Never import this file from a Client Component (a file with
 * "use client" at the top). These values must never reach the browser.
 *
 * Why it's safe here: every function below is only called from Server
 * Components (`app/status/page.tsx`) and Route Handlers
 * (`app/api/places/route.ts`), which run on Vercel's servers. Next.js
 * strips non-`NEXT_PUBLIC_` variables out of the client bundle entirely,
 * so even a mistake tends to produce `undefined` rather than a leak —
 * but the habit of keeping secrets in one clearly-labelled server file
 * is what actually protects you.
 *
 * Nothing in this file ever RETURNS a secret value. It only reports
 * whether one is present, which is all the /status page needs.
 */

/**
 * A REAL API key for weatherapi.com, used by lib/weather.ts to look up live
 * weather for each food spot's city.
 *
 * This is a genuine credential: if it leaks, someone else can spend your
 * quota. Get a free one at https://www.weatherapi.com/signup.aspx
 */
export function getMakanApiSecret(): string | undefined {
  return process.env.MAKAN_API_SECRET;
}

/** Password for HTTP Basic Auth on /admin. Checked in `proxy.ts`. */
export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

/**
 * Which environment we're running in.
 * Vercel sets VERCEL_ENV automatically to "production" | "preview" | "development".
 * On your laptop it isn't set at all, so we report "local".
 */
export function getDeploymentEnv(): string {
  return process.env.VERCEL_ENV ?? "local";
}

/**
 * The git commit this deployment was built from, shortened to 7 characters
 * the way git does. Also set automatically by Vercel; absent locally.
 */
export function getCommitSha(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  return sha ? sha.slice(0, 7) : "local";
}

/** Names of the variables the /status page checks. */
export const TRACKED_ENV_VARS = [
  {
    name: "MAKAN_API_SECRET",
    kind: "secret",
    description:
      "Real weatherapi.com key. Used server-side for live weather; never sent to the browser.",
  },
  {
    name: "ADMIN_PASSWORD",
    kind: "secret",
    description: "Password for HTTP Basic Auth on /admin.",
  },
  {
    name: "NEXT_PUBLIC_APP_NAME",
    kind: "public",
    description: "App name shown in the header. Visible in the browser.",
  },
  {
    name: "NEXT_PUBLIC_API_VERSION",
    kind: "public",
    description: "Version stamped on API responses. Visible in the browser.",
  },
] as const;

/**
 * Checks each tracked variable and reports ONLY whether it is set.
 * We deliberately never return the value itself — that is the whole point
 * of the /status page: prove the wiring works without exposing anything.
 */
export function getEnvReport() {
  return TRACKED_ENV_VARS.map((variable) => ({
    ...variable,
    // A variable set to an empty string counts as missing.
    isSet: Boolean(process.env[variable.name]),
  }));
}

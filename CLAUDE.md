# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

MakanFinder — a teaching demo for a beginner "deploy to Vercel" workshop, not a product. Every feature exists to illustrate one deployment concept. When changing code here, **clarity for a first-time Next.js user outweighs cleverness**: keep the explanatory comments, keep the folder structure flat, and don't add dependencies (the app intentionally has zero beyond Next/React/Tailwind).

There is no database. `data/places.ts` is the "database", enriched at request
time with live weather from weatherapi.com.

## Commands

```bash
npm run dev          # dev server on :3000
npm run build        # production build — must stay at zero errors/warnings
npm start            # serve the production build (run build first)
npm run lint         # eslint
```

There are no tests.

**Next 16 allows only one `next dev` per directory.** A second one exits with "Another next dev server is already running" and prints the PID to kill. To test a different environment, stop the first server rather than using another port.

To exercise the missing-env failure paths (the app's main teaching moment), override with empty values — real `process.env` entries take precedence over `.env.local`:

```bash
MAKAN_API_SECRET= ADMIN_PASSWORD= npx next dev
```

Expected: `/api/places` → 500, `/admin` → 500, `/status` → "2 of 4 missing".

`MAKAN_API_SECRET` is a **real weatherapi.com key**, not a placeholder. Working
on the weather code without one: the app degrades gracefully (spots render,
`weather.ok` is false), so most changes are testable keyless. To verify the
happy path without a key, mock the upstream — it returns
`{location, current:{temp_c, is_day, condition:{text, code}}}` and `401` with
`{error:{code, message}}` on a bad key.

## Architecture

The whole app is built around one idea: **secrets stay on the server, `NEXT_PUBLIC_` values reach the browser.**

Env access is deliberately split into two modules, and this split is the point of the demo:

- `lib/env.ts` — only `NEXT_PUBLIC_*`. Safe to import from anywhere.
- `lib/server-env.ts` — secrets and Vercel-injected vars. **Never import this from a file with `"use client"`.** `getEnvReport()` returns only booleans; nothing here ever returns a secret value to a caller that renders it.

The data flow that makes this concrete:

```
/dashboard ("use client", can't see secrets)
    → fetch("/api/places")
        → route.ts + lib/weather.ts use MAKAN_API_SECRET (server-only)
            → data/places.ts  +  weatherapi.com
```

Never "simplify" `/dashboard` by importing `data/places.ts` directly, and never
let it call weatherapi.com itself — either change puts the key in the browser
and deletes the lesson.

`lib/weather.ts` is server-only (it reads the key). The `Weather` and
`PlaceWithWeather` types therefore live in `data/places.ts`, which is
client-safe, so the dashboard never imports the weather module.

### Two failure modes, handled differently on purpose

- **Key missing** → `MissingApiKeyError` → `/api/places` returns 500. Loud,
  because it means "you forgot to set it in Vercel".
- **Key rejected / rate-limited / network down** → caught inside
  `getWeatherForCities`, returns `ok:false` + a reason. Spots still render
  without weather.

Don't collapse these into one path. A flaky third-party API taking down the
whole page is the anti-pattern the split exists to teach.

Weather is fetched **once per city**, not once per spot (7 calls, not 12) —
see `CITIES` in `data/places.ts`. Each fetch sets `next: { revalidate: 600 }`,
which still applies even though the route is `force-dynamic`.

`process.env.NEXT_PUBLIC_X` must be written as a literal expression (Next find-and-replaces it at build time); dynamic lookups like `process.env["NEXT_PUBLIC_" + k]` silently fail on the client. The dynamic lookup in `getEnvReport()` is fine only because that code runs server-side.

### Auth

`proxy.ts` (project root) gates `/admin` with HTTP Basic Auth before the page renders. `app/admin/page.tsx` contains **no auth check by design** — the gate lives entirely in `proxy.ts`.

This is Next 16, where the `middleware.ts` convention was renamed to `proxy.ts` (function `proxy`, not `middleware`). Using `middleware.ts` still works but prints a deprecation warning on every build — unacceptable for a live workshop, so keep this file named `proxy.ts`. Both names present at once is a hard build error.

Proxy runs on the Node.js runtime in Next 16; setting `runtime` in a proxy file throws.

### Rendering

`/admin`, `/status`, and both API routes set `export const dynamic = "force-dynamic"` so `process.env` and timestamps are read per request rather than frozen into the build. Removing that would make `/status` report build-time state, which defeats its purpose.

## Env vars

`MAKAN_API_SECRET` (a real weatherapi.com key) and `ADMIN_PASSWORD` are server-only; `NEXT_PUBLIC_APP_NAME` and `NEXT_PUBLIC_API_VERSION` are public. `VERCEL_ENV` and `VERCEL_GIT_COMMIT_SHA` are injected by Vercel and fall back to `"local"`.

`.env.example` is committed on purpose (`.gitignore` has `!.env.example`); `.env.local` is ignored. If you touch the `.gitignore` env block, re-verify with `git check-ignore -v .env.local .env.example` — a `!` prefix on the matched line means *not* ignored.

Adding a fifth variable means updating: `.env.example`, `.env.local`, `TRACKED_ENV_VARS` in `lib/server-env.ts`, and the env table in `README.md`.

## Styling

Tailwind v4 (CSS-first, configured via `@theme` in `app/globals.css` — there is no `tailwind.config.js`). Stock `stone`/`amber` palette only, so beginners can look up every class. The app deliberately **does not** follow OS dark mode — one fixed light theme so every laptop in the room renders identically. Don't add a `prefers-color-scheme` block back.

## README

`README.md` is workshop material that attendees read start-to-finish. Keep the Deploy-to-Vercel steps and the troubleshooting section in sync with any behaviour change.

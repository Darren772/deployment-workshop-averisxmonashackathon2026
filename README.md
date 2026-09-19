# 🍜 MakanFinder

A deliberately small Next.js app for the **Averis × Monash Hackathon 2026** deployment workshop.

It exists to teach four things you need for any real deployment:

1. Pages and navigation (App Router)
2. Calling your own API route from the browser
3. Protecting a route with a password
4. **Environment variables** — which ones are secret, which ones leak to the browser, and why your app breaks after you deploy

No database. No external APIs. No accounts to sign up for.

---

## What's in it

| Route | What it does | What it teaches |
| --- | --- | --- |
| `/` | Hero + links to the other pages, with a banner showing `NEXT_PUBLIC_APP_NAME` | Public env vars are visible in the browser |
| `/dashboard` | Client page that fetches 12 food spots and filters them by cuisine | Browser → your API route → data |
| `/admin` | Fake stats behind HTTP Basic Auth (username `admin`) | Protecting a route before it renders |
| `/status` | ✅ / ❌ for every env var, plus `VERCEL_ENV` and the commit SHA | Debugging a broken deploy |
| `/api/places` | Server route that checks `MAKAN_API_SECRET`, then returns mocked data | Secrets stay on the server |
| `/api/health` | `{ status, timestamp, env }` | Proving which deployment answered |

---

## Run it locally

You need [Node.js](https://nodejs.org) 18.18 or newer.

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local        # Windows: copy .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open <http://localhost:3000>.

`.env.local` already ships with working values in this repo, so step 2 is optional here — but in a real project it's the first thing you do.

To visit `/admin`, your browser will pop up a login box:

- **Username:** `admin`
- **Password:** whatever `ADMIN_PASSWORD` is set to (`makan2026` by default)

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload at `localhost:3000` |
| `npm run build` | Production build — **run this before deploying** |
| `npm start` | Serve the production build locally (run `build` first) |
| `npm run lint` | ESLint |

---

## Environment variables

| Variable | Type | Used by | What happens if it's missing |
| --- | --- | --- | --- |
| `MAKAN_API_SECRET` | 🔒 Secret | `app/api/places/route.ts` | `/api/places` returns HTTP 500, `/dashboard` shows an error |
| `ADMIN_PASSWORD` | 🔒 Secret | `proxy.ts` | `/admin` returns HTTP 500 — nobody can get in |
| `NEXT_PUBLIC_APP_NAME` | 🌍 Public | Header, landing banner | Falls back to `"MakanFinder"` |
| `NEXT_PUBLIC_API_VERSION` | 🌍 Public | `X-Api-Version` header, footer | Falls back to `"unknown"` |

Plus two that **Vercel sets for you** — never add them yourself:

| Variable | Value |
| --- | --- |
| `VERCEL_ENV` | `production`, `preview`, or `development` (shows `local` on your laptop) |
| `VERCEL_GIT_COMMIT_SHA` | The commit this deployment was built from |

### 🔑 The rule that matters

**A variable name starting with `NEXT_PUBLIC_` is inlined into the JavaScript that browsers download.** Anyone can read it with View Source.

```
NEXT_PUBLIC_APP_NAME=MakanFinder     ← fine, it's just a name
NEXT_PUBLIC_STRIPE_SECRET=sk_live... ← 🚨 you just published your Stripe key
```

Everything without the prefix stays on the server. In this repo they're separated on purpose:

- `lib/env.ts` — public values, safe to import anywhere
- `lib/server-env.ts` — secrets, only imported by server code

### Which files are committed?

| File | In git? | Why |
| --- | --- | --- |
| `.env.example` | ✅ Yes | Documents which variables exist. Placeholder values only. |
| `.env.local` | ❌ No | Your real values. Git-ignored so they never reach GitHub. |

This is why `/status` shows ❌ right after your first deploy: `.env.local` stayed on your laptop. You have to re-enter the variables in Vercel.

---

## 🚀 Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "MakanFinder workshop app"
git push origin main
```

Double-check that `.env.local` is **not** in the list `git add .` staged. It shouldn't be — `.gitignore` excludes it.

### Step 2 — Import the project

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Find your repository and click **Import**.
3. Vercel detects Next.js automatically. **Don't change the build settings.**

### Step 3 — Add your environment variables ⚠️

**This is the step everyone forgets.** Before clicking Deploy, expand **Environment Variables** and add all four:

| Name | Value |
| --- | --- |
| `MAKAN_API_SECRET` | any random string |
| `ADMIN_PASSWORD` | a password you'll remember |
| `NEXT_PUBLIC_APP_NAME` | `MakanFinder` |
| `NEXT_PUBLIC_API_VERSION` | `1.0.0` |

Leave all three environments (Production, Preview, Development) ticked.

### Step 4 — Deploy

Click **Deploy** and wait about a minute.

### Step 5 — Check your work

Open your new `https://your-app.vercel.app` URL and visit, in order:

1. **`/status`** — all four should be ✅, and `VERCEL_ENV` should say `production`
2. **`/api/health`** — should return `{"status":"ok", ..., "env":"production"}`
3. **`/dashboard`** — cards should load and the cuisine filter should work
4. **`/admin`** — should prompt for a password; log in with `admin` + your `ADMIN_PASSWORD`

### Step 6 — Watch a preview deployment happen

```bash
git checkout -b try-a-change
# edit something, e.g. the headline in app/page.tsx
git commit -am "Change the headline"
git push origin try-a-change
```

Open a pull request on GitHub. Vercel comments with a **preview URL** — a complete, separate deployment of that branch. Visit its `/status` page: `VERCEL_ENV` now says `preview`, and the commit SHA matches your branch.

Merge the PR and production updates automatically.

---

## Troubleshooting

**`/status` shows ❌ after deploying.**
You added the variables to `.env.local`, not to Vercel. Go to Project → Settings → Environment Variables, add them, then **redeploy** — existing deployments do not pick up new variables.

**I changed a `NEXT_PUBLIC_` variable and nothing happened.**
They're baked in at build time. Restart `npm run dev` locally, or redeploy on Vercel.

**`/admin` gives a 500 instead of a password prompt.**
`ADMIN_PASSWORD` isn't set. The app fails closed on purpose — better locked out than wide open.

**`/dashboard` shows "Couldn't load food spots".**
`MAKAN_API_SECRET` isn't set. Check `/status`.

**I can't log out of `/admin`.**
Basic Auth has no logout. Close the browser or use a private window.

---

## Project structure

```
app/
  page.tsx              landing page
  dashboard/page.tsx    "use client" — fetches from /api/places
  admin/page.tsx        protected by proxy.ts
  status/page.tsx       env var checklist
  api/places/route.ts   reads MAKAN_API_SECRET, returns mocked data
  api/health/route.ts   uptime check
components/             SiteHeader, SiteFooter, PlaceCard
data/places.ts          our "database": 12 hard-coded food spots
lib/env.ts              public (NEXT_PUBLIC_) variables
lib/server-env.ts       secrets — never import from a Client Component
proxy.ts                HTTP Basic Auth gate for /admin
```

> **Note on `proxy.ts`:** older tutorials call this file `middleware.ts` and export a `middleware` function. Next.js 16 renamed the convention to `proxy.ts` / `proxy`. The behaviour is identical.

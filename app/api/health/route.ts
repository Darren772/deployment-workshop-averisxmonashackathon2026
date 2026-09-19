import { NextResponse } from "next/server";
import { getDeploymentEnv } from "@/lib/server-env";

/**
 * GET /api/health
 *
 * A tiny endpoint that proves the deployment is alive and tells you WHICH
 * deployment answered. Handy right after you deploy: open
 * https://your-app.vercel.app/api/health and check `env` says "production".
 */

// A cached response would return a stale timestamp, so opt out of caching.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    // "production" | "preview" | "development" on Vercel, "local" on your laptop.
    env: getDeploymentEnv(),
  });
}

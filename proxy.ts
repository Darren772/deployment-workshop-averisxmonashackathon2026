import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * proxy.ts — runs BEFORE a page is rendered.
 *
 * ℹ️ Naming note for anyone following an older tutorial: this file used to be
 * called `middleware.ts` and export a `middleware` function. Next.js 16 renamed
 * the convention to `proxy.ts` / `proxy`. Everything else works the same way.
 *
 * We use it to put HTTP Basic Auth in front of /admin. The browser shows its
 * built-in username/password popup — no login form, no database, no session.
 * That makes it perfect for a demo, and genuinely useful for locking down a
 * staging site.
 *
 * ⚠️ Basic Auth sends credentials on every request, only protected by HTTPS.
 * It's fine for a workshop or an internal preview, not for real user accounts.
 */

// Only run this code for /admin and anything nested under it.
// Every other route (/, /dashboard, /status, /api/*) skips it entirely.
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

const USERNAME = "admin";
const REALM = 'Basic realm="MakanFinder Admin", charset="UTF-8"';

export function proxy(request: NextRequest) {
  // ADMIN_PASSWORD has no NEXT_PUBLIC_ prefix, so it stays on the server.
  const expectedPassword = process.env.ADMIN_PASSWORD;

  // Fail closed: if the variable is missing, nobody gets in.
  // This is the error you'll see on Vercel if you forget to add it there.
  if (!expectedPassword) {
    return new NextResponse(
      "ADMIN_PASSWORD is not set on the server. Add it in Vercel → Settings → Environment Variables.",
      { status: 500, headers: { "Content-Type": "text/plain" } },
    );
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    // The header looks like: "Basic YWRtaW46c2VjcmV0" where the second part is
    // base64 of "username:password". atob() decodes it.
    const decoded = atob(authHeader.slice("Basic ".length));

    // Split on the FIRST colon only — passwords are allowed to contain colons.
    const separatorIndex = decoded.indexOf(":");
    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    if (username === USERNAME && password === expectedPassword) {
      // Credentials are good — let the request continue to app/admin/page.tsx.
      return NextResponse.next();
    }
  }

  // No credentials, or wrong ones. The WWW-Authenticate header is what makes
  // the browser show its login popup.
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": REALM,
      "Content-Type": "text/plain",
    },
  });
}

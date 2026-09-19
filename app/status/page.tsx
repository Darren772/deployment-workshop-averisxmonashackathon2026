import { getCommitSha, getDeploymentEnv, getEnvReport } from "@/lib/server-env";

/**
 * Status page — the first place to look when a deploy "works on my machine".
 *
 * This is a Server Component, so `process.env` here is the real environment on
 * the machine serving the request. A Client Component could only ever see the
 * NEXT_PUBLIC_ ones.
 *
 * 🔒 We print ✅ / ❌ and NOTHING else. No values, no lengths, no prefixes.
 * A status page that leaks half a secret is worse than no status page.
 */

// Read env vars per request rather than freezing them into the build output.
export const dynamic = "force-dynamic";

export default function StatusPage() {
  const envReport = getEnvReport();
  const deploymentEnv = getDeploymentEnv();
  const commitSha = getCommitSha();

  const missingCount = envReport.filter((entry) => !entry.isSet).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">Status</h1>
      <p className="mt-2 text-stone-600">
        Which environment variables this running instance can see. Values are
        never displayed.
      </p>

      {/* Overall verdict */}
      <div
        className={`mt-6 rounded-xl border px-4 py-3 text-sm font-medium ${
          missingCount === 0
            ? "border-green-200 bg-green-50 text-green-900"
            : "border-red-200 bg-red-50 text-red-900"
        }`}
      >
        {missingCount === 0
          ? "✅ All 4 environment variables are set."
          : `❌ ${missingCount} of ${envReport.length} environment variables are missing.`}
      </div>

      {/* Deployment info */}
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-stone-400">
        Deployment
      </h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <dt className="font-mono text-xs text-stone-400">VERCEL_ENV</dt>
          <dd className="mt-1.5 text-xl font-semibold text-stone-900">
            {deploymentEnv}
          </dd>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <dt className="font-mono text-xs text-stone-400">VERCEL_GIT_COMMIT_SHA</dt>
          <dd className="mt-1.5 font-mono text-xl font-semibold text-stone-900">
            {commitSha}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-stone-500">
        Vercel sets both of these automatically — you never add them yourself.
        Running on your own laptop, they show{" "}
        <span className="font-mono">local</span>.
      </p>

      {/* Env var checklist */}
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-stone-400">
        Environment variables
      </h2>
      <ul className="mt-4 space-y-3">
        {envReport.map((entry) => (
          <li
            key={entry.name}
            className="flex items-start gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <span aria-hidden className="text-xl leading-none">
              {entry.isSet ? "✅" : "❌"}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <code className="font-mono text-sm font-semibold text-stone-900">
                  {entry.name}
                </code>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                    entry.kind === "secret"
                      ? "bg-stone-800 text-stone-100"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {entry.kind === "secret" ? "server-only" : "public"}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-stone-600">{entry.description}</p>
            </div>

            <span className="sr-only">{entry.isSet ? "set" : "missing"}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm leading-relaxed text-stone-600">
        <p className="font-semibold text-stone-900">Seeing ❌ after deploying?</p>
        <p className="mt-2">
          Environment variables in <span className="font-mono">.env.local</span>{" "}
          live on your laptop only — that file is git-ignored and never uploaded.
          Add each variable again in Vercel under{" "}
          <span className="font-semibold">
            Project → Settings → Environment Variables
          </span>
          , then redeploy. Changing a variable does not update an existing
          deployment; you have to build again.
        </p>
      </div>
    </div>
  );
}

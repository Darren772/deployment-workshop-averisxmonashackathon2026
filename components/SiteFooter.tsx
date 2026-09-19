import { getApiVersion } from "@/lib/env";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200/80 px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <p>Workshop demo app — all food spots are mocked data.</p>
        {/* NEXT_PUBLIC_API_VERSION is public config, so showing it is fine. */}
        <p className="font-mono">api {getApiVersion()}</p>
      </div>
    </footer>
  );
}

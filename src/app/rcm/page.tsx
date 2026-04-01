import { Suspense } from "react";
import RcmHomePageClient from "./RcmHomePageClient";

function RcmPageFallback() {
  return (
    <main className="min-h-screen bg-[#06101d] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
              Loading session
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Preparing RCM workspace
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Loading Revyola RCM operations view...
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function RcmPage() {
  return (
    <Suspense fallback={<RcmPageFallback />}>
      <RcmHomePageClient />
    </Suspense>
  );
}
"use client";

import { useState } from "react";
import RcmTopRibbon from "@/components/rcm/RcmTopRibbon";
import RcmHeroPanel from "@/components/rcm/RcmHeroPanel";
import RcmMetaPill from "@/components/rcm/RcmMetaPill";
import RcmSessionBar from "@/components/rcm/RcmSessionBar";
import RcmSuppressionView from "@/components/rcm/RcmSuppressionView";
import { fetchRcmParse } from "@/lib/rcm/api";
import { ParseResponse } from "@/lib/rcm/types";

export default function SuppressionPage() {
  const [data, setData] = useState<ParseResponse | null>(null);
  const [uploadId, setUploadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadSuppressionFeed() {
    if (!uploadId.trim()) {
      setError("Enter an upload_id first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const json = await fetchRcmParse(uploadId.trim());
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#06101d] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <RcmTopRibbon
          badge="Revyola work suppression engine"
          status="Collector effort protection"
          note="Keep non-yield work out of active queue and save operational time."
        />

        <section className="mt-6">
          <RcmHeroPanel
            eyebrow="Suppression Feed"
            title="Know what not to work"
            description="Load a parsed 835 upload and surface claims or adjustments that should stay out of active payer follow-up unless exception rules apply."
          >
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <RcmMetaPill label="Mode" value="Work suppression" />
              <RcmMetaPill label="Primary output" value="Avoidable effort removed" />
              <RcmMetaPill label="Decision model" value="Rule-based suppression" />
            </div>

            <div className="mt-8 flex flex-col gap-3 lg:flex-row">
              <input
                value={uploadId}
                onChange={(e) => setUploadId(e.target.value)}
                placeholder="Enter upload_id"
                className="w-full rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <button
                onClick={loadSuppressionFeed}
                disabled={loading}
                className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-6 py-3.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load Suppression Feed"}
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </RcmHeroPanel>
        </section>

        {data ? (
          <>
            <section className="mt-6">
              <RcmSessionBar data={data} mode="suppression" />
            </section>

            <section className="mt-6">
              <RcmSuppressionView data={data} />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
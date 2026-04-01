"use client";

import { useState } from "react";
import RcmTopRibbon from "@/components/rcm/RcmTopRibbon";
import RcmHeroPanel from "@/components/rcm/RcmHeroPanel";
import RcmMetaPill from "@/components/rcm/RcmMetaPill";
import RcmSessionBar from "@/components/rcm/RcmSessionBar";
import RcmWorkQueueView from "@/components/rcm/RcmWorkQueueView";
import { fetchRcmParse } from "@/lib/rcm/api";
import { ParseResponse } from "@/lib/rcm/types";

export default function WorkQueuePage() {
  const [data, setData] = useState<ParseResponse | null>(null);
  const [uploadId, setUploadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadWorkQueue() {
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
          badge="Revyola RCM execution engine"
          status="Operational work queue"
          note="Prioritize collector effort toward high-yield action now."
        />

        <section className="mt-6">
          <RcmHeroPanel
            eyebrow="Work Queue"
            title="Focus only on claims worth working now"
            description="Load a parsed 835 upload and surface the operational work queue ranked by denial type, actionability, and immediate yield."
          >
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <RcmMetaPill label="Mode" value="Operational workflow" />
              <RcmMetaPill label="Primary output" value="Prioritized work items" />
              <RcmMetaPill label="Decision model" value="Rule-based + scored" />
            </div>

            <div className="mt-8 flex flex-col gap-3 lg:flex-row">
              <input
                value={uploadId}
                onChange={(e) => setUploadId(e.target.value)}
                placeholder="Enter upload_id"
                className="w-full rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <button
                onClick={loadWorkQueue}
                disabled={loading}
                className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-6 py-3.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load Work Queue"}
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
              <RcmSessionBar data={data} mode="work-queue" />
            </section>

            <section className="mt-6">
              <RcmWorkQueueView data={data} />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
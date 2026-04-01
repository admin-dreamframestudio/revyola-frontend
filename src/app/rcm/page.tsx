"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RcmTopRibbon from "@/components/rcm/RcmTopRibbon";
import RcmHeroPanel from "@/components/rcm/RcmHeroPanel";
import RcmMetaPill from "@/components/rcm/RcmMetaPill";
import RcmCommandNav from "@/components/rcm/RcmCommandNav";
import RcmSessionBar from "@/components/rcm/RcmSessionBar";
import RcmWorkQueueView from "@/components/rcm/RcmWorkQueueView";
import RcmSuppressionView from "@/components/rcm/RcmSuppressionView";
import { fetchRcmParse, uploadRcm835 } from "@/lib/rcm/api";
import { ParseResponse } from "@/lib/rcm/types";

type Mode = "work-queue" | "suppression";

export default function RcmHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = (searchParams.get("mode") as Mode) || "work-queue";
  const initialUploadId = searchParams.get("upload_id") || "";

  const [mode, setMode] = useState<Mode>(
    initialMode === "suppression" ? "suppression" : "work-queue"
  );
  const [uploadId, setUploadId] = useState(initialUploadId);
  const [data, setData] = useState<ParseResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showManualLoad, setShowManualLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const nextMode = searchParams.get("mode");
    if (nextMode === "work-queue" || nextMode === "suppression") {
      setMode(nextMode);
    }

    const nextUploadId = searchParams.get("upload_id") || "";
    setUploadId(nextUploadId);
  }, [searchParams]);

  useEffect(() => {
    if (bootstrapped) return;
    if (!initialUploadId) {
      setBootstrapped(true);
      return;
    }

    void loadExistingSession(initialUploadId, mode);
    setBootstrapped(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapped, initialUploadId]);

  function updateUrl(nextUploadId: string, nextMode: Mode) {
    const params = new URLSearchParams();
    if (nextUploadId.trim()) params.set("upload_id", nextUploadId.trim());
    params.set("mode", nextMode);
    router.replace(`/rcm?${params.toString()}`);
  }

  async function loadExistingSession(id?: string, nextMode?: Mode) {
    const sessionId = (id ?? uploadId).trim();
    const sessionMode = nextMode ?? mode;

    if (!sessionId) {
      setError("Enter an upload_id first.");
      setData(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const json = await fetchRcmParse(sessionId);
      setData(json);
      setUploadId(sessionId);
      updateUrl(sessionId, sessionMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

async function handleUpload835() {
  if (!selectedFile) {
    setError("Select an 835 file first.");
    return;
  }

  setUploading(true);
  setError("");

  try {
    const uploadResult = await uploadRcm835(selectedFile);
    const nextUploadId = uploadResult.upload_id;

    setUploadId(nextUploadId);

    const parsed = await fetchRcmParse(nextUploadId);
    setData(parsed);
    setMode("work-queue");
    updateUrl(nextUploadId, "work-queue");
  } catch (err) {
    setError(err instanceof Error ? err.message : "Upload or parse failed");
    setData(null);
  } finally {
    setUploading(false);
  }
}

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    updateUrl(uploadId, nextMode);
  }

  const modeLabel = useMemo(
    () =>
      mode === "work-queue"
        ? "Operational work queue"
        : "Collector effort protection",
    [mode]
  );

  return (
    <main className="min-h-screen bg-[#06101d] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <RcmTopRibbon
          badge="Revyola RCM operations"
          status="835 decision + execution engine"
          note="Work the right claims. Suppress the wrong ones."
          actionHref="/home"
          actionLabel="Go to Home"
        />

        <section className="mt-6">
          <RcmHeroPanel
            eyebrow="Operations Command Center"
            title="One 835 workspace for execution"
            description="Upload an 835, let Revyola parse it, and move between Work Queue and Suppression without losing context."
          >
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <RcmMetaPill label="Input" value="835 file" />
              <RcmMetaPill label="Engine" value="Rules + heuristics" />
              <RcmMetaPill label="Mode" value={modeLabel} />
            </div>

            <div className="mt-8 flex flex-col gap-3 xl:flex-row xl:items-center">
              <label className="flex-1 cursor-pointer rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-slate-300">
                <span className="block truncate">
                  {selectedFile ? selectedFile.name : "Choose 835 file"}
                </span>
                <input
                  type="file"
                  accept=".txt,.835,.dat,.edi,.csv"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <button
                onClick={handleUpload835}
                disabled={uploading}
                className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-6 py-3.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload 835"}
              </button>

              <button
                onClick={() => setShowManualLoad((prev) => !prev)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                {showManualLoad ? "Hide Manual Load" : "Load Existing Session"}
              </button>
            </div>

            {showManualLoad ? (
              <div className="mt-4 flex flex-col gap-3 xl:flex-row">
                <input
                  value={uploadId}
                  onChange={(e) => setUploadId(e.target.value)}
                  placeholder="Enter upload_id"
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none"
                />
                <button
                  onClick={() => loadExistingSession()}
                  disabled={loading}
                  className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-6 py-3.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load Session"}
                </button>
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </RcmHeroPanel>
        </section>

        <section className="mt-6">
          <RcmCommandNav mode={mode} onChange={handleModeChange} />
        </section>

        {data ? (
          <>
            <section className="mt-6">
              <RcmSessionBar data={data} mode={mode} />
            </section>

            <section className="mt-6">
              {mode === "work-queue" ? (
                <RcmWorkQueueView data={data} />
              ) : (
                <RcmSuppressionView data={data} />
              )}
            </section>
          </>
        ) : (
          <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
            <div className="max-w-3xl">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                No active session
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Upload one 835 file to begin
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Revyola will upload, parse, and hold session context here so Work Queue
                and Suppression stay tied to the same 835 session.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
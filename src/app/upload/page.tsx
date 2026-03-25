"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileMeta = useMemo(() => {
    if (!file) return null;

    return {
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || "text/csv",
    };
  }, [file]);

  return (
    <main className="min-h-screen bg-[#06101d] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <section className="sticky top-0 z-30 rounded-[28px] border border-white/10 bg-[#06101d]/75 px-6 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-100">
                Revyola reimbursement intelligence
              </span>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                Upload workspace
              </div>
            </div>

            <button
              onClick={() => router.push("/home")}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.08]"
            >
              Go to Home
            </button>
          </div>
        </section>

        <section className="relative mt-6 overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />

          <div className="relative z-10 grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div className="max-w-3xl">
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                Revyola Lite
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                Upload claims data and launch recovery intelligence
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Upload a CSV of closed claims to identify potential reimbursement gaps,
                systemic payer variance, and revenue recovery opportunity.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                <MetaPill label="Accepted format" value="CSV" />
                <MetaPill label="Workflow" value="Upload → Analyze → Review" />
                <MetaPill label="Required fields" value="claim_id, payer, cpt_code, allowed_amount" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <HeroStat
                label="Input"
                value="Closed claims"
                sublabel="CSV upload"
              />
              <HeroStat
                label="Output"
                value="Recovery signals"
                sublabel="Pattern + claim detail"
              />
              <HeroStat
                label="Experience"
                value="Enterprise-grade"
                sublabel="Fast operational review"
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Upload workspace
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Claims file intake
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Select a claims CSV to run analysis. Core upload and analysis behavior is unchanged.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                {file ? "File ready" : "Awaiting file"}
              </div>
            </div>

            <label
              className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed px-6 py-16 text-center transition ${
                isDragActive
                  ? "border-cyan-300/40 bg-cyan-300/[0.08]"
                  : "border-white/10 bg-[#0b1728] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
              onDragEnter={() => setIsDragActive(true)}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={() => setIsDragActive(false)}
            >
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                CSV upload
              </div>

              <span className="mt-5 text-2xl font-semibold text-white">
                Click to upload claims CSV
              </span>

              <span className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Required fields: claim_id, payer, cpt_code, allowed_amount
              </span>

              <span className="mt-2 text-sm text-slate-500">
                Drag-and-drop is visually supported. File selection behavior remains the same.
              </span>

              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </label>

            {fileMeta ? (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Selected file
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {fileMeta.name}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-400">
                      <span>{fileMeta.size}</span>
                      <span>•</span>
                      <span>{fileMeta.type}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    Clear file
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
                No file selected yet.
              </div>
            )}

            <button
              className="mt-6 w-full rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!file || isRunning}
              onClick={async () => {
                if (!file || isRunning) return;

                const formData = new FormData();
                formData.append("file", file);

                try {
                  setIsRunning(true);

                  const res = await fetch(
                    //"https://automatic-fiesta-r4w9g6w4j9qq35w6x-8000.app.github.dev/analyze",
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/analyze`,
                    {
                      method: "POST",
                      body: formData,
                    }
                  );

                  const data = await res.json();

                  if (data.error) {
                    alert(data.error);
                    return;
                  }

                  sessionStorage.setItem(`analysis-${data.run_id}`, JSON.stringify(data));
                  window.location.href = `/analysis/${data.run_id}`;
                } catch (err) {
                  console.error(err);
                  alert("Failed to run analysis");
                } finally {
                  setIsRunning(false);
                }
              }}
            >
              {isRunning ? "Running Analysis..." : "Run Analysis"}
            </button>
          </div>

          <div className="space-y-6">
            <Panel
              eyebrow="How it works"
              title="Simple intake, high-value output"
              description="The workflow remains lightweight while the presentation feels enterprise-ready."
            >
              <div className="space-y-4">
                <StepCard
                  step="01"
                  title="Upload closed claims"
                  body="Provide a CSV of closed claims to initiate the analysis workflow."
                />
                <StepCard
                  step="02"
                  title="Analyze payer behavior"
                  body="Revyola evaluates claim patterns and reimbursement variance."
                />
                <StepCard
                  step="03"
                  title="Review opportunities"
                  body="Move into the premium analysis workspace for claims, patterns, and recovery signals."
                />
              </div>
            </Panel>

            <Panel
              eyebrow="Input guidance"
              title="File readiness"
              description="Use this as a quick checklist before running analysis."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricMini label="Minimum format" value="CSV" />
                <MetricMini label="Required fields" value="4 core columns" />
                <MetricMini label="Primary outcome" value="Recovery visibility" />
                <MetricMini label="Next step" value="Analysis workspace" />
              </div>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-[#0b1728] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Required columns
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ColumnPill label="claim_id" />
                  <ColumnPill label="payer" />
                  <ColumnPill label="cpt_code" />
                  <ColumnPill label="allowed_amount" />
                </div>
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function HeroStat({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 backdrop-blur">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-400">{sublabel}</div>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-300">
      <span className="text-slate-400">{label}:</span> {value}
    </div>
  );
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function StepCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
        Step {step}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}

function ColumnPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-100">
      {label}
    </span>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
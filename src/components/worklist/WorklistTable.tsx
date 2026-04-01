"use client";

import { useMemo, useState } from "react";
import LetterPreviewModal from "@/components/letters/LetterPreviewModal";

type WorklistItem = {
  run_id?: string;
  claim_id: string;
  payer?: string;
  issue?: string;
  confidence?: number;
  cpt_code?: string;
  date_of_service?: string;
  billed_amount?: number;
  paid_amount?: number;
  benchmark_amount?: number;
  delta?: number;
  appeal_text?: string;
};

function formatCurrency(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getConfidenceLabel(confidence?: number) {
  const pct = Math.round((confidence ?? 0) * 100);
  if (pct >= 90) return "High";
  if (pct >= 75) return "Strong";
  if (pct >= 60) return "Moderate";
  return "Review";
}

export default function WorklistTable({ data }: { data: WorklistItem[] }) {
  const [selected, setSelected] = useState<WorklistItem | null>(null);
  const [open, setOpen] = useState(false);

  const sorted = useMemo(() => {
    return [...(data || [])]
      .filter((item) => (item.delta ?? 0) > 0)
      .sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0));
  }, [data]);

  const openPreview = (row: WorklistItem) => {
    setSelected(row);
    setOpen(true);
  };

  return (
    <>
      <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <div className="border-b border-white/10 px-5 py-4 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Recovery Worklist
              </div>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-white md:text-xl">
                Prioritized claim opportunities
              </h3>
            </div>

            <div className="text-sm text-white/60">
              {sorted.length} actionable {sorted.length === 1 ? "claim" : "claims"}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-white">
            <thead className="bg-white/[0.04] text-white/55">
              <tr>
                <th className="px-5 py-4 text-left font-medium">Claim</th>
                <th className="px-5 py-4 text-left font-medium">Payer</th>
                <th className="px-5 py-4 text-left font-medium">Issue</th>
                <th className="px-5 py-4 text-left font-medium">Delta</th>
                <th className="px-5 py-4 text-left font-medium">Confidence</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.claim_id}
                  className="border-t border-white/6 transition hover:bg-white/[0.04]"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{row.claim_id}</div>
                    <div className="mt-1 text-xs text-white/45">
                      {row.cpt_code || "No CPT"} {row.date_of_service ? `· ${row.date_of_service}` : ""}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-white/80">{row.payer || "—"}</td>

                  <td className="px-5 py-4">
                    <div className="max-w-[280px] text-white/72">
                      {row.issue || "Potential underpayment"}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold text-emerald-400">
                    {formatCurrency(row.delta)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-white/80">
                      {getConfidenceLabel(row.confidence)} · {Math.round((row.confidence ?? 0) * 100)}%
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => openPreview(row)}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                    >
                      Preview Appeal
                    </button>
                  </td>
                </tr>
              ))}

              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-white/50">
                    No actionable recovery opportunities found in this run.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LetterPreviewModal
        open={open}
        onClose={() => setOpen(false)}
        data={selected}
      />
    </>
  );
}
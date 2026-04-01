"use client";

import { useEffect } from "react";
import LetterDocument from "./LetterDocument";

type LetterData = {
  claim_id: string;
  payer?: string;
  patient_name?: string;
  cpt_code?: string;
  date_of_service?: string;
  billed_amount?: number;
  paid_amount?: number;
  benchmark_amount?: number;
  delta?: number;
  issue?: string;
  appeal_text?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  data: LetterData | null;
};

export default function LetterPreviewModal({ open, onClose, data }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full px-4 py-8 md:px-8 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">
                  Appeal Workspace
                </div>
                <div className="mt-1 text-sm font-medium md:text-base">
                  Claim {data.claim_id} · {data.payer || "Payer"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  Download / Print
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-white/15 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>

            <LetterDocument data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
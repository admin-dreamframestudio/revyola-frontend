"use client";

import { useMemo, useState } from "react";
import RcmPanel from "@/components/rcm/RcmPanel";
import RcmMetricMini from "@/components/rcm/RcmMetricMini";
import RcmCommunicationPreviewModal from "@/components/rcm/RcmCommunicationPreviewModal";
import {
  buildCommunicationPreview,
  CommunicationPreview,
} from "@/lib/rcm/communication";
import { ParseResponse } from "@/lib/rcm/types";

export default function RcmWorkQueueView({
  data,
}: {
  data: ParseResponse;
}) {
  const sortedItems = useMemo(() => {
    return [...data.work_queue].sort(
      (a, b) =>
        b.priority_score - a.priority_score ||
        b.adjustment_amount - a.adjustment_amount
    );
  }, [data.work_queue]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectedItem = sortedItems[selectedIndex] ?? null;

  const matchingClaim = selectedItem
    ? data.claims_preview.find((claim) => claim.claim_id === selectedItem.claim_id) ?? null
    : null;

  const communicationPreview: CommunicationPreview | null = useMemo(() => {
    if (!selectedItem) return null;

    return buildCommunicationPreview({
      item: selectedItem,
      claim: matchingClaim,
      fileName: data.filename,
      uploadId: data.upload_id,
    });
  }, [selectedItem, matchingClaim, data.filename, data.upload_id]);

  const totalRecoverable = sortedItems.reduce(
    (sum, item) => sum + item.adjustment_amount,
    0
  );

  const avgPriority =
    sortedItems.length > 0
      ? (
          sortedItems.reduce((sum, item) => sum + item.priority_score, 0) /
          sortedItems.length
        ).toFixed(1)
      : "0.0";

  const highPriorityCount = sortedItems.filter(
    (item) => item.priority_score >= 80
  ).length;

  const fastWinCount = sortedItems.filter(
    (item) => item.adjustment_amount < 250 && item.priority_score >= 60
  ).length;

  return (
    <>
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RcmMetricMini label="Work items" value={sortedItems.length} />
          <RcmMetricMini
            label="Recoverable"
            value={`$${totalRecoverable.toFixed(2)}`}
          />
          <RcmMetricMini label="Avg priority" value={avgPriority} />
          <RcmMetricMini label="High priority" value={highPriorityCount} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <RcmPanel
            eyebrow="Action queue"
            title="Claims to work now"
            description="Priority-ranked claims with the clearest immediate value."
          >
            <div className="space-y-3">
              {sortedItems.length === 0 ? (
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                  No work items found for this upload.
                </div>
              ) : (
                sortedItems.map((item, index) => {
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={`${item.claim_id}-${item.adjustment_code}-${index}`}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={[
                        "w-full rounded-[24px] border p-5 text-left transition",
                        isSelected
                          ? "border-cyan-300/25 bg-cyan-300/[0.08] shadow-[0_0_0_1px_rgba(34,211,238,0.08)]"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                      ].join(" ")}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                              Priority {item.priority_score}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                              {item.adjustment_code}
                            </span>
                          </div>

                          <div className="mt-3 text-lg font-semibold text-white">
                            Claim {item.claim_id}
                          </div>

                          <div className="mt-2 text-sm text-slate-300">
                            {item.reason}
                          </div>

                          <div className="mt-3 text-sm text-slate-400">
                            {item.recommended_action}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Amount
                          </div>
                          <div className="mt-2 text-xl font-semibold text-white">
                            ${item.adjustment_amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </RcmPanel>

          <RcmPanel
            eyebrow="Selected claim"
            title={selectedItem ? `Claim ${selectedItem.claim_id}` : "Claim detail"}
            description="Focused view for actionability and next-step clarity."
          >
            {selectedItem ? (
              <div className="space-y-4">
                <DetailCard
                  label="Adjustment code"
                  value={selectedItem.adjustment_code}
                />
                <DetailCard
                  label="Adjustment amount"
                  value={`$${selectedItem.adjustment_amount.toFixed(2)}`}
                />
                <DetailCard
                  label="Paid amount"
                  value={
                    matchingClaim
                      ? `$${matchingClaim.paid_amount.toFixed(2)}`
                      : "N/A"
                  }
                />
                <DetailCard
                  label="Patient responsibility"
                  value={
                    matchingClaim
                      ? `$${matchingClaim.patient_responsibility.toFixed(2)}`
                      : "N/A"
                  }
                />
                <DetailCard
                  label="Total charge"
                  value={
                    matchingClaim
                      ? `$${matchingClaim.total_charge.toFixed(2)}`
                      : "N/A"
                  }
                />
                <DetailCard label="Reason" value={selectedItem.reason} />
                <DetailCard
                  label="Recommended action"
                  value={selectedItem.recommended_action}
                />
                <DetailCard
                  label="Priority score"
                  value={String(selectedItem.priority_score)}
                />

                <div className="rounded-[22px] border border-white/10 bg-[#0b1728] p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Operator guidance
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Start with higher-priority items that combine clear actionability
                    with stronger dollar recovery. Use the recommended action as the
                    immediate follow-up path.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="rounded-[20px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                  >
                    Preview Communication
                  </button>

                  <ActionGhost label="Flag for follow-up" />
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                Select a work item to inspect detail.
              </div>
            )}
          </RcmPanel>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <MiniBucket
            title="High Priority"
            value={highPriorityCount}
            hint="Immediate collector attention"
          />
          <MiniBucket
            title="Fast Wins"
            value={fastWinCount}
            hint="Lower effort, quicker touch"
          />
          <MiniBucket
            title="Service Lines"
            value={data.line_count}
            hint="Current parsed footprint"
          />
        </section>
      </div>

      <RcmCommunicationPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        preview={communicationPreview}
      />
    </>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm leading-6 text-white">{value}</div>
    </div>
  );
}

function ActionGhost({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.05]"
    >
      {label}
    </button>
  );
}

function MiniBucket({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {title}
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-slate-400">{hint}</div>
    </div>
  );
}
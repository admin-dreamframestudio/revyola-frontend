"use client";

import { useMemo, useState } from "react";
import RcmPanel from "@/components/rcm/RcmPanel";
import RcmMetricMini from "@/components/rcm/RcmMetricMini";
import { ParseResponse } from "@/lib/rcm/types";

type SuppressionItem = ParseResponse["suppression_feed"][number];

export default function RcmSuppressionView({
  data,
}: {
  data: ParseResponse;
}) {
  const grouped = useMemo(() => {
    return data.suppression_feed.reduce<
      Record<
        string,
        {
          count: number;
          amount: number;
        }
      >
    >((acc, item) => {
      const key = item.adjustment_code || "Unknown";
      if (!acc[key]) {
        acc[key] = { count: 0, amount: 0 };
      }
      acc[key].count += 1;
      acc[key].amount += item.adjustment_amount;
      return acc;
    }, {});
  }, [data.suppression_feed]);

  const rankedGroups = Object.entries(grouped).sort(
    (a, b) => b[1].count - a[1].count || b[1].amount - a[1].amount
  );

  const [selectedCode, setSelectedCode] = useState<string | null>(
    rankedGroups[0]?.[0] ?? null
  );

  const filteredItems = useMemo(() => {
    if (!selectedCode) return data.suppression_feed;
    return data.suppression_feed.filter(
      (item) => (item.adjustment_code || "Unknown") === selectedCode
    );
  }, [data.suppression_feed, selectedCode]);

  const selectedLead = filteredItems[0] ?? null;

  const suppressedAmount = data.suppression_feed.reduce(
    (sum, item) => sum + item.adjustment_amount,
    0
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RcmMetricMini
          label="Suppressed items"
          value={data.suppression_feed.length}
        />
        <RcmMetricMini
          label="Suppressed $"
          value={`$${suppressedAmount.toFixed(2)}`}
        />
        <RcmMetricMini label="Claims" value={data.claim_count} />
        <RcmMetricMini label="Buckets" value={rankedGroups.length} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <RcmPanel
          eyebrow="Suppression buckets"
          title="Where work is intentionally being avoided"
          description="Grouped by adjustment code to show the main drivers of protected effort."
        >
          <div className="space-y-3">
            {rankedGroups.length === 0 ? (
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                No suppression items found for this upload.
              </div>
            ) : (
              rankedGroups.map(([code, meta]) => {
                const active = selectedCode === code;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedCode(code)}
                    className={[
                      "w-full rounded-[24px] border p-5 text-left transition",
                      active
                        ? "border-cyan-300/25 bg-cyan-300/[0.08] shadow-[0_0_0_1px_rgba(34,211,238,0.08)]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300 inline-flex">
                          {code}
                        </div>
                        <div className="mt-3 text-lg font-semibold text-white">
                          {meta.count} suppressed items
                        </div>
                        <div className="mt-2 text-sm text-slate-400">
                          ${meta.amount.toFixed(2)} protected from low-yield effort
                        </div>
                      </div>

                      <div
                        className={[
                          "mt-1 h-2.5 w-2.5 rounded-full",
                          active ? "bg-cyan-300" : "bg-slate-600",
                        ].join(" ")}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </RcmPanel>

        <RcmPanel
          eyebrow="Selected bucket"
          title={selectedCode ? `Code ${selectedCode}` : "Suppression detail"}
          description="Representative detail for why these items are being held out of active queue."
        >
          {selectedLead ? (
            <div className="space-y-4">
              <DetailCard label="Claim ID" value={selectedLead.claim_id} />
              <DetailCard
                label="Adjustment amount"
                value={`$${selectedLead.adjustment_amount.toFixed(2)}`}
              />
              <DetailCard label="Reason" value={selectedLead.reason} />
              <DetailCard
                label="Why suppressed"
                value={selectedLead.recommended_action}
              />
              <DetailCard
                label="Priority score"
                value={String(selectedLead.priority_score)}
              />

              <div className="rounded-[22px] border border-white/10 bg-[#0b1728] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Suppression guidance
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  These items stay out of active collector flow unless an exception
                  path is later defined. This protects staff effort from low-yield work.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
              Select a suppression bucket to inspect detail.
            </div>
          )}
        </RcmPanel>
      </section>

      <section>
        <RcmPanel
          eyebrow="Suppression feed"
          title="Items inside selected bucket"
          description="Detailed rows for the currently selected suppression group."
        >
          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1728]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.03] text-left">
                  <tr>
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Claim ID
                    </th>
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Adj Code
                    </th>
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Amount
                    </th>
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Reason
                    </th>
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Why Suppressed
                    </th>
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr className="border-t border-white/10">
                      <td colSpan={6} className="px-5 py-6 text-slate-400">
                        No suppression items found.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => (
                      <tr
                        key={`${item.claim_id}-${item.adjustment_code}-${index}`}
                        className="border-t border-white/10 align-top"
                      >
                        <td className="px-5 py-4 font-medium text-white">
                          {item.claim_id}
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          {item.adjustment_code}
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          ${item.adjustment_amount.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          {item.reason}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {item.recommended_action}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-300">
                            {item.priority_score}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </RcmPanel>
      </section>
    </div>
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
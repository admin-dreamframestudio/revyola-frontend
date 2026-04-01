import { ParseResponse } from "@/lib/rcm/types";

export default function RcmSessionBar({
  data,
  mode,
}: {
  data: ParseResponse;
  mode: "work-queue" | "suppression";
}) {
  const totalRecoverable = data.work_queue.reduce(
    (sum, item) => sum + item.adjustment_amount,
    0
  );

  const suppressedAmount = data.suppression_feed.reduce(
    (sum, item) => sum + item.adjustment_amount,
    0
  );

  const activeCount =
    mode === "work-queue" ? data.work_queue.length : data.suppression_feed.length;

  const activeLabel =
    mode === "work-queue" ? "Active work items" : "Suppressed items";

  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5 backdrop-blur-xl">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            Active 835 session
          </div>
          <div className="mt-2 flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-4">
            <div className="truncate text-lg font-semibold text-white">
              {data.filename || "Parsed 835 session"}
            </div>
            <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
              {data.parser_status}
            </div>
          </div>
          <div className="mt-3 break-all text-sm text-slate-400">
            Upload ID: {data.upload_id}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricChip label="Claims" value={data.claim_count} />
          <MetricChip label="Adjustments" value={data.adjustment_count} />
          <MetricChip label={activeLabel} value={activeCount} />
          <MetricChip label="Workable $" value={`$${totalRecoverable.toFixed(2)}`} />
          <MetricChip label="Suppressed $" value={`$${suppressedAmount.toFixed(2)}`} />
        </div>
      </div>
    </section>
  );
}

function MetricChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[#0b1728] px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-white">{value}</div>
    </div>
  );
}
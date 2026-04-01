"use client";

type Props = {
  badge: string;
  status: string;
  note: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function RcmTopRibbon({
  badge,
  status,
  note,
  actionHref,
  actionLabel,
}: Props) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[#06101d]/75 px-6 py-4 backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-100">
            {badge}
          </span>

          <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
            {status}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300">
            {note}
          </div>

          {actionHref && actionLabel ? (
            <a
              href={actionHref}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              {actionLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
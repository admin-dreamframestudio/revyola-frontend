"use client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#06101d] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <section className="rounded-[28px] border border-white/10 bg-[#06101d]/75 px-6 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-100">
                Revyola reimbursement intelligence
              </span>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                Enterprise preview
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-300">
              Upload closed claims. Surface recovery opportunity.
            </div>
          </div>
        </section>

        <section className="relative mt-6 overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-8 py-16 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-10 sm:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />

          <div className="relative z-10 grid gap-12 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-300">
                Revyola Lite
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl xl:text-6xl">
                Surface hidden reimbursement variance in already-paid claims
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Upload closed claims. Run analysis. Identify where revenue may
                have been left behind and move from payer noise to recovery
                signal with a clean, enterprise-grade workflow.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                <MetaPill label="Workflow" value="Upload → Analyze → Review" />
                <MetaPill label="Use case" value="Closed claims analysis" />
                <MetaPill label="Output" value="Patterns + claim detail" />
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="/upload"
                  className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-6 py-3.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                >
                  Upload Claims
                </a>

                <a
                  href="/analysis/demo-run"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                >
                  View Demo
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <HeroCard
                eyebrow="Signal"
                title="Find hidden variance"
                body="Detect underpayment patterns inside already-paid claims."
              />
              <HeroCard
                eyebrow="Workflow"
                title="Simple file intake"
                body="Start with a CSV and move directly into analysis."
              />
              <HeroCard
                eyebrow="Output"
                title="Actionable review"
                body="Prioritize patterns, inspect claims, and generate recovery packets."
              />
              <HeroCard
                eyebrow="Experience"
                title="Enterprise-grade clarity"
                body="Clean information hierarchy for executives and operators."
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Panel
            eyebrow="What Revyola does"
            title="A cleaner path from claims data to recovery opportunity"
            description="Designed to feel lightweight at intake and high-value in analysis."
          >
            <div className="space-y-4">
              <StepCard
                step="01"
                title="Upload claims data"
                body="Provide a CSV of closed claims with core reimbursement fields."
              />
              <StepCard
                step="02"
                title="Analyze payer behavior"
                body="Surface patterns, reimbursement variance, and modeled gap opportunity."
              />
              <StepCard
                step="03"
                title="Review recovery signals"
                body="Open a premium workspace for pattern ranking, grouped drilldowns, and claim inspection."
              />
            </div>
          </Panel>

          <Panel
            eyebrow="Why this matters"
            title="Built for signal, not dashboard noise"
            description="The goal is not more raw data. The goal is faster visibility into where revenue may have been missed."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricMini label="Primary input" value="Closed claims CSV" />
              <MetricMini label="Primary output" value="Recovery visibility" />
              <MetricMini label="Review mode" value="Pattern + claim detail" />
              <MetricMini label="Next step" value="Billing follow-up" />
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-[#0b1728] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Core journey
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <JourneyPill label="Upload" />
                <JourneyPill label="Analyze" />
                <JourneyPill label="Prioritize" />
                <JourneyPill label="Review" />
                <JourneyPill label="Recover" />
              </div>
            </div>
          </Panel>
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

function HeroCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 backdrop-blur">
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {eyebrow}
      </div>
      <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
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

function JourneyPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-100">
      {label}
    </span>
  );
}
"use client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#06101d] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-8 lg:px-10">
        <TopRail />

        <section className="mt-14">
          <div className="max-w-5xl">
            <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-100">
              Revyola Platform
            </div>

            <h1 className="mt-8 max-w-5xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl xl:text-7xl">
              Revenue Intelligence.
              <br />
              Operationalized.
            </h1>

            <div className="mt-8 max-w-3xl">
              <p className="text-lg leading-8 text-slate-300 sm:text-xl">
                Two operating surfaces. One recovery system.
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
                Analyze payment behavior. Execute on actionable remittance signals.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <EntryCard
            eyebrow="Strategic Surface"
            title="Payment Intelligence"
            subtitle="Closed-claims analysis for reimbursement signal discovery"
            description="Identify payer behavior, reimbursement patterns, and missed revenue opportunities across closed claims."
            href="/upload"
            accent
            bullets={[
              "Pattern discovery",
              "Variance review",
              "Recovery signal analysis",
            ]}
          />

          <EntryCard
            eyebrow="Execution Surface"
            title="RCM Operations"
            subtitle="835-driven work queue, suppression, and communication workflow"
            description="Prioritize active claims, suppress low-yield effort, and move directly into payer-ready operational follow-up."
            href="/rcm"
            bullets={[
              "Work queue",
              "Suppression",
              "Communication package",
            ]}
          />
        </section>

        <section className="mt-10">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-slate-500">
              <span className="text-slate-400">System Pillars</span>
              <Dot />
              <span>Payment Intelligence</span>
              <Dot />
              <span>RCM Execution</span>
              <Dot />
              <span>Recovery Communication</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TopRail() {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.32em] text-slate-400">
            Revyola
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
            Enterprise Platform
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label="Payment Intelligence" />
          <StatusPill label="RCM Operations" />
        </div>
      </div>
    </section>
  );
}

function EntryCard({
  eyebrow,
  title,
  subtitle,
  description,
  href,
  bullets,
  accent = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  bullets: string[];
  accent?: boolean;
}) {
  return (
    <a
      href={href}
      className={[
        "group relative overflow-hidden rounded-[36px] border p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition duration-300",
        accent
          ? "border-cyan-300/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]"
          : "border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))]",
        "hover:-translate-y-0.5 hover:border-white/20",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_40%)]" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
          {eyebrow}
        </div>

        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
          {title}
        </h2>

        <div className="mt-3 text-sm font-medium text-cyan-200">
          {subtitle}
        </div>

        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {bullets.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-300"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <div className="text-sm text-slate-500">Enter module</div>
          <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition group-hover:bg-white/[0.08]">
            Open
          </div>
        </div>
      </div>
    </a>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
      {label}
    </span>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-slate-600" />;
}
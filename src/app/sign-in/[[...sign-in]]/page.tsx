import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#06101d] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-8 py-16 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-10 sm:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />

          <div className="relative z-10 grid gap-10 xl:grid-cols-[1fr_520px] xl:items-center">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
                Secure Revyola Access
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Sign in to access the Revyola workspace
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Access guided demos, upload workflows, and reimbursement intelligence
                review in a secure environment.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                <MetaPill label="Access" value="Authenticated only" />
                <MetaPill label="Experience" value="Enterprise-grade workflow" />
                <MetaPill label="Use case" value="Demo + admin review" />
              </div>
            </div>

            <div className="flex justify-center xl:justify-end">
              <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0b1728]/90 p-4 shadow-2xl shadow-black/30 backdrop-blur">
                <SignIn />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-300">
      <span className="text-slate-400">{label}:</span> {value}
    </div>
  );
}
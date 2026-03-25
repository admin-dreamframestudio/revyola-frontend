export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#06101d] text-white p-10">
      <h1 className="text-3xl font-semibold">Revyola Demo</h1>

      <p className="mt-4 text-slate-400">
        This is a controlled demo experience showing how Revyola surfaces hidden reimbursement variance.
      </p>

      <div className="mt-8 rounded-xl border border-white/10 p-6 bg-white/[0.03]">
        <h2 className="text-xl font-medium">Sample Insight</h2>
        <p className="mt-2 text-slate-400">
          Potential recoverable revenue identified across CPT patterns and payer variance.
        </p>

        <div className="mt-4 text-2xl font-semibold text-cyan-300">
          $124,320
        </div>
      </div>
    </main>
  );
}
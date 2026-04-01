type Mode = "work-queue" | "suppression";

export default function RcmCommandNav({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (mode: Mode) => void;
}) {
  const items: Array<{ key: Mode; label: string; hint: string }> = [
    {
      key: "work-queue",
      label: "Work Queue",
      hint: "Active yield",
    },
    {
      key: "suppression",
      label: "Suppression",
      hint: "Effort protected",
    },
  ];

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-2 backdrop-blur">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const active = item.key === mode;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={[
                "group flex min-w-[190px] flex-1 items-center justify-between rounded-[22px] px-4 py-3 text-left transition",
                active
                  ? "border border-cyan-300/20 bg-cyan-300/10 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.06)]"
                  : "border border-transparent bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]",
              ].join(" ")}
            >
              <div>
                <div
                  className={[
                    "text-sm font-medium",
                    active ? "text-cyan-100" : "text-white",
                  ].join(" ")}
                >
                  {item.label}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {item.hint}
                </div>
              </div>

              <div
                className={[
                  "h-2.5 w-2.5 rounded-full transition",
                  active ? "bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.75)]" : "bg-slate-600",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
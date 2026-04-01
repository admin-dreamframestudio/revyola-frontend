import React from "react";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function RcmPanel({
  eyebrow,
  title,
  description,
  children,
}: Props) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10 backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}
import React from "react";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function RcmHeroPanel({
  eyebrow,
  title,
  description,
  children,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-8 py-10 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-10 sm:py-12">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />

      <div className="relative z-10">
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-300">
          {eyebrow}
        </div>

        <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:text-5xl">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
          {description}
        </p>

        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
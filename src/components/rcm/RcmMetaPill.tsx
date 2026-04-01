type Props = {
  label: string;
  value: string;
};

export default function RcmMetaPill({ label, value }: Props) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-300">
      <span className="text-slate-400">{label}:</span> {value}
    </div>
  );
}
"use client";

import { CommunicationPreview } from "@/lib/rcm/communication";

type Props = {
  open: boolean;
  onClose: () => void;
  preview: CommunicationPreview | null;
};

export default function RcmCommunicationPreviewModal({
  open,
  onClose,
  preview,
}: Props) {
  if (!open || !preview) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm">
      <div className="flex h-full w-full items-center justify-center p-4">
        <div className="flex h-[92vh] w-full max-w-[1400px] overflow-hidden rounded-[32px] border border-white/10 bg-[#081321] shadow-2xl shadow-black/50">
          <aside className="hidden w-[290px] shrink-0 border-r border-white/10 bg-[linear-gradient(180deg,#06111f_0%,#04101d_100%)] xl:flex xl:flex-col">
            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-cyan-100">
                  Letter Preview
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] text-slate-300">
                  Claim-level
                </span>
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-white">Draft</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                <MetaChip label={`Claims: ${preview.summary.claimsInScope}`} />
                <MetaChip label={`Paid: ${preview.summary.paidAmount}`} />
                <MetaChip label={`Remit Adj: ${preview.summary.adjustmentAmount}`} />
                <MetaChip label={`Pt Resp: ${preview.summary.patientResponsibility}`} />
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
              <RailSection title="Draft Intelligence">
                <RailCard label="Template" value={preview.intelligence.template} />
                <RailCard
                  label="Claims Included"
                  value={preview.intelligence.claimsIncluded.join(", ")}
                />
                <RailCard label="Letter Mode" value={preview.intelligence.letterMode} />
                <RailCard label="File Base" value={preview.intelligence.fileBase} />
                {preview.intelligence.payerClaimId ? (
                  <RailCard
                    label="Payer Claim ID"
                    value={preview.intelligence.payerClaimId}
                  />
                ) : null}
                <RailCard
                  label="Recommendation"
                  value={preview.intelligence.recommendation}
                  multiline
                />
              </RailSection>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2 xl:hidden">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-cyan-100">
                  Letter Preview
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] text-slate-300">
                  Claim-level
                </span>
              </div>

              <div className="ml-auto flex flex-wrap gap-3">
                <GhostAction label="Download HTML" />
                <GhostAction label="Download TXT" />
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                >
                  Close
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.05),transparent_25%),linear-gradient(180deg,#081321_0%,#091729_100%)] p-5 xl:p-6">
              <div className="mx-auto max-w-[980px] rounded-[28px] bg-[#dfe5ec] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.28)] xl:p-4">
                <div className="rounded-[24px] border border-slate-300/70 bg-[#edf1f5] p-5 xl:p-6">
                  <div className="overflow-hidden rounded-[22px] border border-slate-300 bg-white/80">
                    <div className="bg-[linear-gradient(135deg,#275b8e_0%,#3375af_100%)] px-6 py-6 text-white">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/90">
                          Revyola Recovery Draft
                        </div>
                        <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] text-white/90">
                          Generated {preview.generatedAt}
                        </div>
                      </div>

                      <h1 className="mt-4 text-2xl font-semibold tracking-tight xl:text-[38px] xl:leading-[1.15]">
                        {preview.title}
                      </h1>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/90 xl:text-[15px]">
                        {preview.subtitle}
                      </p>
                    </div>

                    <div className="space-y-6 bg-[#f1f4f7] px-6 py-6 text-slate-900">
                      <section className="grid gap-3 sm:grid-cols-2">
                        <MetaBox
                          label="Claim ID"
                          value={preview.intelligence.claimsIncluded[0] || "N/A"}
                        />
                        <MetaBox
                          label="Payer Claim ID"
                          value={preview.intelligence.payerClaimId || "N/A"}
                        />
                        <MetaBox
                          label="Letter Mode"
                          value={preview.intelligence.letterMode}
                        />
                        <MetaBox
                          label="Template"
                          value={preview.intelligence.template}
                        />
                      </section>

                      <section>
                        <SectionLabel label="Draft Letter" />
                        <WhiteBlock>
                          <div className="whitespace-pre-wrap text-[14px] leading-8 text-slate-800">
                            {preview.draftLetter}
                          </div>
                        </WhiteBlock>
                      </section>

                      <section>
                        <SectionLabel label="Claim and Remittance Summary" />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <MetricBox
                            label="Claims in Scope"
                            value={String(preview.summary.claimsInScope)}
                          />
                          <MetricBox
                            label="Paid Amount"
                            value={preview.summary.paidAmount}
                            accent
                          />
                          <MetricBox
                            label="Remittance Adjustment"
                            value={preview.summary.adjustmentAmount}
                          />
                          <MetricBox
                            label="Patient Responsibility"
                            value={preview.summary.patientResponsibility}
                          />
                          <MetricBox
                            label="Total Charge"
                            value={preview.summary.totalCharge}
                          />
                        </div>

                        <div className="mt-3 rounded-[14px] border border-slate-300 bg-[#f7f9fb] px-4 py-3 text-[12px] leading-6 text-slate-600">
                          {preview.summary.note}
                        </div>
                      </section>

                      <section>
                        <SectionLabel label="Claim-level Evidence" />
                        <div className="space-y-4">
                          {preview.evidence.map((item, index) => (
                            <div
                              key={`${item.claimId}-${index}`}
                              className="rounded-[20px] border border-slate-300 bg-[#f6f8fa] p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                                  Claim {index + 1}
                                </div>
                                <div className="text-sm font-semibold text-slate-800">
                                  {item.claimId}
                                </div>
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <MetaBox
                                  label="Payer Claim ID"
                                  value={item.payerClaimId || "N/A"}
                                />
                                <MetaBox
                                  label="Total Charge"
                                  value={item.totalCharge || "N/A"}
                                />
                                <MetaBox
                                  label="Paid Amount"
                                  value={item.paidAmount || "N/A"}
                                  accent
                                />
                                <MetaBox
                                  label="Patient Responsibility"
                                  value={item.patientResponsibility || "N/A"}
                                />
                                <MetaBox
                                  label="Adjustment Code"
                                  value={item.adjustmentCode || "N/A"}
                                />
                                <MetaBox
                                  label="Remittance Adjustment"
                                  value={item.adjustmentAmount || "N/A"}
                                />
                                <MetaBox
                                  label="Priority Score"
                                  value={item.priorityScore || "N/A"}
                                />
                              </div>

                              <div className="mt-4 space-y-3">
                                <LongBox label="Reason" value={item.reason || "N/A"} />
                                <LongBox
                                  label="Recommended Action"
                                  value={item.recommendedAction || "N/A"}
                                />
                                {item.note ? (
                                  <LongBox
                                    label="Adjudication Note"
                                    value={item.note}
                                  />
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section>
                        <SectionLabel label="Recommended Billing Team Follow-up" />
                        <WhiteBlock>
                          <ol className="space-y-3 pl-5 text-[14px] leading-7 text-slate-800">
                            {preview.followUpItems.map((item, index) => (
                              <li key={`${item}-${index}`}>{item}</li>
                            ))}
                          </ol>
                        </WhiteBlock>
                      </section>

                      <section>
                        <SectionLabel label="Suggested Attachments" />
                        <WhiteBlock>
                          <ol className="space-y-3 pl-5 text-[14px] leading-7 text-slate-800">
                            {preview.suggestedAttachments.map((item, index) => (
                              <li key={`${item}-${index}`}>{item}</li>
                            ))}
                          </ol>
                        </WhiteBlock>
                      </section>

                      <section>
                        <SectionLabel label="Signature Block" />
                        <WhiteBlock>
                          <div className="space-y-3 text-[14px] leading-7 text-slate-700">
                            {preview.signatureBlock.map((line, index) => (
                              <div key={`${line}-${index}`}>{line || "\u00A0"}</div>
                            ))}
                          </div>
                        </WhiteBlock>
                      </section>

                      <section>
                        <div className="rounded-[16px] border border-dashed border-slate-300 bg-[#f7f9fb] px-4 py-4 text-[12px] leading-6 text-slate-600">
                          {preview.internalNote}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>          
      </div>
    </div>
  );
}

function RailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-slate-500">
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function RailCard({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </div>
      <div
        className={[
          "mt-3 text-sm text-white",
          multiline ? "leading-7" : "break-words",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function GhostAction({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
    >
      {label}
    </button>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300">
      {label}
    </span>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#184b85]">
      {label}
    </div>
  );
}

function WhiteBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-slate-300 bg-[#f7f9fb] p-4">
      {children}
    </div>
  );
}

function MetaBox({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[14px] border border-slate-300 bg-[#f0f3f6] px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div
        className={[
          "mt-2 text-sm font-semibold",
          accent ? "text-emerald-600" : "text-slate-900",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return <MetaBox label={label} value={value} accent={accent} />;
}

function LongBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-slate-300 bg-[#f0f3f6] px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm leading-7 text-slate-800">{value}</div>
    </div>
  );
}
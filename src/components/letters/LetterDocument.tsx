"use client";

type LetterData = {
  claim_id: string;
  payer?: string;
  patient_name?: string;
  cpt_code?: string;
  date_of_service?: string;
  billed_amount?: number;
  paid_amount?: number;
  benchmark_amount?: number;
  delta?: number;
  issue?: string;
  appeal_text?: string;
};

function formatCurrency(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function normalizeIssue(issue?: string) {
  if (!issue) return "payment variance identified during review";
  return issue.trim().replace(/\.$/, "");
}

function buildSubjectLine(data: LetterData) {
  const claimId = data.claim_id || "—";
  const payer = data.payer || "Insurance Payer";

  if (data.issue) {
    return `Re: Request for Payment Review – Claim ${claimId}`;
  }

  return `Re: Request for Payment Review – ${payer} Claim ${claimId}`;
}

function buildDefaultAppealText(data: LetterData) {
  const issue = normalizeIssue(data.issue);

  return [
    `We are writing to request review of the above-referenced claim following our internal reimbursement review.`,
    `Our review indicates a potential discrepancy associated with ${issue}.`,
    `Please review the claim against the applicable fee schedule, reimbursement methodology, contract terms, coding logic, and adjudication rules used in processing.`,
    `If the claim was processed incorrectly, we respectfully request corrected payment and updated remittance detail.`,
  ];
}

export default function LetterDocument({ data }: { data: LetterData }) {
  const today = new Date().toLocaleDateString("en-US");
  const subjectLine = buildSubjectLine(data);
  const defaultParagraphs = buildDefaultAppealText(data);

  return (
    <div className="mx-auto w-full max-w-4xl rounded-[28px] border border-black/10 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
      <div className="border-b border-black/10 px-8 py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Revyola Recovery Letter
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Appeal Draft Preview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Structured for RCM and payer follow-up workflow
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Claim ID</div>
              <div className="font-medium text-slate-900">{data.claim_id || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Payer</div>
              <div className="font-medium text-slate-900">{data.payer || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">CPT</div>
              <div className="font-medium text-slate-900">{data.cpt_code || "—"}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">DOS</div>
              <div className="font-medium text-slate-900">{data.date_of_service || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-black/10 bg-slate-50/80 p-6 lg:border-b-0 lg:border-r">
          <div className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Claim Snapshot
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-wide text-slate-400">Issue</div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {data.issue || "Potential underpayment identified"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="text-slate-500">Billed</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(data.billed_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="text-slate-500">Paid</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(data.paid_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="text-slate-500">Expected</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(data.benchmark_amount)}
                </span>
              </div>
              <div className="mt-2 border-t border-dashed border-slate-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Recovery Opportunity</span>
                  <span className="text-base font-semibold text-emerald-600">
                    {formatCurrency(data.delta)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="p-8">
          <div className="mb-6 text-sm leading-7 text-slate-700">
            <p>{today}</p>

            <p className="mt-6">
              Appeals Department
              <br />
              {data.payer || "Insurance Payer"}
            </p>

            <p className="mt-6 font-medium text-slate-900">{subjectLine}</p>

            <p className="mt-4">
              Claim ID: <span className="font-medium text-slate-900">{data.claim_id || "—"}</span>
              <br />
              CPT Code: <span className="font-medium text-slate-900">{data.cpt_code || "—"}</span>
              <br />
              Date of Service:{" "}
              <span className="font-medium text-slate-900">{data.date_of_service || "—"}</span>
            </p>
          </div>

          <div className="prose prose-slate max-w-none text-[15px] leading-7">
            <p>Dear Appeals Reviewer,</p>

            {data.appeal_text ? (
              <p>{data.appeal_text}</p>
            ) : (
              <>
                {defaultParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </>
            )}

            <p>
              Thank you for your prompt attention to this matter. We appreciate your review and
              request a written response or corrected payment determination.
            </p>

            <p className="mt-8">
              Sincerely,
              <br />
              Revenue Recovery Team
              <br />
              Revyola
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
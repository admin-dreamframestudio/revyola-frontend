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

export default function LetterDocument({ data }: { data: LetterData }) {
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
            <p>{new Date().toLocaleDateString("en-US")}</p>

            <p className="mt-6">
              Appeals Department
              <br />
              {data.payer || "Insurance Payer"}
            </p>

            <p className="mt-6 font-medium text-slate-900">
              Re: Request for Payment Review / Underpayment Reconsideration
            </p>

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
            <p>
              Dear Appeals Reviewer,
            </p>

            <p>
              We are requesting a review of the reimbursement issued for the above referenced
              claim. Based on our internal payment integrity review, the amount paid appears to
              be inconsistent with the expected reimbursement for the billed service.
            </p>

            <p>
              The identified variance suggests a potential underpayment related to{" "}
              <strong>{data.issue || "reimbursement methodology"}</strong>. We request a full
              reconsideration of this claim and any associated repricing logic, contract terms,
              or adjudication edits that may have contributed to the variance.
            </p>

            <p>
              Expected reimbursement: <strong>{formatCurrency(data.benchmark_amount)}</strong>
              <br />
              Actual reimbursement: <strong>{formatCurrency(data.paid_amount)}</strong>
              <br />
              Estimated variance: <strong>{formatCurrency(data.delta)}</strong>
            </p>

            {data.appeal_text ? (
              <p>{data.appeal_text}</p>
            ) : (
              <p>
                Please review the claim against the applicable fee schedule, contract terms,
                coding logic, and payer reimbursement policy. If an error occurred during
                adjudication, we request corrected payment and updated remittance detail at your
                earliest convenience.
              </p>
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
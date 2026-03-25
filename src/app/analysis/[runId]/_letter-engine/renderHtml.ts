import type { DraftLetterInput } from "./types";
import {
  escapeHtml,
  formatCurrency,
  formatPercent,
  safeText,
  shortDateTime,
} from "./helpers";
import { getTemplate } from "./templates";

export function renderHtml(input: DraftLetterInput) {
  const template = getTemplate(input.templateKey);

  const claimsMarkup = input.claims
    .map(
      (claim, index) => `
        <div class="claim-card">
          <div class="claim-header">
            <div class="claim-index">Claim ${index + 1}</div>
            <div class="claim-id">${escapeHtml(claim.claimId)}</div>
          </div>

          <div class="claim-grid">
            <div class="kv">
              <div class="k">Payer</div>
              <div class="v">${escapeHtml(claim.payer)}</div>
            </div>
            <div class="kv">
              <div class="k">CPT</div>
              <div class="v">${escapeHtml(claim.cptCode)}</div>
            </div>
            <div class="kv">
              <div class="k">Modifier</div>
              <div class="v">${escapeHtml(safeText(claim.modifier, "—"))}</div>
            </div>
            <div class="kv">
              <div class="k">Place of Service</div>
              <div class="v">${escapeHtml(safeText(claim.placeOfService, "—"))}</div>
            </div>
            <div class="kv">
              <div class="k">Allowed Amount</div>
              <div class="v">${escapeHtml(formatCurrency(claim.allowedAmount))}</div>
            </div>
            <div class="kv">
              <div class="k">Expected Amount</div>
              <div class="v">${escapeHtml(formatCurrency(claim.expectedAmount))}</div>
            </div>
            <div class="kv accent-positive">
              <div class="k">Gap Amount</div>
              <div class="v">${escapeHtml(formatCurrency(claim.gapAmount))}</div>
            </div>
            <div class="kv">
              <div class="k">Deviation</div>
              <div class="v">${escapeHtml(formatPercent(claim.deviationPct))}</div>
            </div>
            <div class="kv">
              <div class="k">Confidence</div>
              <div class="v">${escapeHtml(safeText(claim.confidence, "Unknown"))}</div>
            </div>
          </div>

          <div class="evidence-block">
            <div class="evidence-title">Claim rationale</div>
            <div class="evidence-body">${escapeHtml(safeText(claim.reason))}</div>
          </div>

          <div class="evidence-block">
            <div class="evidence-title">Rule applied</div>
            <div class="evidence-body">
              <strong>${escapeHtml(safeText(claim.ruleApplied))}</strong><br/>
              ${escapeHtml(safeText(claim.ruleReason))}
            </div>
          </div>

          <div class="evidence-block">
            <div class="evidence-title">ICD explainability</div>
            <div class="evidence-body">
              ${escapeHtml(safeText(claim.icdExplainability))}<br/>
              <span class="muted">Confidence adjustment: ${escapeHtml(
                safeText(claim.icdConfidenceAdjustment)
              )}</span>
            </div>
          </div>
        </div>
      `
    )
    .join("");

  const recommendedActions = input.recommendedActions
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const attachmentItems = input.attachmentsChecklist
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(template.subject(input))}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        --bg: #eef3f8;
        --paper: #ffffff;
        --ink: #0f172a;
        --muted: #5b6476;
        --line: #d9e2ec;
        --soft: #f8fafc;
        --brand: #0f4c81;
        --brand-2: #1f6aa5;
        --positive: #0f9f6e;
      }

      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .page-wrap {
        padding: 32px 20px 40px;
      }

      .page {
        width: 100%;
        max-width: 980px;
        margin: 0 auto;
        background: var(--paper);
        border: 1px solid var(--line);
        border-radius: 22px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.10);
      }

      .header {
        background:
          linear-gradient(135deg, rgba(15, 76, 129, 0.98), rgba(31, 106, 165, 0.94));
        color: white;
        padding: 28px 34px;
      }

      .header-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .brand-mark {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        opacity: 0.92;
      }

      .brand-dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.95);
      }

      .header h1 {
        margin: 16px 0 0;
        font-size: 30px;
        line-height: 1.15;
        letter-spacing: -0.03em;
      }

      .header-sub {
        margin-top: 12px;
        max-width: 760px;
        font-size: 14px;
        line-height: 1.7;
        color: rgba(255,255,255,0.86);
      }

      .badge {
        border: 1px solid rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.08);
        padding: 8px 12px;
        border-radius: 999px;
        font-size: 11px;
        white-space: nowrap;
      }

      .body {
        padding: 30px 34px 34px;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 24px;
      }

      .meta-card {
        border: 1px solid var(--line);
        background: var(--soft);
        border-radius: 16px;
        padding: 14px 14px 13px;
      }

      .meta-card .k {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--muted);
      }

      .meta-card .v {
        margin-top: 6px;
        font-size: 15px;
        font-weight: 650;
        color: var(--ink);
      }

      .section {
        margin-top: 24px;
      }

      .section-title {
        margin: 0 0 12px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: var(--brand);
        font-weight: 700;
      }

      .letter-card {
        border: 1px solid var(--line);
        background: #fff;
        border-radius: 18px;
        padding: 22px 22px 20px;
      }

      .salutation, .body-copy, .request-copy {
        font-size: 14px;
        line-height: 1.85;
        color: var(--ink);
      }

      .body-copy + .body-copy,
      .request-copy + .request-copy {
        margin-top: 12px;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .summary-tile {
        border: 1px solid var(--line);
        background: var(--soft);
        border-radius: 16px;
        padding: 14px;
      }

      .summary-tile .k {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--muted);
      }

      .summary-tile .v {
        margin-top: 8px;
        font-size: 18px;
        font-weight: 700;
      }

      .summary-tile.positive .v {
        color: var(--positive);
      }

      .claim-card {
        border: 1px solid var(--line);
        background: white;
        border-radius: 18px;
        padding: 18px;
        margin-top: 14px;
      }

      .claim-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }

      .claim-index {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--muted);
      }

      .claim-id {
        font-size: 15px;
        font-weight: 700;
      }

      .claim-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }

      .kv {
        border: 1px solid var(--line);
        background: var(--soft);
        border-radius: 14px;
        padding: 12px;
      }

      .kv .k {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--muted);
      }

      .kv .v {
        margin-top: 6px;
        font-size: 14px;
        font-weight: 650;
        color: var(--ink);
      }

      .accent-positive .v {
        color: var(--positive);
      }

      .evidence-block {
        margin-top: 12px;
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 14px;
        background: #fff;
      }

      .evidence-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--muted);
        font-weight: 700;
      }

      .evidence-body {
        margin-top: 8px;
        font-size: 14px;
        line-height: 1.8;
        color: var(--ink);
      }

      .muted {
        color: var(--muted);
      }

      .list-card {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 18px 20px;
        background: white;
      }

      .list-card ol {
        margin: 0;
        padding-left: 20px;
      }

      .list-card li {
        margin: 8px 0;
        line-height: 1.8;
        color: var(--ink);
      }

      .signature {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 22px;
        background: linear-gradient(180deg, #ffffff, #fafcff);
      }

      .signature .line {
        margin-top: 10px;
        color: var(--muted);
        line-height: 1.9;
      }

      .footer-note {
        margin-top: 18px;
        padding: 14px 16px;
        border-radius: 14px;
        background: #f8fafc;
        border: 1px dashed var(--line);
        color: var(--muted);
        font-size: 12px;
        line-height: 1.7;
      }

      @media (max-width: 900px) {
        .meta-grid,
        .summary-grid,
        .claim-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 640px) {
        .page-wrap {
          padding: 12px;
        }

        .header,
        .body {
          padding-left: 18px;
          padding-right: 18px;
        }

        .meta-grid,
        .summary-grid,
        .claim-grid {
          grid-template-columns: 1fr;
        }

        .header-top {
          flex-direction: column;
          align-items: flex-start;
        }

        .claim-header {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      @media print {
        body {
          background: white;
        }

        .page-wrap {
          padding: 0;
        }

        .page {
          box-shadow: none;
          border: none;
          max-width: none;
          border-radius: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="page-wrap">
      <div class="page">
        <div class="header">
          <div class="header-top">
            <div>
              <div class="brand-mark">
                <span class="brand-dot"></span>
                Revyola Recovery Draft
              </div>
              <h1>${escapeHtml(template.subject(input))}</h1>
              <div class="header-sub">
                Evidence-backed reimbursement review draft prepared from modeled claim and pattern variance signals.
              </div>
            </div>
            <div class="badge">
              Generated ${escapeHtml(shortDateTime(input.generatedAtIso))}
            </div>
          </div>
        </div>

        <div class="body">
          <div class="meta-grid">
            <div class="meta-card">
              <div class="k">Run ID</div>
              <div class="v">${escapeHtml(input.runId)}</div>
            </div>
            <div class="meta-card">
              <div class="k">Payer</div>
              <div class="v">${escapeHtml(input.payer)}</div>
            </div>
            <div class="meta-card">
              <div class="k">Letter Mode</div>
              <div class="v">${escapeHtml(input.mode)}</div>
            </div>
            <div class="meta-card">
              <div class="k">Template</div>
              <div class="v">${escapeHtml(input.templateKey)}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Draft letter</div>
            <div class="letter-card">
              <div class="salutation">To Whom It May Concern,</div>
              <div class="body-copy" style="margin-top:14px;">
                ${escapeHtml(template.intro(input))}
              </div>
              <div class="body-copy">
                ${escapeHtml(template.issue(input))}
              </div>
              <div class="request-copy">
                ${escapeHtml(input.requestedOutcome)}
              </div>
              <div class="request-copy">
                ${escapeHtml(template.request(input))}
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Payment summary</div>
            <div class="summary-grid">
              <div class="summary-tile">
                <div class="k">Claims in scope</div>
                <div class="v">${input.claimCount}</div>
              </div>
              <div class="summary-tile positive">
                <div class="k">Modeled variance</div>
                <div class="v">${escapeHtml(formatCurrency(input.totalGapAmount))}</div>
              </div>
              <div class="summary-tile">
                <div class="k">Average deviation</div>
                <div class="v">${escapeHtml(formatPercent(input.avgDeviationPct))}</div>
              </div>
              <div class="summary-tile">
                <div class="k">Confidence</div>
                <div class="v">${escapeHtml(safeText(input.confidenceSummary, "Unknown"))}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Claim-level evidence</div>
            ${claimsMarkup}
          </div>

          <div class="section">
            <div class="section-title">Recommended billing team follow-up</div>
            <div class="list-card">
              <ol>${recommendedActions}</ol>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Suggested attachments</div>
            <div class="list-card">
              <ol>${attachmentItems}</ol>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Signature block</div>
            <div class="signature">
              <div class="body-copy">Sincerely,</div>
              <div class="line">[Practice / Billing Team Name]</div>
              <div class="line">[Contact Name]</div>
              <div class="line">[Title]</div>
              <div class="line">[Phone]</div>
              <div class="line">[Email]</div>
            </div>
          </div>

          <div class="footer-note">
            Internal note: This draft should be validated by the billing, compliance, and payer-submission team before use in any reconsideration or recovery workflow.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
`;

  return html;
}
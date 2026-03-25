import { formatCurrency, formatPercent } from "./helpers";
import { getTemplate } from "./templates";
import type { DraftLetterInput, DraftLetterResult } from "./types";

export function renderText(input: DraftLetterInput): DraftLetterResult {
  const t = getTemplate(input.templateKey);

  const text = `
${t.subject(input)}

Payer: ${input.payer}
Claims: ${input.claimCount}
Variance: ${formatCurrency(input.totalGapAmount)}

${t.intro(input)}

${t.issue(input)}

Requested Action:
${t.request(input)}

`;

  return {
    title: "Draft",
    fileBaseName: "draft",
    mode: input.mode,
    text,
    html: "",
    metadata: {
      payer: input.payer,
      claimIds: input.claims.map((c) => c.claimId),
      totalGapAmount: input.totalGapAmount,
      claimCount: input.claimCount,
      confidenceSummary: input.confidenceSummary,
      templateKey: input.templateKey,
    },
  };
}

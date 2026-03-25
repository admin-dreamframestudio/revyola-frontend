import type { DraftLetterInput, LetterTemplateKey } from "./types";

type Template = {
  subject: (i: DraftLetterInput) => string;
  intro: (i: DraftLetterInput) => string;
  issue: (i: DraftLetterInput) => string;
  request: (i: DraftLetterInput) => string;
};

const generic: Template = {
  subject: () => "Request for reimbursement review",
  intro: () =>
    "We are submitting a request for review based on a reimbursement variance identified post-payment.",
  issue: () =>
    "The claim appears underpaid relative to expected reimbursement based on billed configuration.",
  request: () =>
    "Please review and reprocess if appropriate.",
};

const pattern: Template = {
  subject: (i) => `Systemic reimbursement review - ${i.payer}`,
  intro: () =>
    "We have identified a repeatable reimbursement variance pattern across multiple claims.",
  issue: (i) =>
    `Across ${i.claimCount} claims, total variance of ${i.totalGapAmount} has been observed.`,
  request: () =>
    "Please review all impacted claims and advise on correction.",
};

const map: Record<LetterTemplateKey, Template> = {
  generic_underpayment_review: generic,
  generic_pattern_escalation: pattern,
  uhc_underpayment_review: generic,
  aetna_underpayment_review: generic,
  cigna_underpayment_review: generic,
  bcbs_underpayment_review: generic,
};

export function getTemplate(key: LetterTemplateKey) {
  return map[key] || generic;
}

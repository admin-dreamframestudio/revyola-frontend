export type Pattern = {
  pattern_id: string;
  description: string;
  payer: string;
  cpt_code: string;
  modifier: string;
  place_of_service: string;
  impact: number;
  affected_claims: number;
  avg_deviation_pct: number;
  confidence: string;
};

export type FlaggedClaim = {
  claim_id: string;
  payer: string;
  cpt_code: string;
  modifier: string;
  place_of_service: string;
  allowed_amount: number;
  expected_amount: number;
  gap_amount: number;
  deviation_pct: number;
  confidence: string;
  reason: string;
  rule_applied: string;
  rule_reason: string;
  icd_explainability: string;
  icd_confidence_adjustment: string;
  pattern_id: string;
};

export type LetterMode = "claim" | "pattern";

export type DraftTone = "formal" | "firm" | "neutral";

export type LetterTemplateKey =
  | "generic_underpayment_review"
  | "generic_pattern_escalation"
  | "uhc_underpayment_review"
  | "aetna_underpayment_review"
  | "cigna_underpayment_review"
  | "bcbs_underpayment_review";

export type LetterClaimEvidence = {
  claimId: string;
  payer: string;
  cptCode: string;
  modifier: string;
  placeOfService: string;
  allowedAmount: number;
  expectedAmount: number;
  gapAmount: number;
  deviationPct: number;
  confidence: string;
  reason: string;
  ruleApplied: string;
  ruleReason: string;
  icdExplainability: string;
  icdConfidenceAdjustment: string;
};

export type DraftLetterInput = {
  mode: LetterMode;
  runId: string;
  generatedAtIso: string;
  payer: string;
  patternId?: string;
  patternDescription?: string;
  cptCode?: string;
  modifier?: string;
  placeOfService?: string;
  totalGapAmount: number;
  avgDeviationPct: number;
  claimCount: number;
  confidenceSummary: string;
  tone: DraftTone;
  templateKey: LetterTemplateKey;
  claims: LetterClaimEvidence[];
  recommendedActions: string[];
  requestedOutcome: string;
  attachmentsChecklist: string[];
};

export type DraftLetterResult = {
  title: string;
  fileBaseName: string;
  mode: LetterMode;
  text: string;
  html: string;
  metadata: {
    payer: string;
    claimIds: string[];
    totalGapAmount: number;
    claimCount: number;
    confidenceSummary: string;
    templateKey: LetterTemplateKey;
  };
};

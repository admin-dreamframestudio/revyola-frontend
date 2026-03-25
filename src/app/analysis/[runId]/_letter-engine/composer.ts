import { average, summarizeConfidence, selectTemplateKey } from "./helpers";
import type { DraftLetterInput, FlaggedClaim, Pattern } from "./types";

export function buildClaimInput(claim: FlaggedClaim, runId: string): DraftLetterInput {
  return {
    mode: "claim",
    runId,
    generatedAtIso: new Date().toISOString(),
    payer: claim.payer,
    cptCode: claim.cpt_code,
    modifier: claim.modifier,
    placeOfService: claim.place_of_service,
    totalGapAmount: claim.gap_amount,
    avgDeviationPct: claim.deviation_pct,
    claimCount: 1,
    confidenceSummary: summarizeConfidence([claim]),
    tone: "formal",
    templateKey: selectTemplateKey(claim.payer, "claim"),
    claims: [
      {
        claimId: claim.claim_id,
        payer: claim.payer,
        cptCode: claim.cpt_code,
        modifier: claim.modifier,
        placeOfService: claim.place_of_service,
        allowedAmount: claim.allowed_amount,
        expectedAmount: claim.expected_amount,
        gapAmount: claim.gap_amount,
        deviationPct: claim.deviation_pct,
        confidence: claim.confidence,
        reason: claim.reason,
        ruleApplied: claim.rule_applied,
        ruleReason: claim.rule_reason,
        icdExplainability: claim.icd_explainability,
        icdConfidenceAdjustment: claim.icd_confidence_adjustment,
      },
    ],
    recommendedActions: ["Review claim", "Validate pricing"],
    requestedOutcome: "Please reprocess if needed",
    attachmentsChecklist: ["Claim", "ERA"],
  };
}

export function buildPatternInput(pattern: Pattern | null, claims: FlaggedClaim[], runId: string): DraftLetterInput {
  return {
    mode: "pattern",
    runId,
    generatedAtIso: new Date().toISOString(),
    payer: pattern?.payer || claims[0].payer,
    totalGapAmount: claims.reduce((s, c) => s + c.gap_amount, 0),
    avgDeviationPct: average(claims.map((c) => c.deviation_pct)),
    claimCount: claims.length,
    confidenceSummary: summarizeConfidence(claims),
    tone: "formal",
    templateKey: selectTemplateKey(pattern?.payer || "", "pattern"),
    claims: claims.slice(0, 10).map((c) => ({
      claimId: c.claim_id,
      payer: c.payer,
      cptCode: c.cpt_code,
      modifier: c.modifier,
      placeOfService: c.place_of_service,
      allowedAmount: c.allowed_amount,
      expectedAmount: c.expected_amount,
      gapAmount: c.gap_amount,
      deviationPct: c.deviation_pct,
      confidence: c.confidence,
      reason: c.reason,
      ruleApplied: c.rule_applied,
      ruleReason: c.rule_reason,
      icdExplainability: c.icd_explainability,
      icdConfidenceAdjustment: c.icd_confidence_adjustment,
    })),
    recommendedActions: ["Review pattern"],
    requestedOutcome: "Please review all claims",
    attachmentsChecklist: ["Summary", "ERA"],
  };
}

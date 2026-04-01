export type CommunicationPreview = {
  title: string;
  subtitle: string;
  subject: string;
  recipientLabel: string;
  generatedAt: string;

  intelligence: {
    template: string;
    claimsIncluded: string[];
    letterMode: string;
    fileBase: string;
    recommendation: string;
    payerClaimId?: string;
  };

  summary: {
    claimsInScope: number;
    paidAmount: string;
    adjustmentAmount: string;
    patientResponsibility: string;
    totalCharge: string;
    note: string;
  };

  draftLetter: string;

  evidence: Array<{
    claimId: string;
    payerClaimId?: string;
    totalCharge?: string;
    paidAmount?: string;
    patientResponsibility?: string;
    adjustmentCode?: string;
    adjustmentAmount?: string;
    reason?: string;
    recommendedAction?: string;
    priorityScore?: string;
    note?: string;
  }>;

  followUpItems: string[];
  suggestedAttachments: string[];
  signatureBlock: string[];
  internalNote: string;
};

type ClaimPreviewInput = {
  claim_id: string;
  total_charge: number;
  paid_amount: number;
  patient_responsibility: number;
  payer_claim_id?: string | null;
};

type WorkItemInput = {
  claim_id: string;
  adjustment_code: string;
  adjustment_amount: number;
  action_type: string;
  reason: string;
  recommended_action: string;
  priority_score: number;
};

export function buildCommunicationPreview(args: {
  item: WorkItemInput;
  claim?: ClaimPreviewInput | null;
  fileName?: string;
  uploadId?: string;
}): CommunicationPreview {
  const { item, claim, fileName, uploadId } = args;
  const code = (item.adjustment_code || "").toUpperCase();

  const common = buildCommonFields(item, claim, fileName, uploadId);

  if (code === "CO-16") {
    return {
      ...common,
      title: "Request for claim documentation review",
      subtitle:
        "835-based draft prepared from remittance adjudication details and paid claim context.",
      subject: `Request for claim review – Claim ${item.claim_id}`,
      recipientLabel: "Payer Claims Review Team",
      intelligence: {
        ...common.intelligence,
        template: "co16_documentation_review",
        recommendation:
          "Review documentation requirements, validate the remittance adjustment basis, and prepare for reconsideration if needed.",
      },
      draftLetter: `
To Whom It May Concern,

We are requesting review of Claim ${item.claim_id}.

The remittance reflects total billed charges of ${formatCurrency(
        claim?.total_charge ?? 0
      )}, a paid amount of ${formatCurrency(
        claim?.paid_amount ?? 0
      )}, and patient responsibility of ${formatCurrency(
        claim?.patient_responsibility ?? 0
      )}. The remittance also includes adjustment code ${item.adjustment_code} with adjustment detail of ${formatCurrency(
        item.adjustment_amount
      )}.

The issue identified for follow-up is:
${item.reason}

Recommended action:
${item.recommended_action}

Please review the basis for this remittance adjustment and advise whether additional documentation, correction, or reconsideration is required for appropriate claim resolution.

We appreciate your assistance and request confirmation of next steps.

Sincerely,

[Practice / Billing Team Name]
[Contact Name]
[Title]
[Phone]
[Email]
      `.trim(),
      followUpItems: [
        "Validate the remittance adjustment against submitted claim context.",
        "Confirm whether additional documentation is required.",
        "Prepare reconsideration package if payer requests records or clarification.",
      ],
      suggestedAttachments: [
        "Claim form / claim detail",
        "ERA / remittance detail",
        "Relevant supporting documentation",
      ],
    };
  }

  if (code === "CO-45") {
    return {
      ...common,
      title: "Request for reimbursement review",
      subtitle:
        "835-based draft prepared from paid claim outcome and remittance adjudication detail.",
      subject: `Request for reimbursement review – Claim ${item.claim_id}`,
      recipientLabel: "Payer Reimbursement Review Team",
      intelligence: {
        ...common.intelligence,
        template: "co45_reimbursement_review",
        recommendation:
          "Review the paid claim outcome and remittance adjustment logic to determine whether reprocessing is warranted.",
      },
      draftLetter: `
To Whom It May Concern,

We are requesting reimbursement review for Claim ${item.claim_id}.

The remittance reflects total billed charges of ${formatCurrency(
        claim?.total_charge ?? 0
      )}, a paid amount of ${formatCurrency(
        claim?.paid_amount ?? 0
      )}, and patient responsibility of ${formatCurrency(
        claim?.patient_responsibility ?? 0
      )}. The remittance also includes adjustment code ${item.adjustment_code} with adjustment detail of ${formatCurrency(
        item.adjustment_amount
      )}.

The issue identified for review is:
${item.reason}

Recommended action:
${item.recommended_action}

Please review the adjudication and payment outcome for this claim and confirm whether the current remittance adjustment was applied correctly. If further review supports reprocessing or correction, please update the claim accordingly.

We appreciate written confirmation of the review outcome.

Sincerely,

[Practice / Billing Team Name]
[Contact Name]
[Title]
[Phone]
[Email]
      `.trim(),
      followUpItems: [
        "Review paid amount against billed charge and remittance adjustment detail.",
        "Validate whether the remittance adjustment was applied appropriately.",
        "Request corrected payment or reprocessing if warranted.",
      ],
      suggestedAttachments: [
        "Claim form / claim detail",
        "ERA / remittance detail",
        "Payment posting support",
      ],
    };
  }

  if (code === "CO-97") {
    return {
      ...common,
      title: "Request for bundling or edit review",
      subtitle:
        "835-based draft prepared from remittance adjudication detail and claim payment outcome.",
      subject: `Request for claim edit review – Claim ${item.claim_id}`,
      recipientLabel: "Payer Claims Adjustment Team",
      intelligence: {
        ...common.intelligence,
        template: "co97_bundling_edit_review",
        recommendation:
          "Review bundling or edit rationale and confirm whether the claim requires correction or exception handling.",
      },
      draftLetter: `
To Whom It May Concern,

We are requesting review of Claim ${item.claim_id}.

The remittance reflects total billed charges of ${formatCurrency(
        claim?.total_charge ?? 0
      )}, a paid amount of ${formatCurrency(
        claim?.paid_amount ?? 0
      )}, and patient responsibility of ${formatCurrency(
        claim?.patient_responsibility ?? 0
      )}. The remittance also includes adjustment code ${item.adjustment_code} with adjustment detail of ${formatCurrency(
        item.adjustment_amount
      )}.

The issue identified for review is:
${item.reason}

Recommended action:
${item.recommended_action}

Please review the edit or bundling rationale applied to this claim and confirm whether the current adjudication remains appropriate. If an exception or corrected processing path applies, please reprocess the claim accordingly.

We appreciate your review and confirmation.

Sincerely,

[Practice / Billing Team Name]
[Contact Name]
[Title]
[Phone]
[Email]
      `.trim(),
      followUpItems: [
        "Review the adjustment code and remittance context.",
        "Validate whether bundling or edit logic was applied correctly.",
        "Escalate if a correction or exception path is appropriate.",
      ],
      suggestedAttachments: [
        "Claim form / claim detail",
        "ERA / remittance detail",
        "Coding or service detail if needed",
      ],
    };
  }

  if (code === "PR-1") {
    return {
      ...common,
      title: "Request for responsibility clarification",
      subtitle:
        "835-based draft prepared from paid claim outcome and responsibility assignment detail.",
      subject: `Request for claim clarification – Claim ${item.claim_id}`,
      recipientLabel: "Payer Claims Support",
      intelligence: {
        ...common.intelligence,
        template: "pr1_responsibility_clarification",
        recommendation:
          "Validate whether current responsibility assignment and claim outcome are correct before escalation.",
      },
      draftLetter: `
To Whom It May Concern,

We are requesting clarification for Claim ${item.claim_id}.

The remittance reflects total billed charges of ${formatCurrency(
        claim?.total_charge ?? 0
      )}, a paid amount of ${formatCurrency(
        claim?.paid_amount ?? 0
      )}, and patient responsibility of ${formatCurrency(
        claim?.patient_responsibility ?? 0
      )}. The remittance also includes adjustment code ${item.adjustment_code} with adjustment detail of ${formatCurrency(
        item.adjustment_amount
      )}.

The issue identified for follow-up is:
${item.reason}

Recommended action:
${item.recommended_action}

Please confirm whether the current adjudication and responsibility assignment are accurate. If the claim was processed incorrectly, please advise on the appropriate correction path.

Thank you for your assistance.

Sincerely,

[Practice / Billing Team Name]
[Contact Name]
[Title]
[Phone]
[Email]
      `.trim(),
      followUpItems: [
        "Validate current responsibility assignment.",
        "Confirm whether patient responsibility was assigned correctly.",
        "Escalate only if payer-side correction is appropriate.",
      ],
      suggestedAttachments: [
        "Claim form / claim detail",
        "ERA / remittance detail",
        "Benefits or eligibility context if available",
      ],
    };
  }

  return {
    ...common,
    title: "Request for claim review",
    subtitle:
      "835-based draft prepared from remittance adjudication detail and paid claim outcome.",
    subject: `Request for claim review – Claim ${item.claim_id}`,
    recipientLabel: "Payer Claims Team",
    intelligence: {
      ...common.intelligence,
      template: "general_claim_review",
      recommendation:
        "Review the claim outcome and remittance adjustment to determine the proper next step.",
    },
    draftLetter: `
To Whom It May Concern,

We are requesting review of Claim ${item.claim_id}.

The remittance reflects total billed charges of ${formatCurrency(
        claim?.total_charge ?? 0
      )}, a paid amount of ${formatCurrency(
        claim?.paid_amount ?? 0
      )}, and patient responsibility of ${formatCurrency(
        claim?.patient_responsibility ?? 0
      )}. The remittance also includes adjustment code ${item.adjustment_code} with adjustment detail of ${formatCurrency(
        item.adjustment_amount
      )}.

The current remittance review identified the following issue:
${item.reason}

Recommended action:
${item.recommended_action}

Please review the adjudication and advise whether reprocessing, clarification, or additional follow-up is appropriate.

Thank you for your review.

Sincerely,

[Practice / Billing Team Name]
[Contact Name]
[Title]
[Phone]
[Email]
    `.trim(),
    followUpItems: [
      "Validate the claim outcome and remittance adjustment details.",
      "Confirm the appropriate follow-up path before escalation.",
    ],
    suggestedAttachments: [
      "Claim form / claim detail",
      "ERA / remittance detail",
    ],
  };
}

function buildCommonFields(
  item: WorkItemInput,
  claim?: ClaimPreviewInput | null,
  fileName?: string,
  _uploadId?: string
): Omit<
  CommunicationPreview,
  "title" | "subtitle" | "subject" | "recipientLabel" | "draftLetter"
> {
  return {
    generatedAt: formatDateTime(new Date()),
    intelligence: {
      template: normalizeTemplateName(item.adjustment_code),
      claimsIncluded: [item.claim_id],
      letterMode: "claim",
      fileBase: normalizeFileBase(fileName),
      recommendation: item.recommended_action,
      payerClaimId: claim?.payer_claim_id ?? undefined,
    },
    summary: {
      claimsInScope: 1,
      paidAmount: formatCurrency(claim?.paid_amount ?? 0),
      adjustmentAmount: formatCurrency(item.adjustment_amount),
      patientResponsibility: formatCurrency(claim?.patient_responsibility ?? 0),
      totalCharge: formatCurrency(claim?.total_charge ?? 0),
      note:
        "Remittance adjustment is shown as adjudication detail and should not be added to total charge for reconciliation.",
    },
    evidence: [
      {
        claimId: item.claim_id,
        payerClaimId: claim?.payer_claim_id ?? undefined,
        totalCharge: formatCurrency(claim?.total_charge ?? 0),
        paidAmount: formatCurrency(claim?.paid_amount ?? 0),
        patientResponsibility: formatCurrency(
          claim?.patient_responsibility ?? 0
        ),
        adjustmentCode: item.adjustment_code,
        adjustmentAmount: formatCurrency(item.adjustment_amount),
        reason: item.reason,
        recommendedAction: item.recommended_action,
        priorityScore: String(item.priority_score),
        note:
          "Adjustment detail is part of remittance adjudication and is not presented as an additional billed amount.",
      },
    ],
    followUpItems: [],
    suggestedAttachments: [],
    signatureBlock: [
      "Sincerely,",
      "",
      "[Practice / Billing Team Name]",
      "[Contact Name]",
      "[Title]",
      "[Phone]",
      "[Email]",
    ],
    internalNote:
      "Internal note: Validate this draft against remittance details, claim context, and supporting documentation before submission to the payer.",
  };
}

function normalizeTemplateName(code: string) {
  const clean = (code || "general").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return `${clean}_review`;
}

function normalizeFileBase(fileName?: string) {
  if (!fileName) return "draft";
  const base = fileName.replace(/\.[^.]+$/, "").trim();
  return base || "draft";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
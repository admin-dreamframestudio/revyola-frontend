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
    requestType: string;
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
    actionType?: string;
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
  const code = normalizeCode(item.adjustment_code);
  const actionType = normalizeActionType(item.action_type, item.recommended_action);
  const common = buildCommonFields(item, claim, fileName, uploadId, actionType);

  if (code === "CO-16") {
    if (actionType === "corrected_claim") {
      return {
        ...common,
        title: "Corrected claim submission support letter",
        subtitle:
          "Provider communication prepared for corrected claim handling based on remittance adjudication detail.",
        subject: `Corrected Claim Submission Support – Claim ${item.claim_id} | ${item.adjustment_code}`,
        recipientLabel: "Claims Review / Corrected Claims Team",
        intelligence: {
          ...common.intelligence,
          template: "co16_corrected_claim_submission",
          requestType: "Corrected Claim Review",
          recommendation:
            "Submit corrected information and request processing upon receipt of the corrected claim or supporting information.",
        },
        draftLetter: correctedClaimLetter(item, claim, "missing or invalid information"),
        followUpItems: [
          "Validate the missing or invalid data element before submission.",
          "Submit corrected claim information in the payer-required format.",
          "Include remittance support and any required documentation with the corrected submission.",
        ],
        suggestedAttachments: [
          "Corrected claim form",
          "ERA / remittance detail",
          "Supporting documentation for corrected information",
        ],
      };
    }

    return {
      ...common,
      title: "Documentation review request",
      subtitle:
        "Provider communication prepared for documentation-driven follow-up based on remittance adjudication detail.",
      subject: `Documentation Review Request – Claim ${item.claim_id} | ${item.adjustment_code}`,
      recipientLabel: "Claims Review Team",
      intelligence: {
        ...common.intelligence,
        template: "co16_documentation_review",
        requestType: "Documentation Review",
        recommendation:
          "Submit supporting documentation and request reconsideration upon review.",
      },
      draftLetter: documentationReviewLetter(item, claim, "missing or invalid information"),
      followUpItems: [
        "Validate the remittance adjustment against submitted claim context.",
        "Identify and attach the documentation required to address the missing or invalid information.",
        "Submit documentation and request reconsideration or corrected processing as appropriate.",
      ],
      suggestedAttachments: [
        "Claim form / claim detail",
        "ERA / remittance detail",
        "Medical records or supporting documentation",
      ],
    };
  }

  if (code === "CO-45") {
    return {
      ...common,
      title: "Payment review request",
      subtitle:
        "Provider communication prepared for payment review based on remittance adjudication detail.",
      subject: `Payment Review Request – Claim ${item.claim_id} | ${item.adjustment_code}`,
      recipientLabel: "Reimbursement Review Team",
      intelligence: {
        ...common.intelligence,
        template: "co45_payment_review",
        requestType: "Payment Review",
        recommendation:
          "Request review of the adjudication and payment application reflected on the remittance.",
      },
      draftLetter: paymentReviewLetter(item, claim),
      followUpItems: [
        "Review paid amount against billed charge and remittance adjudication detail.",
        "Validate whether the adjustment was applied appropriately.",
        "Request reprocessing or payment correction if the adjudication was not applied correctly.",
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
      title: "Claim edit or bundling review request",
      subtitle:
        "Provider communication prepared for claim edit review based on remittance adjudication detail.",
      subject: `Claim Edit Review Request – Claim ${item.claim_id} | ${item.adjustment_code}`,
      recipientLabel: "Claims Adjustment Team",
      intelligence: {
        ...common.intelligence,
        template: "co97_edit_review",
        requestType: "Edit / Bundling Review",
        recommendation:
          "Request review of the bundling or edit application reflected on the remittance.",
      },
      draftLetter: editReviewLetter(item, claim),
      followUpItems: [
        "Review the adjustment code and remittance context.",
        "Validate whether bundling or edit logic was applied correctly.",
        "Escalate for corrected processing if the current edit application is not appropriate.",
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
      title: "Responsibility clarification request",
      subtitle:
        "Provider communication prepared for benefit or responsibility clarification based on remittance detail.",
      subject: `Responsibility Clarification Request – Claim ${item.claim_id} | ${item.adjustment_code}`,
      recipientLabel: "Claims Support Team",
      intelligence: {
        ...common.intelligence,
        template: "pr1_responsibility_clarification",
        requestType: "Responsibility Clarification",
        recommendation:
          "Request confirmation that the member responsibility reflected on the remittance was assigned correctly.",
      },
      draftLetter: responsibilityClarificationLetter(item, claim),
      followUpItems: [
        "Validate current responsibility assignment.",
        "Confirm whether patient responsibility was assigned correctly.",
        "Escalate only if payer-side correction appears warranted.",
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
    title: "Claim review request",
    subtitle:
      "Provider communication prepared from remittance adjudication detail and claim payment context.",
    subject: `Claim Review Request – Claim ${item.claim_id} | ${item.adjustment_code}`,
    recipientLabel: "Claims Review Team",
    intelligence: {
      ...common.intelligence,
      template: "general_claim_review",
      requestType: "Claim Review",
      recommendation:
        "Request review of the claim outcome and remittance adjudication reflected on the ERA.",
    },
    draftLetter: generalClaimReviewLetter(item, claim),
    followUpItems: [
      "Validate the claim outcome and remittance adjudication detail.",
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
  claim: ClaimPreviewInput | null | undefined,
  fileName: string | undefined,
  _uploadId: string | undefined,
  actionType: string
): Omit<
  CommunicationPreview,
  "title" | "subtitle" | "subject" | "recipientLabel" | "draftLetter"
> {
  return {
    generatedAt: formatDateTime(new Date()),
    intelligence: {
      template: normalizeTemplateName(item.adjustment_code, actionType),
      claimsIncluded: [item.claim_id],
      letterMode: "claim",
      fileBase: normalizeFileBase(fileName),
      recommendation: item.recommended_action,
      payerClaimId: claim?.payer_claim_id ?? undefined,
      requestType: humanizeActionType(actionType),
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
        patientResponsibility: formatCurrency(claim?.patient_responsibility ?? 0),
        adjustmentCode: item.adjustment_code,
        adjustmentAmount: formatCurrency(item.adjustment_amount),
        actionType: humanizeActionType(actionType),
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

function correctedClaimLetter(item: WorkItemInput, claim?: ClaimPreviewInput | null, issueText?: string) {
  return `
Subject: Corrected Claim Submission Support – Claim ${item.claim_id} | Adjustment Code: ${item.adjustment_code}

Dear Claims Review Team,

We are submitting this request regarding Claim ${item.claim_id} for review in connection with a corrected claim / corrected information submission.

The remittance reflects total billed charges of ${formatCurrency(
    claim?.total_charge ?? 0
  )}, a paid amount of ${formatCurrency(
    claim?.paid_amount ?? 0
  )}, and patient responsibility of ${formatCurrency(
    claim?.patient_responsibility ?? 0
  )}. The claim reflects adjustment code ${item.adjustment_code}, indicating ${issueText ?? item.reason.toLowerCase()} at the time of adjudication.

Based on our review, the issue identified for follow-up is:
${item.reason}

Recommended action:
${item.recommended_action}

We have identified the issue requiring correction and are preparing the corrected information / corrected claim for submission in accordance with payer requirements. Upon receipt of the corrected submission, we respectfully request review and appropriate adjudication of the claim.

Please advise if any additional documentation or clarification is required to facilitate processing.

Thank you for your attention to this matter.

Sincerely,

[Practice / Billing Team Name]
[Contact Name]
[Title]
[Phone]
[Email]
  `.trim();
}

function documentationReviewLetter(item: WorkItemInput, claim?: ClaimPreviewInput | null, issueText?: string) {
  return `
Subject: Documentation Review Request – Claim ${item.claim_id} | Adjustment Code: ${item.adjustment_code}

Dear Claims Review Team,

We are submitting this request regarding Claim ${item.claim_id} for documentation-based review.

The remittance reflects total billed charges of ${formatCurrency(
    claim?.total_charge ?? 0
  )}, a paid amount of ${formatCurrency(
    claim?.paid_amount ?? 0
  )}, and patient responsibility of ${formatCurrency(
    claim?.patient_responsibility ?? 0
  )}. The claim reflects adjustment code ${item.adjustment_code}, indicating ${issueText ?? item.reason.toLowerCase()} at the time of adjudication.

The issue identified for follow-up is:
${item.reason}

Recommended action:
${item.recommended_action}

We are prepared to provide supporting documentation and request review of the claim upon receipt of the required materials. Please advise whether any additional records, clarification, or claim correction are required for appropriate resolution.

We appreciate your assistance and request confirmation of next steps.

Sincerely,

[Practice / Billing Team Name]
[Contact Name]
[Title]
[Phone]
[Email]
  `.trim();
}

function paymentReviewLetter(item: WorkItemInput, claim?: ClaimPreviewInput | null) {
  return `
Subject: Payment Review Request – Claim ${item.claim_id} | Adjustment Code: ${item.adjustment_code}

Dear Reimbursement Review Team,

We are submitting this request regarding Claim ${item.claim_id} for payment review.

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

We respectfully request review of the adjudication and payment application reflected on the remittance and confirmation that the current adjustment was applied correctly. If review supports corrected processing or payment, please update the claim accordingly.

We appreciate written confirmation of the review outcome.

Sincerely,

[Practice / Billing Team Name]
[Contact Name]
[Title]
[Phone]
[Email]
  `.trim();
}

function editReviewLetter(item: WorkItemInput, claim?: ClaimPreviewInput | null) {
  return `
Subject: Claim Edit Review Request – Claim ${item.claim_id} | Adjustment Code: ${item.adjustment_code}

Dear Claims Adjustment Team,

We are submitting this request regarding Claim ${item.claim_id} for review of the edit / bundling outcome reflected on the remittance.

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

Please review the edit or bundling rationale applied to this claim and confirm whether the current adjudication remains appropriate. If corrected processing or an exception pathway applies, please update the claim accordingly.

We appreciate your review and confirmation.

Sincerely,

[Practice / Billing Team Name]
[Contact Name]
[Title]
[Phone]
[Email]
  `.trim();
}

function responsibilityClarificationLetter(item: WorkItemInput, claim?: ClaimPreviewInput | null) {
  return `
Subject: Responsibility Clarification Request – Claim ${item.claim_id} | Adjustment Code: ${item.adjustment_code}

Dear Claims Support Team,

We are submitting this request regarding Claim ${item.claim_id} for clarification of the responsibility assignment reflected on the remittance.

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
  `.trim();
}

function generalClaimReviewLetter(item: WorkItemInput, claim?: ClaimPreviewInput | null) {
  return `
Subject: Claim Review Request – Claim ${item.claim_id} | Adjustment Code: ${item.adjustment_code}

Dear Claims Review Team,

We are submitting this request regarding Claim ${item.claim_id} for review.

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

Please review the adjudication and advise whether reprocessing, clarification, or additional follow-up is appropriate.

Thank you for your review.

Sincerely,

[Practice / Billing Team Name]
[Contact Name]
[Title]
[Phone]
[Email]
  `.trim();
}

function normalizeCode(code: string) {
  return (code || "").trim().toUpperCase();
}

function normalizeActionType(actionType: string, recommendedAction: string) {
  const source = `${actionType || ""} ${recommendedAction || ""}`.toLowerCase();

  if (
    source.includes("resubmit") ||
    source.includes("resubmission") ||
    source.includes("corrected claim") ||
    source.includes("correct missing")
  ) {
    return "corrected_claim";
  }

  if (
    source.includes("documentation") ||
    source.includes("records") ||
    source.includes("medical record")
  ) {
    return "documentation_review";
  }

  if (source.includes("appeal") || source.includes("reconsideration")) {
    return "appeal_review";
  }

  if (source.includes("clarification") || source.includes("confirm")) {
    return "clarification";
  }

  if (source.includes("edit") || source.includes("bundling")) {
    return "edit_review";
  }

  if (source.includes("payment") || source.includes("reimbursement")) {
    return "payment_review";
  }

  return "claim_review";
}

function humanizeActionType(actionType: string) {
  switch (actionType) {
    case "corrected_claim":
      return "Corrected Claim Review";
    case "documentation_review":
      return "Documentation Review";
    case "appeal_review":
      return "Appeal / Reconsideration";
    case "clarification":
      return "Clarification";
    case "edit_review":
      return "Edit / Bundling Review";
    case "payment_review":
      return "Payment Review";
    default:
      return "Claim Review";
  }
}

function normalizeTemplateName(code: string, actionType: string) {
  const cleanCode = (code || "general").toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return `${cleanCode}_${actionType}`;
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
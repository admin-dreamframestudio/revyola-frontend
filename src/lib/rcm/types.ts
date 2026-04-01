export type ClaimPreview = {
  claim_id: string;
  total_charge: number;
  paid_amount: number;
  patient_responsibility: number;
  payer_claim_id?: string | null;
};

export type ActionPreview = {
  claim_id: string;
  adjustment_code: string;
  adjustment_amount: number;
  action_type: string;
  reason: string;
  recommended_action: string;
  priority_score: number;
};

export type ParseResponse = {
  upload_id: string;
  filename: string;
  parser_status: string;
  file_size_bytes: number;
  claim_count: number;
  line_count: number;
  adjustment_count: number;
  claims_preview: ClaimPreview[];
  actions_preview: ActionPreview[];
  work_queue: ActionPreview[];
  suppression_feed: ActionPreview[];
  message: string;
};
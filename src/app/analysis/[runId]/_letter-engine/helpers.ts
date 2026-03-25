import type { DraftTone, FlaggedClaim, LetterTemplateKey } from "./types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number) {
  return `${round2(value).toFixed(2)}%`;
}

export function round2(value: number) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function safeText(value: string | null | undefined, fallback = "Not provided") {
  const text = String(value ?? "").trim();
  return text.length ? text : fallback;
}

export function shortDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}

export function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function summarizeConfidence(claims: FlaggedClaim[]) {
  if (!claims.length) return "Unknown";

  const score = claims.reduce((sum, c) => {
    if (c.confidence === "high") return sum + 3;
    if (c.confidence === "medium") return sum + 2;
    return sum + 1;
  }, 0) / claims.length;

  if (score >= 2.5) return "High";
  if (score >= 1.75) return "Medium";
  return "Low";
}

export function selectTemplateKey(payer: string, mode: "claim" | "pattern"): LetterTemplateKey {
  const p = payer.toLowerCase();

  if (mode === "pattern") return "generic_pattern_escalation";
  if (p.includes("united") || p.includes("uhc")) return "uhc_underpayment_review";
  if (p.includes("aetna")) return "aetna_underpayment_review";
  if (p.includes("cigna")) return "cigna_underpayment_review";
  if (p.includes("blue")) return "bcbs_underpayment_review";

  return "generic_underpayment_review";
}

export function tonePhrase(tone: DraftTone) {
  if (tone === "firm") return "We request prompt review and correction.";
  if (tone === "formal") return "We respectfully request review.";
  return "Please review this claim.";
}

export function sanitizeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function escapeHtml(str: string) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

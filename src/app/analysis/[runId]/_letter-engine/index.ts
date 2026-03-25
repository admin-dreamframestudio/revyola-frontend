import { buildClaimInput, buildPatternInput } from "./composer";
import { renderText } from "./renderText";
import { renderHtml } from "./renderHtml";

export * from "./types";

export function generateClaimDraftLetter({ claim, runId }: any) {
  const input = buildClaimInput(claim, runId);
  const result = renderText(input);
  return { ...result, html: renderHtml(input) };
}

export function generatePatternDraftLetter({ pattern, claims, runId }: any) {
  const input = buildPatternInput(pattern, claims, runId);
  const result = renderText(input);
  return { ...result, html: renderHtml(input) };
}

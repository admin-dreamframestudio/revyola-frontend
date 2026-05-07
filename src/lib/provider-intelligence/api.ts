import type { ProviderDiagnosticResponse } from "./types";

const API_BASE_URL =
 // process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://automatic-fiesta-r4w9g6w4j9qq35w6x-8000.app.github.dev";
  

export async function fetchNpiDiagnostic(
  npi: string
): Promise<ProviderDiagnosticResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/provider-intelligence/npi/${npi}/diagnostic`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Unable to fetch NPI diagnostic.");
  }

  return response.json();
}
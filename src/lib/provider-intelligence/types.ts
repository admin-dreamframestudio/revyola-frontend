export type ProviderDiagnosticRow = {
  hcpcs_code: string;
  description: string;
  number_of_services: number;
  average_medicare_allowed_amount: number;
  total_commercial_exposure: number;
  annual_leakage: number;
};

export type ProviderDiagnosticResponse = {
  npi: string;
  provider_name: string;
  specialty?: string;
  location?: string;
  commercial_multiplier: number;
  leakage_rate: number;
  total_commercial_exposure: number;
  total_annual_leakage: number;
  rows: ProviderDiagnosticRow[];
  summary: string;
};
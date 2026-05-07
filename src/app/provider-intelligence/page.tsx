"use client";

import { useState } from "react";
import { fetchNpiDiagnostic } from "@/lib/provider-intelligence/api";
import type { ProviderDiagnosticResponse } from "@/lib/provider-intelligence/types";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  //process.env.NEXT_PUBLIC_API_BASE_URL || "https://automatic-fiesta-r4w9g6w4j9qq35w6x-8000.app.github.dev";
  

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function ProviderIntelligencePage() {
  const [npi, setNpi] = useState("");
  const [data, setData] = useState<ProviderDiagnosticResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runSearch() {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const result = await fetchNpiDiagnostic(npi.trim());
      setData(result);
    } catch (err: any) {
      setError(err?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#06101d] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-8 lg:px-10">
        <a href="/home" className="text-sm text-slate-400 hover:text-cyan-200">
          ← Back to platform
        </a>

        <section className="mt-10 rounded-[36px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
          <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-100">
            Provider Intelligence
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
            NPI Revenue Leakage Diagnostic
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            Search a provider NPI, fetch CMS public utilization data, and generate
            an executive benchmark report for commercial exposure and estimated
            annual leakage.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              value={npi}
              onChange={(e) => setNpi(e.target.value)}
              placeholder="Enter 10-digit NPI"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
            />

            <button
              onClick={runSearch}
              disabled={loading}
              className="rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-semibold text-[#06101d] transition hover:bg-cyan-200 disabled:opacity-60"
            >
              {loading ? "Searching..." : "Generate Diagnostic"}
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </section>

        {data && <DiagnosticReport data={data} />}
      </div>
    </main>
  );
}

function DiagnosticReport({ data }: { data: ProviderDiagnosticResponse }) {
  return (
    <section className="mt-8 overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
      <div className="border-b border-white/10 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200">
              Revyola Revenue Intelligence
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Executive Revenue Leakage Diagnostic
            </h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
            <div className="font-semibold text-white">{data.provider_name}</div>
            <div>NPI: {data.npi}</div>
            <div>Specialty: {data.specialty}</div>
            <div>Location: {data.location}</div>
          </div>
        </div>

        <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-400">
          This benchmark uses public CMS provider utilization data to estimate
          commercial revenue exposure. Revyola applies a commercial conversion
          factor and estimated variance rate to identify where a deeper
          closed-claims audit may uncover recoverable revenue.
        </p>
      </div>

      <div className="grid gap-4 p-8 md:grid-cols-3">
        <MetricCard
          label="Estimated Billable Baseline"
          value={formatMoney(data.total_commercial_exposure)}
        />
        <MetricCard
          label="Unrecovered Revenue"
          value={formatMoney(data.total_annual_leakage)}
          accent
        />
        <MetricCard
          label="Payer Error Rate"
          value={`${Math.round(data.leakage_rate * 100)}%`}
        />
      </div>

      <div className="px-8 pb-8">
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-white/[0.05] text-[11px] uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-5 py-4">HCPCS Code</th>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4 text-right">Total Commercial Exposure</th>
                <th className="px-5 py-4 text-right">Annual Leakage</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.hcpcs_code} className="border-t border-white/10">
                  <td className="px-5 py-4 font-medium text-cyan-100">
                    {row.hcpcs_code}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {row.description}
                  </td>
                  <td className="px-5 py-4 text-right text-slate-200">
                    {formatMoney(row.total_commercial_exposure)}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-red-200">
                    {formatMoney(row.annual_leakage)}
                  </td>
                </tr>
              ))}

              <tr className="border-t border-red-300/20 bg-red-400/10">
                <td className="px-5 py-4 font-semibold text-red-100">
                  AGGREGATE
                </td>
                <td className="px-5 py-4 font-semibold text-red-100">
                  TOTAL IDENTIFIED “FOUND MONEY”
                </td>
                <td className="px-5 py-4 text-right font-semibold text-red-100">
                  {formatMoney(data.total_commercial_exposure)}
                </td>
                <td className="px-5 py-4 text-right font-semibold text-red-100">
                  {formatMoney(data.total_annual_leakage)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6 text-center text-lg font-semibold text-cyan-50">
          {data.summary}
        </div>

        <p className="mt-6 text-xs leading-6 text-slate-500">
          Legal Disclaimer: This report is a public-data revenue benchmark and
          mathematical estimate. It does not represent verified commercial
          contract underpayment, legal advice, billing advice, or guaranteed
          recoverable revenue. A closed-claims audit is required to validate
          actual recoverability.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`${API_BASE_URL}/api/provider-intelligence/npi/${data.npi}/diagnostic/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white hover:bg-white/[0.09]"
          >
            Preview PDF
          </a>

          <a
            href={`${API_BASE_URL}/api/provider-intelligence/npi/${data.npi}/diagnostic/pdf?download=true`}
            className="inline-flex rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#06101d] hover:bg-cyan-200"
          >
            Download PDF
          </a>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
        {label}
      </div>
      <div
        className={[
          "mt-4 text-3xl font-semibold tracking-tight",
          accent ? "text-red-200" : "text-cyan-100",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
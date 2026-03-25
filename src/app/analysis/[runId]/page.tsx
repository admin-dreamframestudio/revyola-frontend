"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Download, FileText, Eye, X } from "lucide-react";
import {
  generateClaimDraftLetter,
  generatePatternDraftLetter,
  type FlaggedClaim,
  type Pattern,
} from "./_letter-engine";

type BundlingSignal = {
  pattern_type: string;
  description: string;
  payer: string;
  claim_ids: string[];
  recommendation: string;
};

type PayerDrift = {
  payer: string;
  cpt_code: string;
  start_month: string;
  end_month: string;
  pct_change: number;
  trend: string;
  description: string;
};

type AnalysisData = {
  run_id: string;
  summary: {
    total_claims: number;
    flagged_claims: number;
    potential_underpayment: number;
    top_payer: string;
    top_cpt: string;
  };
  patterns: Pattern[];
  flagged_claims: FlaggedClaim[];
  bundling_signals: BundlingSignal[];
  payer_drift: PayerDrift[];
};

type LetterPreviewState = {
  open: boolean;
  title: string;
  mode: "claim" | "pattern";
  html: string;
  text: string;
  fileBaseName: string;
  metadata: {
    payer: string;
    claimIds: string[];
    totalGapAmount: number;
    claimCount: number;
    confidenceSummary: string;
    templateKey: string;
  };
};

type TopTab = "overview" | "patterns" | "claims" | "integrity";
type SortKey =
  | "claim_id"
  | "payer"
  | "cpt_code"
  | "gap_amount"
  | "deviation_pct"
  | "confidence"
  | "pattern_id";
type SortDirection = "asc" | "desc";
type GroupMode = "none" | "payer" | "pattern";

export default function AnalysisPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const router = useRouter();

  const [runId, setRunId] = useState("");
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState<TopTab>("overview");
  const [selectedPattern, setSelectedPattern] = useState<string>("ALL");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [payerFilter, setPayerFilter] = useState("ALL");
  const [confidenceFilter, setConfidenceFilter] = useState("ALL");
  const [cptFilter, setCptFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("gap_amount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [groupMode, setGroupMode] = useState<GroupMode>("none");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [packetMessage, setPacketMessage] = useState("");
  const [letterPreview, setLetterPreview] = useState<LetterPreviewState | null>(null);

  useEffect(() => {
    async function loadData() {
      const resolved = await params;
      setRunId(resolved.runId);

      const stored = sessionStorage.getItem(`analysis-${resolved.runId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as AnalysisData;
        setData(parsed);
        if (parsed.flagged_claims.length > 0) {
          setSelectedClaimId(parsed.flagged_claims[0].claim_id);
        }
      }
      setIsLoaded(true);
    }

    loadData();
  }, [params]);

  useEffect(() => {
    if (!packetMessage) return;
    const timeout = setTimeout(() => setPacketMessage(""), 2600);
    return () => clearTimeout(timeout);
  }, [packetMessage]);

  const summary = data?.summary;

  const payerOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.flagged_claims.map((c) => c.payer))).sort();
  }, [data]);

  const confidenceOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.flagged_claims.map((c) => c.confidence))).sort(
      (a, b) => confidenceScore(b) - confidenceScore(a)
    );
  }, [data]);

  const cptOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.flagged_claims.map((c) => c.cpt_code))).sort();
  }, [data]);

  const rankedPatterns = useMemo(() => {
    if (!data) return [];
    return [...data.patterns].sort((a, b) => {
      if (b.impact !== a.impact) return b.impact - a.impact;
      if (b.affected_claims !== a.affected_claims) {
        return b.affected_claims - a.affected_claims;
      }
      return confidenceScore(b.confidence) - confidenceScore(a.confidence);
    });
  }, [data]);

  const filteredClaims = useMemo(() => {
    if (!data) return [];

    let claims = [...data.flagged_claims];

    if (selectedPattern !== "ALL") {
      claims = claims.filter((c) => c.pattern_id === selectedPattern);
    }

    if (payerFilter !== "ALL") {
      claims = claims.filter((c) => c.payer === payerFilter);
    }

    if (confidenceFilter !== "ALL") {
      claims = claims.filter((c) => c.confidence === confidenceFilter);
    }

    if (cptFilter !== "ALL") {
      claims = claims.filter((c) => c.cpt_code === cptFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      claims = claims.filter((c) =>
        [
          c.claim_id,
          c.payer,
          c.cpt_code,
          c.modifier,
          c.place_of_service,
          c.pattern_id,
          c.reason,
          c.rule_applied,
          c.rule_reason,
          c.icd_explainability,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    claims.sort((a, b) => compareClaims(a, b, sortKey, sortDirection));

    return claims;
  }, [
    data,
    selectedPattern,
    payerFilter,
    confidenceFilter,
    cptFilter,
    search,
    sortKey,
    sortDirection,
  ]);

  const selectedClaim = useMemo(() => {
    if (!filteredClaims.length) return null;
    return (
      filteredClaims.find((claim) => claim.claim_id === selectedClaimId) ??
      filteredClaims[0]
    );
  }, [filteredClaims, selectedClaimId]);

  useEffect(() => {
    if (filteredClaims.length > 0 && !filteredClaims.some((c) => c.claim_id === selectedClaimId)) {
      setSelectedClaimId(filteredClaims[0].claim_id);
    }
  }, [filteredClaims, selectedClaimId]);

  const payerExposure = useMemo(() => {
    if (!data) return [];
    const totals = new Map<string, { gap: number; claims: number }>();
    for (const claim of data.flagged_claims) {
      const prev = totals.get(claim.payer) || { gap: 0, claims: 0 };
      totals.set(claim.payer, {
        gap: prev.gap + claim.gap_amount,
        claims: prev.claims + 1,
      });
    }
    return Array.from(totals.entries())
      .map(([payer, value]) => ({
        payer,
        gap: round2(value.gap),
        claims: value.claims,
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 8);
  }, [data]);

  const patternImpactChartData = useMemo(() => {
    return rankedPatterns.slice(0, 8).map((p) => ({
      pattern: p.pattern_id,
      impact: round2(p.impact),
      claims: p.affected_claims,
    }));
  }, [rankedPatterns]);

  const driftChartData = useMemo(() => {
    if (!data) return [];
    return data.payer_drift.slice(0, 10).map((d) => ({
      label: `${shortLabel(d.payer, 10)}-${d.cpt_code}`,
      pct_change: d.pct_change,
    }));
  }, [data]);

  const groupedClaims = useMemo(() => {
    if (groupMode === "none") return [];

    const map = new Map<
      string,
      {
        title: string;
        claims: FlaggedClaim[];
        totalGap: number;
      }
    >();

    for (const claim of filteredClaims) {
      const key = groupMode === "payer" ? claim.payer : claim.pattern_id;
      const title = key;
      const existing = map.get(key) || { title, claims: [], totalGap: 0 };
      existing.claims.push(claim);
      existing.totalGap += claim.gap_amount;
      map.set(key, existing);
    }

    return Array.from(map.values()).sort((a, b) => b.totalGap - a.totalGap);
  }, [filteredClaims, groupMode]);

  const selectedPatternObj = useMemo(() => {
    if (selectedPattern === "ALL") return null;
    return rankedPatterns.find((p) => p.pattern_id === selectedPattern) || null;
  }, [rankedPatterns, selectedPattern]);

  const patternScopedClaims = useMemo(() => {
    if (!selectedPatternObj) return filteredClaims;
    return filteredClaims.filter((claim) => claim.pattern_id === selectedPatternObj.pattern_id);
  }, [filteredClaims, selectedPatternObj]);

  function handleGenerateClaimDraft(claim: FlaggedClaim) {
    const result = generateClaimDraftLetter({ claim, runId });

    setLetterPreview({
      open: true,
      title: result.title || `Claim Draft - ${claim.claim_id}`,
      mode: result.mode,
      html: result.html,
      text: result.text,
      fileBaseName: result.fileBaseName || `claim-draft-${claim.claim_id}`,
      metadata: {
        payer: result.metadata.payer,
        claimIds: result.metadata.claimIds,
        totalGapAmount: result.metadata.totalGapAmount,
        claimCount: result.metadata.claimCount,
        confidenceSummary: result.metadata.confidenceSummary,
        templateKey: String(result.metadata.templateKey),
      },
    });

    setPacketMessage(`Preview ready for ${claim.claim_id}`);
  }

  function handleGeneratePatternDraft(pattern: Pattern | null, claims: FlaggedClaim[]) {
    const scopedClaims = pattern
      ? claims.filter((claim) => claim.pattern_id === pattern.pattern_id)
      : claims;

    if (!scopedClaims.length) {
      setPacketMessage("No claims available for draft generation");
      return;
    }

    const result = generatePatternDraftLetter({
      pattern,
      claims: scopedClaims,
      runId,
    });

    setLetterPreview({
      open: true,
      title: result.title || `Pattern Draft - ${pattern?.pattern_id || "Filtered View"}`,
      mode: result.mode,
      html: result.html,
      text: result.text,
      fileBaseName:
        result.fileBaseName || `pattern-draft-${pattern?.pattern_id || "filtered-view"}`,
      metadata: {
        payer: result.metadata.payer,
        claimIds: result.metadata.claimIds,
        totalGapAmount: result.metadata.totalGapAmount,
        claimCount: result.metadata.claimCount,
        confidenceSummary: result.metadata.confidenceSummary,
        templateKey: String(result.metadata.templateKey),
      },
    });

    setPacketMessage(
      pattern
        ? `Preview ready for ${pattern.pattern_id}`
        : "Preview ready for current filtered view"
    );
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#06101d] text-white">
        <div className="mx-auto max-w-[1600px] px-6 py-8">
          <LoadingSkeleton />
        </div>
      </main>
    );
  }

  if (!data || !summary) {
    return (
      <main className="min-h-screen bg-[#06101d] text-white">
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-10 text-center">
            <div className="text-sm uppercase tracking-[0.18em] text-slate-500">
              Analysis unavailable
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              No analysis data found for this run
            </h1>
            <p className="mt-3 text-slate-400">
              Try uploading data again from the upload screen.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <NavButton onClick={() => router.push("/upload")}>
                Back to Upload
              </NavButton>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06101d] text-white">
      <StickyActionBar
        onUpload={() => router.push("/upload")}
        onExportCsv={() => exportClaimsCsv(filteredClaims, `revyola-claims-${runId}.csv`)}
        onExportJson={() => exportJson(data, `revyola-analysis-${runId}.json`)}
        onGeneratePacket={() => handleGeneratePatternDraft(selectedPatternObj, filteredClaims)}
        selectedPattern={selectedPattern}
        resultCount={filteredClaims.length}
      />

      <div className="mx-auto max-w-[1600px] px-6 pb-24 pt-8">
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
          <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-100">
                  Revyola reimbursement intelligence
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                Enterprise recovery intelligence command center
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                Surface systemic underpayment patterns, rank recovery opportunity,
                and move from signal to claim-level action with executive-grade clarity.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                <MetaPill label="Run ID" value={runId} />
                <MetaPill label="Top payer" value={summary.top_payer || "—"} />
                <MetaPill label="Top CPT" value={summary.top_cpt || "—"} />
                <MetaPill
                  label="Flag rate"
                  value={pct(summary.flagged_claims, summary.total_claims)}
                />
              </div>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2 xl:w-[560px]">
              <HeroStat
                label="Potential recovery"
                value={formatCurrency(summary.potential_underpayment)}
                sublabel="Modeled underpayment exposure"
              />
              <HeroStat
                label="Flagged claims"
                value={formatNumber(summary.flagged_claims)}
                sublabel={`${pct(summary.flagged_claims, summary.total_claims)} of analyzed claims`}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Claims analyzed"
            value={formatNumber(summary.total_claims)}
            hint="Closed claims included in this run"
          />
          <MetricCard
            label="Flagged claims"
            value={formatNumber(summary.flagged_claims)}
            hint="Claims with reimbursement variance signal"
          />
          <MetricCard
            label="Potential underpayment"
            value={formatCurrency(summary.potential_underpayment)}
            hint="Aggregate modeled revenue opportunity"
            emphasis="positive"
          />
          <MetricCard
            label="Dominant payer signal"
            value={summary.top_payer || "—"}
            hint={`Highest concentration of variance · CPT ${summary.top_cpt || "—"}`}
          />
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              <TopTabButton
                active={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
                label="Overview"
              />
              <TopTabButton
                active={activeTab === "patterns"}
                onClick={() => setActiveTab("patterns")}
                label="Pattern pipeline"
              />
              <TopTabButton
                active={activeTab === "claims"}
                onClick={() => setActiveTab("claims")}
                label="Claims workspace"
              />
              <TopTabButton
                active={activeTab === "integrity"}
                onClick={() => setActiveTab("integrity")}
                label="Integrity signals"
              />
            </div>

            <div className="flex flex-col gap-3 xl:flex-row">
              <SearchInput value={search} onChange={setSearch} />
              <FilterSelect
                value={payerFilter}
                onChange={setPayerFilter}
                label="Payer"
                options={payerOptions}
              />
              <FilterSelect
                value={confidenceFilter}
                onChange={setConfidenceFilter}
                label="Confidence"
                options={confidenceOptions}
              />
              <FilterSelect
                value={cptFilter}
                onChange={setCptFilter}
                label="CPT"
                options={cptOptions}
              />
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.section
              key="overview"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="mt-8 space-y-6"
            >
              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <Panel
                  eyebrow="Executive summary"
                  title="Payer exposure profile"
                  description="Top payers by modeled gap with true bar chart representation."
                >
                  <ChartShell title="Exposure by payer">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={payerExposure}>
                        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                        <XAxis
                          dataKey="payer"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => shortCurrency(value)}
                        />
                        <Tooltip content={<EnterpriseTooltip />} />
                        <Bar dataKey="gap" radius={[8, 8, 0, 0]} fill="#38bdf8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartShell>

                  <div className="mt-5 space-y-3">
                    {payerExposure.map((item) => (
                      <ExposureRow
                        key={item.payer}
                        title={item.payer}
                        subtitle={`${formatNumber(item.claims)} flagged claims`}
                        value={formatCurrency(item.gap)}
                        widthPct={(item.gap / (payerExposure[0]?.gap || 1)) * 100}
                      />
                    ))}
                  </div>
                </Panel>

                <Panel
                  eyebrow="Priority map"
                  title="Pattern opportunity curve"
                  description="Ranked patterns shown as true impact chart plus direct drill-in."
                >
                  <ChartShell title="Pattern impact ranking">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={patternImpactChartData}>
                        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                        <XAxis
                          dataKey="pattern"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => shortCurrency(value)}
                        />
                        <Tooltip content={<EnterpriseTooltip />} />
                        <Bar dataKey="impact" radius={[8, 8, 0, 0]} fill="#818cf8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartShell>

                  <div className="mt-5 space-y-4">
                    {rankedPatterns.slice(0, 5).map((pattern, index) => (
                      <motion.div
                        key={pattern.pattern_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                              Rank {index + 1}
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-white">
                              {pattern.description}
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                              {pattern.payer} · CPT {pattern.cpt_code} · POS{" "}
                              {pattern.place_of_service || "—"}
                            </p>
                          </div>
                          <ConfidenceBadge value={claimConfidenceLabel(pattern.confidence)} />
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                          <SignalTile label="Impact" value={formatCurrency(pattern.impact)} tone="positive" />
                          <SignalTile label="Claims" value={formatNumber(pattern.affected_claims)} />
                          <button
                            onClick={() => {
                              setSelectedPattern(pattern.pattern_id);
                              setActiveTab("patterns");
                            }}
                            className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-4 text-left text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                          >
                            Open pattern
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <Panel
                  eyebrow="Trend surveillance"
                  title="Payer drift line monitor"
                  description="True line chart for directional reimbursement movement."
                >
                  <ChartShell title="Drift by payer/CPT">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={driftChartData}>
                        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<EnterpriseTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="pct_change"
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#22c55e" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartShell>
                </Panel>

                <Panel
                  eyebrow="Integrity signal"
                  title="Bundling and recovery cues"
                  description="Investigation-ready bundled-procedure signals."
                >
                  <div className="space-y-4">
                    {data.bundling_signals.length === 0 ? (
                      <EmptyState text="No bundled or add-on patterns detected." />
                    ) : (
                      data.bundling_signals.slice(0, 5).map((signal, index) => (
                        <motion.div
                          key={`${signal.pattern_type}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                                {signal.pattern_type}
                              </div>
                              <h3 className="mt-2 text-lg font-semibold text-white">
                                {signal.description}
                              </h3>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                              {signal.payer}
                            </span>
                          </div>

                          <p className="mt-4 text-sm leading-6 text-slate-300">
                            {signal.recommendation}
                          </p>

                          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1728] p-3 text-xs text-slate-400">
                            Claims involved: {signal.claim_ids.join(", ")}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </Panel>
              </div>
            </motion.section>
          )}

          {activeTab === "patterns" && (
            <motion.section
              key="patterns"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"
            >
              <Panel
                eyebrow="Ranked pipeline"
                title="Pattern pipeline"
                description="A prioritized queue of systemic recovery opportunity."
              >
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedPattern("ALL")}
                    className={`w-full rounded-[22px] border p-4 text-left transition ${
                      selectedPattern === "ALL"
                        ? "border-cyan-300/30 bg-cyan-300/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">All flagged claims</div>
                        <div className="mt-1 text-xs text-slate-400">
                          Remove pattern scoping and view all opportunities
                        </div>
                      </div>
                      <div className="text-sm text-slate-300">
                        {formatNumber(data.flagged_claims.length)} claims
                      </div>
                    </div>
                  </button>

                  {rankedPatterns.map((pattern, index) => {
                    const active = selectedPattern === pattern.pattern_id;

                    return (
                      <motion.button
                        key={pattern.pattern_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.025 }}
                        onClick={() => setSelectedPattern(pattern.pattern_id)}
                        className={`w-full rounded-[24px] border p-5 text-left transition ${
                          active
                            ? "border-cyan-300/30 bg-cyan-300/[0.08] shadow-lg shadow-cyan-950/20"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                              Rank {index + 1} · {pattern.pattern_id}
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-white">
                              {pattern.description}
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                              {pattern.payer} · CPT {pattern.cpt_code} · Modifier{" "}
                              {pattern.modifier || "—"} · POS{" "}
                              {pattern.place_of_service || "—"}
                            </p>
                          </div>
                          <ConfidenceBadge value={claimConfidenceLabel(pattern.confidence)} />
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                          <SignalTile label="Impact" value={formatCurrency(pattern.impact)} tone="positive" />
                          <SignalTile label="Claims" value={formatNumber(pattern.affected_claims)} />
                          <SignalTile
                            label="Avg dev."
                            value={`${pattern.avg_deviation_pct}%`}
                            tone={pattern.avg_deviation_pct < 0 ? "negative" : "neutral"}
                          />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </Panel>

              <Panel
                eyebrow="Pattern detail"
                title={selectedPatternObj ? selectedPatternObj.description : "Pattern overview"}
                description={
                  selectedPatternObj
                    ? "Focused pattern detail with draft preview and claim sampling."
                    : "Select a pattern to inspect its operational footprint."
                }
              >
                {!selectedPatternObj ? (
                  <div className="space-y-4">
                    <EmptyState text="Choose a ranked pattern from the left to inspect a focused opportunity set." />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <MetricMini label="Patterns detected" value={formatNumber(data.patterns.length)} />
                      <MetricMini label="Flagged claims" value={formatNumber(data.flagged_claims.length)} />
                      <MetricMini label="Potential underpayment" value={formatCurrency(summary.potential_underpayment)} />
                      <MetricMini label="Top payer" value={summary.top_payer || "—"} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-[24px] border border-white/10 bg-[#0b1728] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                            {selectedPatternObj.pattern_id}
                          </div>
                          <h3 className="mt-2 text-xl font-semibold text-white">
                            {selectedPatternObj.description}
                          </h3>
                          <p className="mt-2 text-sm text-slate-400">
                            {selectedPatternObj.payer} · CPT {selectedPatternObj.cpt_code} · POS{" "}
                            {selectedPatternObj.place_of_service || "—"}
                          </p>
                        </div>
                        <ConfidenceBadge value={claimConfidenceLabel(selectedPatternObj.confidence)} />
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <SignalTile label="Impact" value={formatCurrency(selectedPatternObj.impact)} tone="positive" />
                        <SignalTile label="Affected claims" value={formatNumber(selectedPatternObj.affected_claims)} />
                        <SignalTile
                          label="Avg deviation"
                          value={`${selectedPatternObj.avg_deviation_pct}%`}
                          tone={selectedPatternObj.avg_deviation_pct < 0 ? "negative" : "neutral"}
                        />
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleGeneratePatternDraft(selectedPatternObj, filteredClaims)}
                          className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                        >
                          Preview pattern draft letter
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("claims");
                            setGroupMode("pattern");
                          }}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.06]"
                        >
                          Open grouped drilldown
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <h4 className="text-sm font-semibold text-white">
                          Example claims in this pattern
                        </h4>
                        <button
                          onClick={() => setActiveTab("claims")}
                          className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-medium text-cyan-100"
                        >
                          Open claims workspace
                        </button>
                      </div>

                      <div className="space-y-3">
                        {patternScopedClaims.slice(0, 8).map((claim) => (
                          <div
                            key={claim.claim_id}
                            className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <button
                                onClick={() => {
                                  setSelectedClaimId(claim.claim_id);
                                  setActiveTab("claims");
                                  setInspectorOpen(true);
                                }}
                                className="flex-1 text-left transition hover:opacity-90"
                              >
                                <div className="text-sm font-medium text-white">
                                  {claim.claim_id} · {claim.payer}
                                </div>
                                <div className="mt-1 text-xs text-slate-400">
                                  CPT {claim.cpt_code} · Paid {formatCurrency(claim.allowed_amount)} · Expected{" "}
                                  {formatCurrency(claim.expected_amount)}
                                </div>
                              </button>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-emerald-300">
                                    {formatCurrency(claim.gap_amount)}
                                  </div>
                                  <div className="mt-1 text-xs text-slate-400">
                                    {claim.deviation_pct}%
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleGenerateClaimDraft(claim)}
                                  className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                                >
                                  Preview draft
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {patternScopedClaims.length === 0 && (
                          <EmptyState text="No claims available for this pattern under current filters." />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Panel>
            </motion.section>
          )}

          {activeTab === "claims" && (
            <motion.section
              key="claims"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]"
            >
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10 backdrop-blur">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Operational workspace
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Flagged claims
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Search, sort, filter, group, and inspect claim-level recovery evidence.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <SoftPill label="Pattern" value={selectedPattern === "ALL" ? "All" : selectedPattern} />
                    <SoftPill label="Results" value={formatNumber(filteredClaims.length)} />
                    <SoftPill label="Sort" value={`${sortLabel(sortKey)} · ${sortDirection}`} />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <GroupModeButton active={groupMode === "none"} onClick={() => setGroupMode("none")}>
                    Flat table
                  </GroupModeButton>
                  <GroupModeButton active={groupMode === "payer"} onClick={() => setGroupMode("payer")}>
                    Group by payer
                  </GroupModeButton>
                  <GroupModeButton active={groupMode === "pattern"} onClick={() => setGroupMode("pattern")}>
                    Group by pattern
                  </GroupModeButton>
                </div>

                {groupMode === "none" ? (
                  <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10">
                    <div className="w-full overflow-hidden">
                      <table className="w-full table-fixed text-left text-sm">
                        <thead className="bg-white/[0.04] text-slate-400">
                          <tr className="border-b border-white/10">
                            <SortableTh
                              label="Claim"
                              active={sortKey === "claim_id"}
                              direction={sortDirection}
                              onClick={() => updateSort("claim_id", sortKey, sortDirection, setSortKey, setSortDirection)}
                            />
                            <SortableTh
                              label="Pattern"
                              active={sortKey === "pattern_id"}
                              direction={sortDirection}
                              onClick={() => updateSort("pattern_id", sortKey, sortDirection, setSortKey, setSortDirection)}
                            />
                            <SortableTh
                              label="Payer"
                              active={sortKey === "payer"}
                              direction={sortDirection}
                              onClick={() => updateSort("payer", sortKey, sortDirection, setSortKey, setSortDirection)}
                            />
                            <SortableTh
                              label="CPT"
                              active={sortKey === "cpt_code"}
                              direction={sortDirection}
                              onClick={() => updateSort("cpt_code", sortKey, sortDirection, setSortKey, setSortDirection)}
                            />
                            <th className="px-4 py-4 font-medium">POS</th>
                            <th className="px-4 py-4 font-medium w-[90px]">Paid</th>
                            <th className="px-4 py-4 font-medium w-[90px]">Expected</th>
                            <SortableTh
                              label="Gap"
                              className="w-[80px]"
                              active={sortKey === "gap_amount"}
                              direction={sortDirection}
                              onClick={() => updateSort("gap_amount", sortKey, sortDirection, setSortKey, setSortDirection)}
                            />
                            <SortableTh
                              label="Deviation"
                              className="w-[90px]"
                              active={sortKey === "deviation_pct"}
                              direction={sortDirection}
                              onClick={() => updateSort("deviation_pct", sortKey, sortDirection, setSortKey, setSortDirection)}
                            />
                            <SortableTh
                              label="Confidence"
                              active={sortKey === "confidence"}
                              direction={sortDirection}
                              onClick={() => updateSort("confidence", sortKey, sortDirection, setSortKey, setSortDirection)}
                            />
                            <th className="px-4 py-4 font-medium">Rule</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredClaims.map((claim) => {
                            const active = selectedClaim?.claim_id === claim.claim_id;
                            return (
                              <tr
                                key={`${claim.claim_id}-${claim.pattern_id}`}
                                className={`border-b border-white/5 transition hover:bg-white/[0.03] ${
                                  active ? "bg-cyan-300/[0.04]" : ""
                                }`}
                              >
                                <td className="px-4 py-4 align-top">
                                  <div className="max-w-[160px] truncate">
                                    <button
                                      onClick={() => {
                                        setSelectedClaimId(claim.claim_id);
                                        setInspectorOpen(true);
                                      }}
                                      className="text-left"
                                    >
                                      <div className="font-medium text-white">{claim.claim_id}</div>
                                      <div className="mt-1 text-xs text-slate-400">
                                        {claim.modifier ? `Mod ${claim.modifier}` : "No modifier"}
                                      </div>
                                    </button>

                                    <button
                                      onClick={() => handleGenerateClaimDraft(claim)}
                                      className="mt-2 inline-flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1.5 text-[11px] font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      Preview draft
                                    </button>
                                  </div>
                                </td>
                                <td className="px-4 py-4 align-top text-slate-300">
                                  {claim.pattern_id}
                                </td>
                                <td className="px-4 py-4 align-top text-slate-300">
                                  {claim.payer}
                                </td>
                                <td className="px-4 py-4 align-top text-slate-300">
                                  {claim.cpt_code}
                                </td>
                                <td className="px-4 py-4 align-top text-slate-300">
                                  {claim.place_of_service || "—"}
                                </td>
                                <td className="px-4 py-4 align-top text-slate-300">
                                  {formatCurrency(claim.allowed_amount)}
                                </td>
                                <td className="px-4 py-4 align-top text-slate-300">
                                  {formatCurrency(claim.expected_amount)}
                                </td>
                                <td className="px-4 py-4 align-top font-semibold text-emerald-300">
                                  {formatCurrency(claim.gap_amount)}
                                </td>
                                <td
                                  className={`px-4 py-4 align-top font-medium ${
                                    claim.deviation_pct < 0 ? "text-rose-300" : "text-emerald-300"
                                  }`}
                                >
                                  {claim.deviation_pct}%
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <ConfidenceBadge value={claimConfidenceLabel(claim.confidence)} />
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <div className="max-w-[220px] truncate">
                                    <div className="font-medium text-slate-200">
                                      {claim.rule_applied || "—"}
                                    </div>
                                    <div className="mt-1 truncate text-xs leading-5 text-slate-400">
                                      {claim.rule_reason || "—"}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {filteredClaims.length === 0 && (
                            <tr>
                              <td colSpan={11} className="px-4 py-10">
                                <EmptyState text="No claims match the current filters." />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {groupedClaims.length === 0 ? (
                      <EmptyState text="No grouped claims available." />
                    ) : (
                      groupedClaims.map((group) => {
                        const open = expandedGroups[group.title] ?? true;
                        return (
                          <div
                            key={group.title}
                            className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]"
                          >
                            <button
                              onClick={() =>
                                setExpandedGroups((prev) => ({
                                  ...prev,
                                  [group.title]: !open,
                                }))
                              }
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                            >
                              <div>
                                <div className="text-sm font-semibold text-white">{group.title}</div>
                                <div className="mt-1 text-xs text-slate-400">
                                  {formatNumber(group.claims.length)} claims · {formatCurrency(group.totalGap)}
                                </div>
                              </div>
                              <div className="text-sm text-slate-400">{open ? "Hide" : "Show"}</div>
                            </button>

                            <AnimatePresence initial={false}>
                              {open && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="border-t border-white/10"
                                >
                                  <div className="space-y-3 p-4">
                                    {group.claims.slice(0, 12).map((claim) => (
                                      <div
                                        key={`${group.title}-${claim.claim_id}`}
                                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
                                      >
                                        <button
                                          onClick={() => {
                                            setSelectedClaimId(claim.claim_id);
                                            setInspectorOpen(true);
                                          }}
                                          className="flex-1 text-left transition hover:opacity-90"
                                        >
                                          <div className="text-sm font-medium text-white">
                                            {claim.claim_id} · CPT {claim.cpt_code}
                                          </div>
                                          <div className="mt-1 text-xs text-slate-400">
                                            Paid {formatCurrency(claim.allowed_amount)} · Expected{" "}
                                            {formatCurrency(claim.expected_amount)} · {claim.confidence}
                                          </div>
                                        </button>

                                        <div className="ml-4 flex items-center gap-3">
                                          <div className="text-right">
                                            <div className="text-sm font-semibold text-emerald-300">
                                              {formatCurrency(claim.gap_amount)}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-400">
                                              {claim.deviation_pct}%
                                            </div>
                                          </div>

                                          <button
                                            onClick={() => handleGenerateClaimDraft(claim)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                                          >
                                            <Eye className="h-3.5 w-3.5" />
                                            Preview draft
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Quick queue
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Claim queue
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Select a claim to inspect in the slide-over panel.
                </p>

                <div className="mt-5 max-h-[780px] space-y-3 overflow-y-auto pr-1">
                  {filteredClaims.slice(0, 30).map((claim) => {
                    const active = selectedClaim?.claim_id === claim.claim_id;
                    return (
                      <div
                        key={`${claim.claim_id}-${claim.pattern_id}-queue`}
                        className={`w-full rounded-[22px] border px-4 py-4 transition ${
                          active
                            ? "border-cyan-300/30 bg-cyan-300/[0.08]"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <button
                            onClick={() => {
                              setSelectedClaimId(claim.claim_id);
                              setInspectorOpen(true);
                            }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="truncate text-sm font-medium text-white">
                              {claim.claim_id}
                            </div>
                            <div className="mt-1 truncate text-xs text-slate-400">
                              {claim.payer} · CPT {claim.cpt_code} · {claim.pattern_id}
                            </div>
                          </button>
                          <ConfidenceBadge value={claimConfidenceLabel(claim.confidence)} />
                        </div>

                        <div className="mt-3 flex items-end justify-between gap-4">
                          <div className="text-sm text-slate-400">
                            Paid {formatCurrency(claim.allowed_amount)}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-emerald-300">
                                {formatCurrency(claim.gap_amount)}
                              </div>
                              <div className="mt-1 text-xs text-slate-400">
                                {claim.deviation_pct}%
                              </div>
                            </div>

                            <button
                              onClick={() => handleGenerateClaimDraft(claim)}
                              className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredClaims.length === 0 && <EmptyState text="No claims available in queue." />}
                </div>
              </div>
            </motion.section>
          )}

          {activeTab === "integrity" && (
            <motion.section
              key="integrity"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="mt-8 grid gap-6 xl:grid-cols-2"
            >
              <Panel
                eyebrow="Integrity review"
                title="Bundling signals"
                description="Signals that may require bundled-code review or payer follow-up."
              >
                <div className="space-y-4">
                  {data.bundling_signals.length === 0 ? (
                    <EmptyState text="No bundled or add-on procedure patterns detected." />
                  ) : (
                    data.bundling_signals.map((signal, index) => (
                      <motion.div
                        key={`${signal.pattern_type}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                              {signal.pattern_type}
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-white">
                              {signal.description}
                            </h3>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                            {signal.payer}
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-300">
                          {signal.recommendation}
                        </p>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1728] p-3 text-xs text-slate-400">
                          Claims involved: {signal.claim_ids.join(", ")}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </Panel>

              <Panel
                eyebrow="Trend surveillance"
                title="Payer drift"
                description="Directional reimbursement movement over time."
              >
                <div className="space-y-4">
                  {data.payer_drift.length === 0 ? (
                    <EmptyState text="No significant payer drift detected." />
                  ) : (
                    data.payer_drift.map((drift, index) => (
                      <motion.div
                        key={`${drift.payer}-${drift.cpt_code}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {drift.payer} · CPT {drift.cpt_code}
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                              {drift.start_month} → {drift.end_month}
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${
                              drift.pct_change < 0
                                ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                                : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                            }`}
                          >
                            {drift.pct_change}%
                          </span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-300">
                          {drift.description}
                        </p>

                        <div className="mt-4">
                          <TrendBar value={drift.pct_change} />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </Panel>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {packetMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-[60] rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 shadow-xl shadow-black/30"
          >
            {packetMessage}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SlideOver
        open={inspectorOpen && !!selectedClaim}
        onClose={() => setInspectorOpen(false)}
      >
        {selectedClaim ? (
          <ClaimInspector
            claim={selectedClaim}
            onClose={() => setInspectorOpen(false)}
            onGenerateDraft={() => handleGenerateClaimDraft(selectedClaim)}
          />
        ) : null}
      </SlideOver>

      <LetterPreviewModal
        preview={letterPreview}
        onClose={() => setLetterPreview(null)}
        onDownloadHtml={() => {
          if (!letterPreview) return;
          downloadHtmlFile(letterPreview.html, `${letterPreview.fileBaseName}.html`);
        }}
        onDownloadText={() => {
          if (!letterPreview) return;
          downloadTextFile(
            letterPreview.text,
            `${letterPreview.fileBaseName}.txt`,
            "text/plain;charset=utf-8;"
          );
        }}
      />
    </main>
  );
}

function StickyActionBar({
  onUpload,
  onExportCsv,
  onExportJson,
  onGeneratePacket,
  selectedPattern,
  resultCount,
}: {
  onUpload: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onGeneratePacket: () => void;
  selectedPattern: string;
  resultCount: number;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-[#06101d]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onUpload}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.08]"
          >
            Back to Upload
          </button>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300">
            Current scope:{" "}
            <span className="text-white">
              {selectedPattern === "ALL" ? "All patterns" : selectedPattern}
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-300">
            Results: <span className="text-white">{formatNumber(resultCount)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onExportCsv}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.08]"
          >
            Export CSV
          </button>
          <button
            onClick={onExportJson}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.08]"
          >
            Export JSON
          </button>
          <button
            onClick={onGeneratePacket}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
          >
            <Eye className="h-4 w-4" />
            Preview draft letters
          </button>
        </div>
      </div>
    </div>
  );
}

function ClaimInspector({
  claim,
  onClose,
  onGenerateDraft,
}: {
  claim: FlaggedClaim;
  onClose: () => void;
  onGenerateDraft: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Claim inspector
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {claim.claim_id}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {claim.payer} · CPT {claim.cpt_code}
              {claim.modifier ? `-${claim.modifier}` : ""} · Pattern {claim.pattern_id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onGenerateDraft}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
            >
              <Eye className="h-4 w-4" />
              Preview draft
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08]"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <SignalTile label="Paid" value={formatCurrency(claim.allowed_amount)} />
          <SignalTile label="Expected" value={formatCurrency(claim.expected_amount)} />
          <SignalTile label="Gap" value={formatCurrency(claim.gap_amount)} tone="positive" />
          <SignalTile
            label="Deviation"
            value={`${claim.deviation_pct}%`}
            tone={claim.deviation_pct < 0 ? "negative" : "neutral"}
          />
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[#0b1728] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="text-sm font-semibold text-white">Severity</div>
            <ConfidenceBadge value={claimConfidenceLabel(claim.confidence)} />
          </div>
          <div className="rounded-full bg-white/10">
            <div
              className={`h-3 rounded-full ${
                claim.deviation_pct < 0
                  ? "bg-gradient-to-r from-rose-500 to-orange-400"
                  : "bg-gradient-to-r from-emerald-500 to-cyan-400"
              }`}
              style={{ width: `${Math.min(Math.abs(claim.deviation_pct), 100)}%` }}
            />
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Absolute deviation scaled to current view.
          </div>
        </div>

        <DetailCard title="Recovery rationale" body={claim.reason || "—"} />
        <DetailCard
          title="Rule applied"
          body={claim.rule_applied || "—"}
          secondary={claim.rule_reason || "—"}
        />
        <DetailCard
          title="ICD explainability"
          body={claim.icd_explainability || "—"}
          secondary={
            claim.icd_confidence_adjustment
              ? `Confidence adjustment: ${claim.icd_confidence_adjustment}`
              : undefined
          }
        />

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Metadata
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MetaBlock label="Payer" value={claim.payer} />
            <MetaBlock label="CPT" value={claim.cpt_code} />
            <MetaBlock label="Modifier" value={claim.modifier || "—"} />
            <MetaBlock label="Place of service" value={claim.place_of_service || "—"} />
            <MetaBlock label="Pattern" value={claim.pattern_id} />
            <MetaBlock label="Confidence" value={claim.confidence} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideOver({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative ml-auto h-full w-full max-w-2xl border-l border-white/10 bg-[#081220] shadow-2xl shadow-black/40"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function LetterPreviewModal({
  preview,
  onClose,
  onDownloadHtml,
  onDownloadText,
}: {
  preview: LetterPreviewState | null;
  onClose: () => void;
  onDownloadHtml: () => void;
  onDownloadText: () => void;
}) {
  return (
    <AnimatePresence>
      {preview?.open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-6">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: 0.2 }}
            className="relative z-[81] flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#07111f] shadow-2xl shadow-black/50"
          >
            <div className="border-b border-white/10 bg-white/[0.03] px-6 py-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-100">
                      Letter preview
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                      {preview.mode === "claim" ? "Claim-level" : "Pattern-level"}
                    </span>
                  </div>

                  <h2 className="mt-3 truncate text-2xl font-semibold text-white">
                    {preview.title}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
                    <PreviewMetaPill label="Payer" value={preview.metadata.payer} />
                    <PreviewMetaPill label="Claims" value={String(preview.metadata.claimCount)} />
                    <PreviewMetaPill
                      label="Variance"
                      value={formatCurrency(preview.metadata.totalGapAmount)}
                    />
                    <PreviewMetaPill
                      label="Confidence"
                      value={preview.metadata.confidenceSummary}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={onDownloadHtml}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
                  >
                    <Download className="h-4 w-4" />
                    Download HTML
                  </button>

                  <button
                    onClick={onDownloadText}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    <FileText className="h-4 w-4" />
                    Download TXT
                  </button>

                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[320px_1fr]">
              <div className="border-b border-white/10 bg-[#0a1526] p-5 xl:border-b-0 xl:border-r">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Eye className="h-4 w-4" />
                  Draft intelligence
                </div>

                <div className="mt-5 space-y-4">
                  <PreviewInfoCard label="Template" value={preview.metadata.templateKey} />
                  <PreviewInfoCard
                    label="Claims included"
                    value={preview.metadata.claimIds.join(", ")}
                  />
                  <PreviewInfoCard label="Letter mode" value={preview.mode} />
                  <PreviewInfoCard label="File base" value={preview.fileBaseName} />
                </div>

                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Recommendation
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Review the draft first in this window, then download the final
                    version once billing is comfortable with the structure, evidence,
                    and request language.
                  </p>
                </div>
              </div>

              <div className="min-h-0 bg-[linear-gradient(180deg,#0b1728_0%,#0f1d31_100%)] p-4 md:p-6">
                <div className="mx-auto h-full max-w-4xl rounded-[28px] border border-white/10 bg-[#dfe7f1] p-3 shadow-2xl shadow-black/30">
                  <div className="h-full overflow-hidden rounded-[22px] bg-white shadow-inner">
                    <iframe
                      title="Letter preview"
                      srcDoc={preview.html}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function PreviewMetaPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-300">
      <span className="text-slate-500">{label}:</span> {value}
    </div>
  );
}

function PreviewInfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 break-words text-sm leading-6 text-white">
        {value || "—"}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-white/10 bg-white/[0.04] p-8">
        <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-12 w-[40%] animate-pulse rounded bg-white/10" />
        <div className="mt-4 h-6 w-[60%] animate-pulse rounded bg-white/10" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:w-[560px]">
          <div className="h-28 animate-pulse rounded-[24px] bg-white/10" />
          <div className="h-28 animate-pulse rounded-[24px] bg-white/10" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-[26px] bg-white/10" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-[420px] animate-pulse rounded-[28px] bg-white/10" />
        <div className="h-[420px] animate-pulse rounded-[28px] bg-white/10" />
      </div>
    </div>
  );
}

function ChartShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#0b1728] p-4">
      <div className="mb-3 text-sm font-semibold text-white">{title}</div>
      {children}
    </div>
  );
}

function EnterpriseTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#081220] px-4 py-3 text-sm text-slate-200 shadow-xl shadow-black/30">
      <div className="font-medium text-white">{label}</div>
      <div className="mt-2 space-y-1">
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="text-slate-400">{item.name}</span>
            <span className="font-medium text-white">
              {typeof item.value === "number" ? formatNumber(item.value) : String(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10 backdrop-blur">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  emphasis = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  emphasis?: "neutral" | "positive";
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.045] p-6 shadow-lg shadow-black/10 backdrop-blur">
      <div className="text-sm text-slate-400">{label}</div>
      <div
        className={`mt-3 text-3xl font-semibold tracking-tight ${
          emphasis === "positive" ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="mt-3 text-sm leading-6 text-slate-400">{hint}</div>
    </div>
  );
}

function HeroStat({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 backdrop-blur">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-400">{sublabel}</div>
    </div>
  );
}

function SignalTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const valueClass =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "negative"
      ? "text-rose-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>
      <div className={`mt-2 text-lg font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

function MetricMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-300">
      <span className="text-slate-400">{label}:</span> {value}
    </div>
  );
}

function SoftPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
      <span className="text-slate-500">{label}:</span> {value}
    </div>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function DetailCard({
  title,
  body,
  secondary,
}: {
  title: string;
  body: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </div>
      <div className="mt-3 text-sm leading-7 text-slate-200">{body}</div>
      {secondary ? (
        <div className="mt-3 text-sm leading-6 text-slate-400">{secondary}</div>
      ) : null}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
      {text}
    </div>
  );
}

function ConfidenceBadge({ value }: { value: string }) {
  const normalized = claimConfidenceLabel(value);
  const styles =
    normalized === "High"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : normalized === "Medium"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
      : "border-white/10 bg-white/[0.05] text-slate-300";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles}`}>
      {normalized}
    </span>
  );
}

function TopTabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
      }`}
    >
      {label}
    </button>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="min-w-[260px] rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        Search
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Claim ID, payer, CPT, rule, reason..."
        className="mt-1 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: string[];
}) {
  return (
    <label className="min-w-[140px] rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent text-sm text-white outline-none"
      >
        <option value="ALL" className="bg-slate-900">
          All
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-900">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SortableTh({
  label,
  active,
  direction,
  onClick,
  className = "",
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={`px-4 py-4 font-medium ${className}`}>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2 transition ${
          active ? "text-white" : "text-slate-400 hover:text-slate-200"
        }`}
      >
        {label}
        <span className="text-[10px]">{active ? (direction === "asc" ? "↑" : "↓") : "↕"}</span>
      </button>
    </th>
  );
}

function ExposureRow({
  title,
  subtitle,
  value,
  widthPct,
}: {
  title: string;
  subtitle: string;
  value: string;
  widthPct: number;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs text-slate-400">{subtitle}</div>
        </div>
        <div className="text-sm font-semibold text-emerald-300">{value}</div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400"
          style={{ width: `${Math.max(6, Math.min(widthPct, 100))}%` }}
        />
      </div>
    </div>
  );
}

function TrendBar({ value }: { value: number }) {
  const normalized = Math.min(Math.abs(value), 100);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1728] p-3">
      <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
        <span>Trend magnitude</span>
        <span>{value}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${
            value < 0
              ? "bg-gradient-to-r from-rose-500 to-orange-400"
              : "bg-gradient-to-r from-emerald-500 to-cyan-400"
          }`}
          style={{ width: `${Math.max(4, normalized)}%` }}
        />
      </div>
    </div>
  );
}

function GroupModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
      }`}
    >
      {children}
    </button>
  );
}

function NavButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.08]"
    >
      {children}
    </button>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function shortCurrency(value: number) {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function pct(part: number, total: number) {
  if (!total) return "0.0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

function shortLabel(value: string, max = 12) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

function round2(value: number) {
  return Math.round((value || 0) * 100) / 100;
}

function claimConfidenceLabel(value: string) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  if (normalized === "low") return "Low";
  return value || "Unknown";
}

function confidenceScore(value: string) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "high") return 3;
  if (normalized === "medium") return 2;
  if (normalized === "low") return 1;
  return 0;
}

function compareClaims(
  a: FlaggedClaim,
  b: FlaggedClaim,
  sortKey: SortKey,
  sortDirection: SortDirection
) {
  let result = 0;

  switch (sortKey) {
    case "claim_id":
      result = a.claim_id.localeCompare(b.claim_id);
      break;
    case "payer":
      result = a.payer.localeCompare(b.payer);
      break;
    case "cpt_code":
      result = a.cpt_code.localeCompare(b.cpt_code);
      break;
    case "gap_amount":
      result = a.gap_amount - b.gap_amount;
      break;
    case "deviation_pct":
      result = a.deviation_pct - b.deviation_pct;
      break;
    case "confidence":
      result = confidenceScore(a.confidence) - confidenceScore(b.confidence);
      break;
    case "pattern_id":
      result = a.pattern_id.localeCompare(b.pattern_id);
      break;
    default:
      result = 0;
  }

  return sortDirection === "asc" ? result : -result;
}

function updateSort(
  nextKey: SortKey,
  currentKey: SortKey,
  currentDirection: SortDirection,
  setSortKey: (key: SortKey) => void,
  setSortDirection: (direction: SortDirection) => void
) {
  if (nextKey === currentKey) {
    setSortDirection(currentDirection === "asc" ? "desc" : "asc");
    return;
  }
  setSortKey(nextKey);
  setSortDirection(
    nextKey === "claim_id" ||
      nextKey === "payer" ||
      nextKey === "cpt_code" ||
      nextKey === "pattern_id"
      ? "asc"
      : "desc"
  );
}

function sortLabel(key: SortKey) {
  switch (key) {
    case "claim_id":
      return "Claim";
    case "payer":
      return "Payer";
    case "cpt_code":
      return "CPT";
    case "gap_amount":
      return "Gap";
    case "deviation_pct":
      return "Deviation";
    case "confidence":
      return "Confidence";
    case "pattern_id":
      return "Pattern";
    default:
      return "Gap";
  }
}

function exportClaimsCsv(claims: FlaggedClaim[], filename: string) {
  const headers = [
    "claim_id",
    "payer",
    "cpt_code",
    "modifier",
    "place_of_service",
    "allowed_amount",
    "expected_amount",
    "gap_amount",
    "deviation_pct",
    "confidence",
    "reason",
    "rule_applied",
    "rule_reason",
    "icd_explainability",
    "icd_confidence_adjustment",
    "pattern_id",
  ];

  const rows = claims.map((claim) =>
    headers.map((key) => csvEscape(String((claim as Record<string, unknown>)[key] ?? ""))).join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  downloadTextFile(csv, filename, "text/csv;charset=utf-8;");
}

function exportJson(data: AnalysisData, filename: string) {
  downloadTextFile(JSON.stringify(data, null, 2), filename, "application/json;charset=utf-8;");
}

function csvEscape(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function downloadTextFile(content: string, filename: string, mimeType: string) {
  downloadBlob(content, filename, mimeType);
}

function downloadHtmlFile(content: string, filename: string) {
  downloadBlob(content, filename, "text/html;charset=utf-8;");
}
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AuditFinding, AuditPageResult, AuditReport, AuditStatusResponse, LighthouseRunResult } from "@/lib/audit-agent/types";
import { isTerminalStatus } from "@/lib/audit-agent/types";

const STAGES = [
  ["queued", "Queued"],
  ["starting", "Starting browser"],
  ["preflight", "Checking website"],
  ["discover", "Discovering pages"],
  ["crawl", "Auditing pages"],
  ["viewport", "Responsive checks"],
  ["accessibility", "Accessibility checks"],
  ["lighthouse", "Lighthouse performance"],
  ["links", "External link checks"],
  ["report", "Generating report"],
] as const;

function stageText(stage?: string | null) {
  if (!stage) return "Waiting for worker update";
  const lower = stage.toLowerCase();
  const hit = STAGES.find(([token]) => lower.includes(token));
  return hit?.[1] ?? stage.replaceAll("_", " ");
}

export function AuditLiveView({ auditId }: { auditId: string }) {
  const [status, setStatus] = useState<AuditStatusResponse | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/tools/website-audit/${encodeURIComponent(auditId)}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as
        | { ok: true; data: AuditStatusResponse }
        | { ok: false; error: { message: string } }
        | null;
      if (!response.ok || !payload || !payload.ok) {
        throw new Error(payload && !payload.ok ? payload.error.message : "Could not load audit status.");
      }
      setStatus(payload.data);
      setError(null);
      return payload.data;
    } catch (value) {
      setError(value instanceof Error ? value.message : "Could not load audit status.");
      return null;
    }
  }, [auditId]);

  const loadReport = useCallback(async () => {
    try {
      const response = await fetch(`/api/tools/website-audit/${encodeURIComponent(auditId)}/report`, { cache: "no-store" });
      if (response.status === 404) return;
      const payload = (await response.json().catch(() => null)) as
        | { ok: true; data: AuditReport }
        | { ok: false; error: { message: string } }
        | null;
      if (!response.ok || !payload || !payload.ok) {
        throw new Error(payload && !payload.ok ? payload.error.message : "Could not load the finished report.");
      }
      setReport(payload.data);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Could not load the finished report.");
    }
  }, [auditId]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    async function tick() {
      const next = await loadStatus();
      if (stopped || !next) return;
      if (next.status === "completed" || next.status === "partial") {
        await loadReport();
        return;
      }
      if (!isTerminalStatus(next.status)) timer = setTimeout(tick, 2500);
    }

    void tick();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [loadReport, loadStatus]);

  async function cancelAudit() {
    setCancelling(true);
    try {
      const response = await fetch(`/api/tools/website-audit/${encodeURIComponent(auditId)}/cancel`, { method: "POST" });
      const payload = (await response.json().catch(() => null)) as
        | { ok: true; data: AuditStatusResponse }
        | { ok: false; error: { message: string } }
        | null;
      if (!response.ok || !payload || !payload.ok) throw new Error(payload && !payload.ok ? payload.error.message : "Could not cancel audit.");
      setStatus(payload.data);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Could not cancel audit.");
    } finally {
      setCancelling(false);
    }
  }

  const url = status?.request?.url ?? report?.request?.url ?? report?.start_url ?? "Website audit";

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={status?.status ?? "loading"} />
              <span className="font-mono text-xs text-ink-subtle">{auditId}</span>
            </div>
            <h1 className="mt-3 break-words text-2xl font-semibold text-ink sm:text-3xl">{url}</h1>
            <p className="mt-2 text-sm text-ink-muted">{stageText(status?.stage)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools/website-audit" className="inline-flex h-11 items-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-muted">
              New audit
            </Link>
            {status && !isTerminalStatus(status.status) ? (
              <Button variant="secondary" onClick={cancelAudit} disabled={cancelling}>{cancelling ? "Cancelling…" : "Cancel"}</Button>
            ) : null}
          </div>
        </div>

        {status && !isTerminalStatus(status.status) ? <LiveCounters status={status} /> : null}
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {!status ? <LoadingPanel /> : null}

      {status && !isTerminalStatus(status.status) ? <StagePanel stage={status.stage} status={status.status} /> : null}

      {status?.status === "failed" ? <Alert tone="error" title="Audit failed">{status.error ?? "The worker stopped before the audit finished."}</Alert> : null}
      {status?.status === "cancelled" ? <Alert tone="warn" title="Audit cancelled">This run was cancelled. Start a new audit when you are ready.</Alert> : null}

      {report ? <ReportView report={report} auditId={auditId} status={status} /> : null}

      {(status?.status === "completed" || status?.status === "partial") && !report ? (
        <div className="rounded-card border border-line bg-surface p-6 text-sm text-ink-muted">The audit finished. Preparing the report view…</div>
      ) : null}
      {(status?.status === "completed" || status?.status === "partial") && report ? <QuoteLink /> : null}
    </div>
  );
}

function QuoteLink() {
  return (
    <a
      href="https://codenativex.com/get-quote"
      aria-label="Get a quote from CodeNativeX"
      className="fixed bottom-6 right-5 z-50 inline-flex min-h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#93e9ca] via-[#e0b368] to-[#c77ae7] p-[2px] shadow-xl transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:right-8"
    >
      <span className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#0c1019] px-4 text-sm font-bold text-white sm:px-5">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M20 11.5a8 8 0 0 1-8 8 8.8 8.8 0 0 1-4-.9L4 20l1.4-4A8 8 0 1 1 20 11.5Z"/><path d="M8.5 11.5h7"/></svg>
        <span>GET A QUOTE</span>
      </span>
    </a>
  );
}

function LoadingPanel() {
  return <div className="rounded-card border border-line bg-surface p-8 text-sm text-ink-muted">Loading audit status…</div>;
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === "completed" ? "border-positive/30 bg-positive/10 text-positive" : status === "failed" || status === "cancelled" ? "border-critical/30 bg-critical/10 text-critical" : "border-accent/25 bg-accent-soft text-accent";
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${cls}`}>{status.replaceAll("_", " ")}</span>;
}

function LiveCounters({ status }: { status: AuditStatusResponse }) {
  const discovered = numberFrom(status.pages_discovered ?? status["pages_discovered"]);
  const processed = numberFrom(status.pages_processed ?? status["pages_processed"] ?? status["pages_audited"]);
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <Metric label="Current stage" value={stageText(status.stage)} />
      <Metric label="Pages discovered" value={discovered === null ? "—" : String(discovered)} />
      <Metric label="Pages processed" value={processed === null ? "—" : String(processed)} />
    </div>
  );
}

function StagePanel({ stage, status }: { stage?: string | null; status: string }) {
  const current = String(stage ?? status).toLowerCase();
  const currentIndex = Math.max(0, STAGES.findIndex(([token]) => current.includes(token)));
  return (
    <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-ink">Live audit progress</h2>
      <p className="mt-1 text-sm text-ink-muted">This screen refreshes automatically while the worker runs.</p>
      <ol className="mt-5 grid gap-3 md:grid-cols-2">
        {STAGES.map(([token, label], index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={token} className={`flex items-center gap-3 rounded-lg border p-3 ${active ? "border-accent bg-accent-soft" : "border-line bg-surface-muted"}`}>
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-positive text-on-accent" : active ? "bg-accent text-on-accent" : "bg-line text-ink-muted"}`}>
                {done ? "✓" : index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{label}</p>
                <p className="text-xs text-ink-subtle">{done ? "Completed" : active ? "Running" : "Waiting"}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ReportView({ report, auditId, status }: { report: AuditReport; auditId: string; status: AuditStatusResponse | null }) {
  const findings = Array.isArray(report.findings) ? report.findings : [];
  const pages = Array.isArray(report.pages) ? report.pages : [];
  const counts = findings.reduce<Record<string, number>>((acc, finding) => {
    const key = String(finding.severity ?? "info").toLowerCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const coverage = report.coverage ?? {};
  const htmlAudited = numberFrom(coverage["html_audited"]);
  const discovered = numberFrom(coverage["discovered"]);
  const scores = getRepresentativeScores(pages);
  const positives = confirmedStrengths(report, scores);
  const uniqueFindings = [...new Map<string, AuditFinding>(findings.map((finding): [string, AuditFinding] => [
    `${String(finding.code ?? finding.title ?? "").replace(/^lh-(mobile|desktop)-/, "lh-")}|${findingUrl(finding)}`,
    finding,
  ])).values()];
  const sortedFindings = uniqueFindings.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
  const available = new Set(status?.files ?? []);

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-positive">Audit complete</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Report overview</h2>
            <p className="mt-2 text-sm text-ink-muted">Measured results from the live audit worker. No placeholder scores are invented.</p>
          </div>
          <div className="shrink-0 lg:w-72">
            <div className="flex flex-wrap gap-2">
              {(["report.pdf", "report.html", "report.json", "audit-evidence.zip"] as const).map((name) =>
                available.has(name) ? (
                  <a key={name} href={`/api/tools/website-audit/${encodeURIComponent(auditId)}/files/${encodeURIComponent(name)}`} className="inline-flex h-10 items-center rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium text-ink hover:bg-surface-muted">
                    {downloadLabel(name)}
                  </a>
                ) : null,
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Pages audited" value={htmlAudited === null ? String(pages.length) : String(htmlAudited)} />
          <Metric label="Pages discovered" value={discovered === null ? "—" : String(discovered)} />
          <Metric label="Findings" value={String(findings.length)} />
          <Metric label="Errors" value={String(Array.isArray(report.errors) ? report.errors.length : 0)} />
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">What your website is doing well</h2>
        <p className="mt-1 text-sm text-ink-muted">Only results confirmed by completed checks appear here.</p>
        {positives.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {positives.map((point) => <li key={point} className="rounded-lg border border-positive/25 bg-positive/5 p-4 text-sm text-ink"><span className="mr-2 font-bold text-positive">✓</span>{point}</li>)}
          </ul>
        ) : <p className="mt-4 text-sm text-ink-muted">No positive result was confirmed by the completed checks.</p>}
      </section>

      {scores ? (
        <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-ink">Lighthouse snapshot</h2>
          <p className="mt-1 text-sm text-ink-muted">Representative scores from the first completed Lighthouse run in this report.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ScoreCard label="Performance" value={scores.performance} />
            <ScoreCard label="SEO" value={scores.seo} />
            <ScoreCard label="Accessibility" value={scores.accessibility} />
            <ScoreCard label="Best Practices" value={scores.bestPractices} />
          </div>
        </section>
      ) : null}

      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Finding severity</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Critical" value={String(counts.critical ?? 0)} />
          <Metric label="High" value={String(counts.high ?? 0)} />
          <Metric label="Medium" value={String((counts.medium ?? 0) + (counts.moderate ?? 0))} />
          <Metric label="Low / info" value={String((counts.low ?? 0) + (counts.minor ?? 0) + (counts.info ?? 0))} />
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Findings</h2>
            <p className="mt-1 text-sm text-ink-muted">Clear issues first. Items marked needs review require a visual check. Full evidence is available in JSON.</p>
          </div>
          <span className="text-xs text-ink-subtle">{sortedFindings.length} issue groups</span>
        </div>
        {sortedFindings.length ? (
          <div className="mt-5 space-y-3">
            {sortedFindings.slice(0, 6).map((finding, index) => <FindingCard key={`${finding.id ?? finding.code ?? index}`} finding={finding} />)}
            {sortedFindings.length > 6 ? (
              <details className="rounded-lg border border-line bg-surface-muted p-4">
                <summary className="cursor-pointer text-sm font-semibold text-ink">View all {sortedFindings.length - 6} remaining observations</summary>
                <ul className="mt-3 divide-y divide-line text-sm">
                  {sortedFindings.slice(6).map((finding, index) => (
                    <li key={`${finding.id ?? finding.code ?? index}-other`} className="py-2 text-ink-muted">
                      <strong className="text-ink">{renderValue(finding.title ?? finding.code ?? "Finding")}</strong>
                      <span className="ml-2 text-xs">· {findingUrl(finding)} · {finding.severity ?? "info"}</span>
                      <p className="mt-1 text-xs">{findingExplanation(finding)}</p>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 text-sm text-ink-muted">No findings were published in report.json.</p>
        )}
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">Audited pages</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-subtle">
              <tr><th className="px-3 py-3">URL</th><th className="px-3 py-3">State</th><th className="px-3 py-3">HTTP</th><th className="px-3 py-3">Findings</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pages.map((page, index) => (
                <tr key={`${page.url ?? page.final_url ?? index}`}>
                  <td className="max-w-xl break-all px-3 py-3 text-ink">{page.final_url ?? page.url ?? "—"}</td>
                  <td className="px-3 py-3 text-ink-muted">{page.state ?? "—"}</td>
                  <td className="px-3 py-3 text-ink-muted">{page.http_status ?? page.status_code ?? "—"}</td>
                  <td className="px-3 py-3 text-ink-muted">{Array.isArray(page.findings) ? page.findings.length : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FindingCard({ finding }: { finding: AuditFinding }) {
  const severity = String(finding.severity ?? "info").toLowerCase();

  const tone =
    severity === "critical" || severity === "high"
      ? "border-critical/25 bg-critical/5"
      : severity === "medium" || severity === "moderate"
        ? "border-caution/30 bg-caution/5"
        : "border-line bg-surface-muted";

  return (
    <article className={`rounded-lg border p-4 ${tone}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
          {severity}
        </span>

        {finding.category ? (
          <span className="text-xs text-ink-subtle">
            {renderValue(finding.category)}
          </span>
        ) : null}

        {finding.status ? (
          <span className="text-xs text-ink-subtle">
            · {renderValue(finding.status)}
          </span>
        ) : null}
      </div>

      <h3 className="mt-2 text-sm font-semibold text-ink">
        {renderValue(finding.title ?? finding.code ?? "Finding")}
      </h3>

      {finding.evidence ? (
        <div className="mt-2 text-sm leading-relaxed text-ink-muted">
          <strong className="font-medium text-ink">What we found:</strong>
          <p className="mt-1">{findingExplanation(finding)}</p>
          <p className="mt-1 break-all text-xs">Affected page: {findingUrl(finding)}</p>
        </div>
      ) : null}
    </article>
  );
}

function severityOrder(value: unknown): number {
  return ({ critical: 0, high: 1, medium: 2, moderate: 2, low: 3, minor: 3, info: 4 } as Record<string, number>)[String(value ?? "info").toLowerCase()] ?? 5;
}

function evidenceObject(finding: AuditFinding): Record<string, unknown> {
  const evidence: unknown = finding.evidence;
  return evidence && typeof evidence === "object" && !Array.isArray(evidence)
    ? evidence as Record<string, unknown> : {};
}

function findingUrl(finding: AuditFinding): string {
  const url = finding.url ?? evidenceObject(finding).url;
  return typeof url === "string" ? url : "Audited page";
}

function findingExplanation(finding: AuditFinding): string {
  const code = String(finding.code ?? "").replace(/^lh-(mobile|desktop)-/, "");
  const explanations: Record<string, string> = {
    "clipped-text": "Some text may be cut off on the tested screen size. Visual confirmation is needed.",
    "covered-targets": "Another layer was detected above buttons or links. Confirm whether a cookie dialog caused it.",
    "small-targets": "Some links or buttons have small measured tap areas; their usability needs review.",
    "color-contrast": "Some text has insufficient contrast against its background and may be difficult to read.",
    "cookie-panel-unresolved": "The audit could not dismiss the cookie panel, so controls behind it could not be checked reliably.",
    "heading-order": "Headings skip levels, which can make navigation harder for assistive technology.",
    "total-blocking-time": "The browser was busy during the measured page load, which can delay interaction.",
    "largest-contentful-paint": "The main visible page content took longer to appear in this lab measurement.",
  };
  const detail = evidenceObject(finding).detail;
  return explanations[code] ?? (typeof detail === "string" && detail.length < 150
    ? detail
    : `The audit flagged ${String(finding.title ?? "this issue").toLowerCase()} during its completed checks.`);
}

function confirmedStrengths(report: AuditReport, scores: ReturnType<typeof getRepresentativeScores>): string[] {
  const strengths: string[] = [];
  if (scores?.seo !== null && scores?.seo !== undefined && scores.seo >= 90) strengths.push(`SEO checks scored ${Math.round(scores.seo)}/100.`);
  if (scores?.accessibility !== null && scores?.accessibility !== undefined && scores.accessibility >= 90) strengths.push(`Accessibility checks scored ${Math.round(scores.accessibility)}/100.`);
  if (scores?.bestPractices !== null && scores?.bestPractices !== undefined && scores.bestPractices >= 90) strengths.push(`Best Practices scored ${Math.round(scores.bestPractices)}/100.`);
  const pages = Array.isArray(report.pages) ? report.pages : [];
  if (pages.some((page) => page.state === "completed" && page.http_status === 200)) strengths.push("At least one audited page returned HTTP 200.");
  const completed = numberFrom(report.coverage?.["viewport_tests_completed"]);
  const scheduled = numberFrom(report.coverage?.["viewport_tests_scheduled"]);
  if (completed !== null && scheduled !== null && scheduled > 0 && completed === scheduled) strengths.push(`All ${completed} scheduled viewport checks completed.`);
  return strengths;
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => renderValue(item)).join("\n");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-line bg-surface-muted p-4"><p className="text-xs uppercase tracking-wide text-ink-subtle">{label}</p><p className="mt-1 text-xl font-semibold text-ink">{value}</p></div>;
}

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  const shown = value === null ? "—" : String(Math.round(value));
  return <div className="rounded-lg border border-line bg-surface-muted p-4"><p className="text-sm font-medium text-ink">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums text-ink">{shown}</p><p className="mt-1 text-xs text-ink-subtle">{value === null ? "Not measured" : "out of 100"}</p></div>;
}

function getRepresentativeScores(pages: AuditPageResult[]) {
  for (const page of pages) {
    for (const mode of [page.lighthouse?.mobile, page.lighthouse?.desktop]) {
      const selected = mode?.selected as LighthouseRunResult | undefined;
      const run = selected?.scores ? selected : mode?.runs?.find((candidate: LighthouseRunResult) => candidate.state === "completed" && candidate.scores);
      if (run?.scores) {
        return {
          performance: scoreNumber(run.scores.performance),
          seo: scoreNumber(run.scores.seo),
          accessibility: scoreNumber(run.scores.accessibility),
          bestPractices: scoreNumber(run.scores.best_practices ?? run.scores["best-practices"]),
        };
      }
    }
  }
  return null;
}

function scoreNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value <= 1 ? value * 100 : value;
}

function numberFrom(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function downloadLabel(name: string) {
  if (name === "report.pdf") return "PDF";
  if (name === "report.html") return "HTML";
  if (name === "report.json") return "JSON";
  if (name === "audit-evidence.zip") return "Evidence ZIP";
  return name;
}

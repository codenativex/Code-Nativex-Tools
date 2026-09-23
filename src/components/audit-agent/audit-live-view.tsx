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
    </div>
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

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Pages audited" value={htmlAudited === null ? String(pages.length) : String(htmlAudited)} />
          <Metric label="Pages discovered" value={discovered === null ? "—" : String(discovered)} />
          <Metric label="Findings" value={String(findings.length)} />
          <Metric label="Errors" value={String(Array.isArray(report.errors) ? report.errors.length : 0)} />
        </div>
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
            <p className="mt-1 text-sm text-ink-muted">Prioritized issues and review items produced by the audit.</p>
          </div>
          <span className="text-xs text-ink-subtle">Showing up to 100</span>
        </div>
        {findings.length ? (
          <div className="mt-5 space-y-3">
            {findings.slice(0, 100).map((finding, index) => <FindingCard key={`${finding.id ?? finding.code ?? index}`} finding={finding} />)}
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
          <strong className="font-medium text-ink">Evidence:</strong>
          <div className="mt-1 whitespace-pre-wrap break-words">
            {renderValue(finding.evidence)}
          </div>
        </div>
      ) : null}

      {finding.recommendation ? (
        <div className="mt-2 text-sm leading-relaxed text-ink-muted">
          <strong className="font-medium text-ink">Recommendation:</strong>
          <div className="mt-1 whitespace-pre-wrap break-words">
            {renderValue(finding.recommendation)}
          </div>
        </div>
      ) : null}
    </article>
  );
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
      const run = mode?.runs?.find((candidate: LighthouseRunResult) => candidate.state === "completed" && candidate.scores);
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

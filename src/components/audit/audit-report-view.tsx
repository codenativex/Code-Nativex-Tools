"use client";

import { useMemo, useState } from "react";

import { FindingList } from "@/components/audit/finding-list";
import { ScoreBar } from "@/components/audit/score-bar";
import { ScoreDial } from "@/components/audit/score-dial";
import { Button } from "@/components/ui/button";
import { countFindings, type AuditReport, type FindingStatus } from "@/lib/audit/types";
import { downloadTextFile, slugifyUrl } from "@/lib/utils/download";
import { useClipboard } from "@/lib/utils/use-clipboard";
import { cn } from "@/lib/utils/cn";

type FindingFilter = "all" | FindingStatus;

const filters: readonly { id: FindingFilter; label: string }[] = [
  { id: "all", label: "All checks" },
  { id: "fail", label: "Issues" },
  { id: "warn", label: "Warnings" },
  { id: "pass", label: "Passed" },
];

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function toPlainTextSummary(report: AuditReport): string {
  const lines = [
    `Website audit — ${report.finalUrl}`,
    `Overall score: ${report.overallScore}/100`,
    `Audited: ${formatTimestamp(report.fetchedAt)}`,
    "",
    ...report.categories.flatMap((category) => [
      `${category.name} — ${category.score}/100`,
      ...category.findings.map((finding) => `  [${finding.status.toUpperCase()}] ${finding.title}: ${finding.detail}`),
      "",
    ]),
  ];
  return lines.join("\n");
}

export function AuditReportView({ report }: { readonly report: AuditReport }) {
  const [filter, setFilter] = useState<FindingFilter>("all");
  const { state: copyState, copy } = useClipboard();
  const counts = useMemo(() => countFindings(report), [report]);

  const visibleCategories = useMemo(
    () =>
      report.categories
        .map((category) => ({
          ...category,
          findings: filter === "all" ? category.findings : category.findings.filter((item) => item.status === filter),
        }))
        .filter((category) => category.findings.length > 0),
    [report.categories, filter],
  );

  const facts: readonly { label: string; value: string }[] = [
    { label: "Final URL", value: report.finalUrl },
    { label: "HTTP status", value: String(report.statusCode) },
    { label: "Response time", value: `${report.durationMs.toLocaleString("en-US")} ms` },
    { label: "Document size", value: `${Math.round(report.facts.htmlBytes / 1024).toLocaleString("en-US")} KB` },
    { label: "Word count", value: report.facts.wordCount.toLocaleString("en-US") },
    {
      label: "Headings",
      value: `${report.facts.headingCounts.h1} H1 · ${report.facts.headingCounts.h2} H2 · ${report.facts.headingCounts.h3} H3`,
    },
    { label: "Links", value: `${report.facts.internalLinks} internal · ${report.facts.externalLinks} external` },
    { label: "Images", value: `${report.facts.imageCount} total · ${report.facts.imagesMissingAlt} without alt` },
  ];

  return (
    <div className="space-y-6">
      <section aria-labelledby="audit-summary" className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h2 id="audit-summary" className="text-lg font-semibold text-ink">
              Audit summary
            </h2>
            <p className="mt-1 break-all font-mono text-sm text-ink-muted">{report.finalUrl}</p>
            <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-ink">{report.summary}</p>
            <p className="mt-3 text-xs text-ink-subtle">Audited {formatTimestamp(report.fetchedAt)}</p>

            <dl className="mt-5 grid grid-cols-3 gap-3 sm:max-w-md">
              {[
                { label: "Passed", value: counts.passed, tone: "text-positive" },
                { label: "Warnings", value: counts.warnings, tone: "text-[oklch(0.5_0.12_75)]" },
                { label: "Issues", value: counts.issues, tone: "text-critical" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-line bg-surface-muted px-3 py-2.5">
                  <dt className="text-xs text-ink-muted">{item.label}</dt>
                  <dd className={cn("mt-0.5 font-mono text-xl font-semibold tabular-nums", item.tone)}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="shrink-0 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <ScoreDial score={report.overallScore} label="Overall score" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              downloadTextFile(
                `audit-${slugifyUrl(report.finalUrl)}.json`,
                JSON.stringify(report, null, 2),
                "application/json",
              )
            }
          >
            Download JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void copy(toPlainTextSummary(report))}>
            {copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy summary"}
          </Button>
        </div>
      </section>

      <section aria-labelledby="audit-categories" className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <h2 id="audit-categories" className="text-lg font-semibold text-ink">
          Category scores
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {report.categories.map((category) => (
            <ScoreBar key={category.id} score={category.score} label={category.name} />
          ))}
        </div>
      </section>

      <section aria-labelledby="audit-findings">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="audit-findings" className="text-lg font-semibold text-ink">
            Findings
          </h2>
          <div role="group" aria-label="Filter findings" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex w-max gap-2">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "h-9 shrink-0 rounded-full border px-3.5 text-sm transition-colors",
                    filter === item.id
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {visibleCategories.length === 0 ? (
            <p className="rounded-card border border-dashed border-line-strong bg-surface px-6 py-12 text-center text-sm text-ink-muted">
              No checks in this category. That is good news — nothing matched this filter.
            </p>
          ) : (
            visibleCategories.map((category) => (
              <details key={category.id} open className="group rounded-card border border-line bg-surface">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <h3 className="text-[0.9375rem] font-semibold text-ink">{category.name}</h3>
                    <p className="mt-0.5 truncate text-sm text-ink-muted">{category.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-sm tabular-nums text-ink-muted">{category.score}</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-ink-subtle transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </summary>
                <div className="border-t border-line px-5 py-4 sm:px-6">
                  <FindingList findings={category.findings} />
                </div>
              </details>
            ))
          )}
        </div>
      </section>

      <section aria-labelledby="audit-technical" className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <h2 id="audit-technical" className="text-lg font-semibold text-ink">
          Technical details
        </h2>
        <p className="mt-1 text-sm text-ink-muted">Raw values the agent read from the response.</p>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0 border-b border-line pb-3">
              <dt className="text-xs uppercase tracking-[0.06em] text-ink-subtle">{fact.label}</dt>
              <dd className="mt-1 break-words font-mono text-sm text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

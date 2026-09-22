"use client";

import * as React from "react";
import Link from "next/link";

import type { LeadResult, LeadResultsResponse, LeadSearchProgress } from "@/lib/lead-agent/types";

const terminal = new Set(["completed", "needs_review", "failed", "cancelled"]);

export function LeadGenerationLiveView({ requestId }: { requestId: string }) {
  const [progress, setProgress] = React.useState<LeadSearchProgress | null>(null);
  const [leads, setLeads] = React.useState<LeadResult[]>([]);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      try {
        const response = await fetch(`/api/tools/lead-generation/${encodeURIComponent(requestId)}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load lead generation progress.");
        if (stopped) return;
        setProgress(data);
        setError("");

        if (terminal.has(data.status)) {
          const leadResponse = await fetch(`/api/tools/lead-generation/${encodeURIComponent(requestId)}/leads`, { cache: "no-store" });
          if (leadResponse.ok) {
            const result = (await leadResponse.json()) as LeadResultsResponse;
            if (!stopped) setLeads(result.items ?? []);
          }
          return;
        }
        timer = setTimeout(load, 2500);
      } catch (cause) {
        if (!stopped) {
          setError(cause instanceof Error ? cause.message : "Could not load progress.");
          timer = setTimeout(load, 4000);
        }
      }
    }
    load();
    return () => { stopped = true; if (timer) clearTimeout(timer); };
  }, [requestId]);

  const percent = Math.max(0, Math.min(100, progress?.percentComplete ?? 0));

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">Lead generation run</p>
            <h2 className="mt-2 text-xl font-semibold text-ink">{progress?.status ?? "Connecting to agent…"}</h2>
            <p className="mt-1 font-mono text-xs text-ink-subtle">{requestId}</p>
          </div>
          <Link href="/tools/lead-generation" className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink">New search</Link>
        </div>

        <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-subtle"><span>{progress?.currentStage ?? "Waiting"}</span><span>{percent}%</span></div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Discovered", progress?.businessesDiscovered ?? 0],
            ["Verified", progress?.verifiedLeads ?? 0],
            ["High potential", progress?.highPotentialLeads ?? 0],
            ["Duplicates removed", progress?.duplicatesRemoved ?? 0],
            ["Invalid rejected", progress?.invalidContactsRejected ?? 0],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg border border-line bg-surface-muted p-3">
              <p className="text-xs text-ink-subtle">{label}</p><p className="mt-1 text-xl font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {progress?.stages?.length ? (
        <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <h3 className="font-semibold text-ink">Agent progress</h3>
          <div className="mt-4 space-y-2">
            {progress.stages.map((stage) => (
              <div key={stage.key} className="flex items-start justify-between gap-4 rounded-lg border border-line px-3 py-3">
                <div><p className="text-sm font-medium text-ink">{stage.label}</p>{stage.detail ? <p className="mt-1 text-xs text-ink-muted">{stage.detail}</p> : null}</div>
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">{stage.status}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {error ? <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {progress?.errorMessage ? <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{progress.errorMessage}</div> : null}

      {terminal.has(progress?.status ?? "") ? (
        <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4"><div><h3 className="font-semibold text-ink">Lead results</h3><p className="mt-1 text-sm text-ink-muted">{leads.length} lead(s) returned for this run.</p></div></div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead><tr className="border-b border-line text-xs uppercase tracking-wide text-ink-subtle">
                <th className="py-3 pr-4">Company</th><th className="py-3 pr-4">Location</th><th className="py-3 pr-4">Score</th><th className="py-3 pr-4">Website</th><th className="py-3 pr-4">Email</th><th className="py-3">Recommended service</th>
              </tr></thead>
              <tbody>
                {leads.map((lead) => <tr key={lead.id} className="border-b border-line align-top">
                  <td className="py-3 pr-4"><p className="font-medium text-ink">{lead.companyName}</p><p className="text-xs text-ink-muted">{lead.category}</p></td>
                  <td className="py-3 pr-4 text-ink-muted">{[lead.city, lead.region, lead.country].filter(Boolean).join(", ")}</td>
                  <td className="py-3 pr-4 font-semibold text-ink">{lead.score}</td>
                  <td className="py-3 pr-4">{lead.website ? <a href={lead.website} target="_blank" rel="noreferrer" className="text-ink underline underline-offset-2">Open</a> : "—"}</td>
                  <td className="py-3 pr-4 text-ink-muted">{lead.email ?? "—"}</td>
                  <td className="py-3 text-ink-muted">{lead.recommendedService}</td>
                </tr>)}
              </tbody>
            </table>
            {leads.length === 0 ? <p className="py-8 text-center text-sm text-ink-muted">No leads are available yet. If this run is marked needs review, check the agent workflow/logs.</p> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

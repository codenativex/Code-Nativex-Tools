"use client";

import * as React from "react";
import type { SocialAgentStatusResponse, SocialWorkflowStatus } from "@/lib/social-agent/types";

function StatusPill({ workflow }: { readonly workflow: SocialWorkflowStatus }) {
  const label = !workflow.configured ? "Not configured" : !workflow.reachable ? "Unavailable" : workflow.active ? "Active" : "Inactive";
  const tone = workflow.reachable && workflow.active
    ? "border-positive/25 bg-positive/10 text-positive-ink"
    : workflow.configured
      ? "border-caution/25 bg-caution/10 text-caution-ink"
      : "border-line bg-surface-muted text-ink-muted";
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

function WorkflowCard({ number, title, description, workflow }: { readonly number: string; readonly title: string; readonly description: string; readonly workflow: SocialWorkflowStatus }) {
  return (
    <article className="rounded-card border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="font-mono text-xs text-ink-subtle">WORKFLOW {number}</p><h3 className="mt-2 text-sm font-semibold text-ink">{title}</h3><p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p></div>
        <StatusPill workflow={workflow} />
      </div>
      {workflow.workflowName ? <p className="mt-4 text-xs font-medium text-ink">{workflow.workflowName}</p> : null}
      {workflow.workflowId ? <p className="mt-1 font-mono text-xs text-ink-subtle">ID: {workflow.workflowId}</p> : null}
      {workflow.error ? <p className="mt-3 text-xs leading-relaxed text-caution-ink">{workflow.error}</p> : null}
    </article>
  );
}

export function SocialMediaPostAgentRunner() {
  const [data, setData] = React.useState<SocialAgentStatusResponse | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const refresh = React.useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/tools/social-media-post-agent/status", { cache: "no-store" });
      if (!response.ok) throw new Error(`Status request failed with HTTP ${response.status}.`);
      setData((await response.json()) as SocialAgentStatusResponse);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not check the Social Media Post Agent.");
    } finally {
      setBusy(false);
    }
  }, []);

  React.useEffect(() => { void refresh(); }, [refresh]);

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><h2 className="text-lg font-semibold text-ink">Social Media Post Agent</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">Monitor the complete brand setup, daily generation and WhatsApp approval-to-publishing pipeline. API credentials remain on the server and inside n8n.</p></div>
          <button type="button" onClick={() => void refresh()} disabled={busy} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-control border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted disabled:opacity-50">{busy ? "Checking…" : "Refresh status"}</button>
        </div>
        {error ? <div role="alert" className="mt-5 rounded-control border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical-ink">{error}</div> : null}
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <WorkflowCard number="01" title="Brand Setup" description="Reads the business website, creates the brand profile and saves it to Google Sheets." workflow={data?.brandSetup ?? { configured: false, reachable: false }} />
          <WorkflowCard number="02" title="Daily Post Generator" description="Creates the caption and branded poster, uploads it and sends the approval request." workflow={data?.dailyPublisher ?? { configured: false, reachable: false }} />
          <WorkflowCard number="03" title="WhatsApp Approval & Publishing" description="Processes YES/NO, publishes approved posts and requests regeneration when rejected." workflow={data?.approvalPublisher ?? { configured: false, reachable: false }} />
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-base font-semibold text-ink">Approval flow</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-control border border-line bg-surface-muted p-4"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-subtle">Generate</p><p className="mt-2 text-sm text-ink-muted">AI writes the caption, creates campaign art and applies the exact brand logo.</p></div>
          <div className="rounded-control border border-line bg-surface-muted p-4"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-subtle">Approve</p><p className="mt-2 text-sm text-ink-muted">WhatsApp sends the final poster with YES and NO approval buttons.</p></div>
          <div className="rounded-control border border-line bg-surface-muted p-4"><p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-subtle">Publish</p><p className="mt-2 text-sm text-ink-muted">YES publishes to Facebook and/or Instagram; NO creates a fresh version.</p></div>
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-base font-semibold text-ink">Required n8n setup</h2>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
          <li><strong className="text-ink">1.</strong> Import and configure Brand Setup, Daily Publisher and WhatsApp Approval workflows.</li>
          <li><strong className="text-ink">2.</strong> Connect OpenAI, Google Sheets, Cloudinary, WhatsApp Cloud API and Meta publishing credentials inside n8n.</li>
          <li><strong className="text-ink">3.</strong> Activate all three production workflows after end-to-end testing.</li>
          <li><strong className="text-ink">4.</strong> Add the n8n URL, API key and three workflow IDs to the Tools server environment.</li>
        </ol>
      </section>

      <section className="rounded-card border border-line bg-surface-muted p-5"><h2 className="text-sm font-semibold text-ink">Security boundary</h2><p className="mt-2 text-sm leading-relaxed text-ink-muted">OpenAI, Google, Cloudinary, WhatsApp and Meta credentials stay inside n8n. N8N_API_KEY is read only by the Next.js server route and must never use the NEXT_PUBLIC_ prefix.</p></section>
    </div>
  );
}

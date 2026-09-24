"use client";

import * as React from "react";
import type { GmailAgentStatusResponse, GmailAgentWorkflowStatus } from "@/lib/gmail-agent/types";

function Workflow({ title, workflow }: { readonly title: string; readonly workflow: GmailAgentWorkflowStatus }) {
  const label = !workflow.configured ? "Not configured" : !workflow.reachable ? "Unavailable" : workflow.active ? "Active" : "Inactive";
  return <article className="rounded-card border border-line bg-surface p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-sm font-semibold text-ink">{title}</h3><span className="rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs font-semibold text-ink-muted">{label}</span></div>{workflow.workflowName ? <p className="mt-4 text-xs font-medium text-ink">{workflow.workflowName}</p> : null}{workflow.workflowId ? <p className="mt-1 font-mono text-xs text-ink-subtle">ID: {workflow.workflowId}</p> : null}{workflow.error ? <p className="mt-3 text-xs text-caution-ink">{workflow.error}</p> : null}</article>;
}

export function GmailReplyAgentRunner() {
  const [data, setData] = React.useState<GmailAgentStatusResponse | null>(null);
  const [busy, setBusy] = React.useState(false);
  const refresh = React.useCallback(async () => { setBusy(true); try { const response = await fetch("/api/tools/gmail-reply-agent/status", { cache: "no-store" }); setData((await response.json()) as GmailAgentStatusResponse); } finally { setBusy(false); } }, []);
  React.useEffect(() => { void refresh(); }, [refresh]);
  return <div className="space-y-6"><section className="rounded-card border border-line bg-surface p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-ink">Gmail Reply Agent</h2><p className="mt-1 text-sm text-ink-muted">Live status of the connected n8n email automation.</p></div><button type="button" onClick={() => void refresh()} disabled={busy} className="rounded-control border border-line px-4 py-2 text-sm font-semibold">{busy ? "Checking…" : "Refresh status"}</button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Workflow title="Professional Gmail Reply Agent" workflow={data?.agent ?? { configured: false, reachable: false }} /><Workflow title="Gmail Error Alert" workflow={data?.errorAlert ?? { configured: false, reachable: false }} /></div></section></div>;
}

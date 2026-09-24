import { NextResponse } from "next/server";
import { getN8nWorkflowStatus } from "@/lib/gmail-agent/server";
import type { GmailAgentStatusResponse } from "@/lib/gmail-agent/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [agent, errorAlert] = await Promise.all([
    getN8nWorkflowStatus(process.env.N8N_GMAIL_REPLY_WORKFLOW_ID),
    getN8nWorkflowStatus(process.env.N8N_GMAIL_ERROR_WORKFLOW_ID),
  ]);
  const body: GmailAgentStatusResponse = { ok: agent.reachable, checkedAt: new Date().toISOString(), agent, errorAlert };
  return NextResponse.json(body, { headers: { "cache-control": "no-store" } });
}

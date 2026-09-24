import "server-only";

import type { SocialWorkflowStatus } from "./types";

export async function getSocialWorkflowStatus(workflowId: string | undefined): Promise<SocialWorkflowStatus> {
  if (!workflowId) return { configured: false, reachable: false };
  const baseUrl = (process.env.N8N_API_URL ?? "").replace(/\/$/, "");
  const apiKey = process.env.N8N_API_KEY ?? "";
  if (!baseUrl || !apiKey) return { configured: false, reachable: false, workflowId, error: "N8N_API_URL or N8N_API_KEY is not configured." };

  try {
    const response = await fetch(`${baseUrl}/api/v1/workflows/${encodeURIComponent(workflowId)}`, {
      headers: { "X-N8N-API-KEY": apiKey },
      cache: "no-store",
    });
    if (!response.ok) return { configured: true, reachable: false, workflowId, error: `n8n returned HTTP ${response.status}.` };
    const data = (await response.json()) as { id?: string; name?: string; active?: boolean; updatedAt?: string };
    return { configured: true, reachable: true, workflowId: data.id ?? workflowId, workflowName: data.name, active: data.active, updatedAt: data.updatedAt };
  } catch (error) {
    return { configured: true, reachable: false, workflowId, error: error instanceof Error ? error.message : "Could not reach n8n." };
  }
}

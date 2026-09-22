import { jsonError, jsonSuccess } from "@/lib/api/http";
import { auditArtifactPath, auditWorkerFetch } from "@/lib/audit-agent/server";
import type { AuditReport } from "@/lib/audit-agent/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ auditId: string }> }) {
  try {
    const { auditId } = await params;
    const response = await auditWorkerFetch(auditArtifactPath(auditId, "report.json"));
    if (response.status === 404) return jsonError("The report is not ready yet.", "not_ready", 404);
    if (!response.ok) return jsonError(`Audit service returned HTTP ${response.status}.`, "audit_service_error", 502);
    return jsonSuccess((await response.json()) as AuditReport);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load report.", "audit_service_error", 502);
  }
}

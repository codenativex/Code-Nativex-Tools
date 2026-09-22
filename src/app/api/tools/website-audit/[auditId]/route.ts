import { jsonError, jsonSuccess } from "@/lib/api/http";
import { auditStatusPath, auditWorkerJson } from "@/lib/audit-agent/server";
import type { AuditStatusResponse } from "@/lib/audit-agent/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ auditId: string }> }) {
  try {
    const { auditId } = await params;
    const { data } = await auditWorkerJson<AuditStatusResponse>(auditStatusPath(auditId));
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load audit status.", "audit_service_error", 502);
  }
}

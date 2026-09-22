import { z } from "zod";

import { jsonError, jsonSuccess, readJsonBody } from "@/lib/api/http";
import { checkRateLimit, clientKey } from "@/lib/api/rate-limit";
import { auditWorkerJson } from "@/lib/audit-agent/server";
import type { AuditStatusResponse, AuditSubmission } from "@/lib/audit-agent/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  url: z.string().min(1).max(2048),
  company_name: z.string().trim().max(200).optional(),
  client_request_id: z.string().min(8).max(128),
  max_pages: z.number().int().min(1).max(500),
  performance_pages: z.number().int().min(0).max(500),
  lighthouse_runs: z.number().int().min(1).max(3),
  external_links: z.number().int().min(0).max(500),
  cross_browser: z.boolean(),
  firefox: z.boolean(),
  ai_enabled: z.boolean(),
}).refine((value) => value.performance_pages === 0 || value.performance_pages <= value.max_pages, {
  path: ["performance_pages"],
  message: "Performance pages cannot exceed the page budget. Use 0 for every audited page.",
});

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, "website-audit-agent"), { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) return jsonError(`Too many audit submissions. Try again in ${limit.retryAfterSeconds} seconds.`, "rate_limited", 429);

  const parsed = requestSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return jsonError(issue?.message ?? "Invalid audit settings.", "invalid_input", 400, issue?.path[0] ? { [String(issue.path[0])]: issue.message } : undefined);
  }

  try {
    const submission: AuditSubmission = parsed.data;
    const { data } = await auditWorkerJson<AuditStatusResponse>("/v1/audits", {
      method: "POST",
      body: JSON.stringify(submission),
    });
    return jsonSuccess(data);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "The audit could not be started.", "audit_service_error", 502);
  }
}

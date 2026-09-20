import { z } from "zod";

import { jsonError, jsonSuccess, readJsonBody } from "@/lib/api/http";
import { checkRateLimit, clientKey } from "@/lib/api/rate-limit";
import { analyzePage } from "@/lib/audit/analyze";
import { AuditFetchError, fetchPage } from "@/lib/audit/fetch-page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  url: z.string().min(1, "Enter a website URL.").max(2048, "That URL is too long."),
});

export async function POST(request: Request): Promise<Response> {
  const limit = checkRateLimit(clientKey(request, "website-audit"), { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return jsonError(
      `Too many audits from this connection. Try again in ${limit.retryAfterSeconds} seconds.`,
      "rate_limited",
      429,
    );
  }

  const parsed = requestSchema.safeParse(await readJsonBody(request));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "That request was not valid.";
    return jsonError(message, "invalid_input", 400, { url: message });
  }

  try {
    const page = await fetchPage(parsed.data.url);
    return jsonSuccess({ view: "audit-report", report: analyzePage(page) });
  } catch (error) {
    if (error instanceof AuditFetchError) {
      const status = error.code === "invalid_url" || error.code === "blocked_host" ? 400 : 502;
      return jsonError(error.message, error.code, status);
    }
    console.error("website-audit: unexpected failure", error);
    return jsonError("The audit could not be completed. Please try again.", "unexpected", 500);
  }
}

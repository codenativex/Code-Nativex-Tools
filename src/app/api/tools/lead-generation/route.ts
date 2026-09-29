import type { LeadSearchCriteria } from "@/lib/lead-agent/types";

function jsonError(message: string, status = 500, detail?: unknown) {
  return Response.json({ error: message, ...(detail === undefined ? {} : { detail }) }, { status });
}

function makeClientRequestId() {
  return `dashboard-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_LEAD_REQUEST_WEBHOOK_URL ?? "";
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET ?? "";

  if (!webhookUrl) {
    return jsonError("N8N_LEAD_REQUEST_WEBHOOK_URL is not configured.", 500);
  }

  let criteria: LeadSearchCriteria;
  try {
    criteria = (await request.json()) as LeadSearchCriteria;
  } catch {
    return jsonError("The lead search request must be valid JSON.", 400);
  }

  const clientRequestId = makeClientRequestId();

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(webhookSecret ? { "x-codenativex-intake-key": webhookSecret } : {}),
      },
      body: JSON.stringify({
        requestId: clientRequestId,
        requestedBy: "codenativex-tools",
        criteria,
      }),
      cache: "no-store",
    });

    const raw = await response.text();
    let data: Record<string, unknown> = {};
    if (raw) {
      try {
        data = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        data = { raw };
      }
    }

    if (!response.ok) {
      const nestedError =
        data.error && typeof data.error === "object" && !Array.isArray(data.error)
          ? (data.error as Record<string, unknown>)
          : null;
      const message =
        (typeof nestedError?.message === "string" && nestedError.message) ||
        (typeof data.message === "string" && data.message) ||
        `The n8n lead workflow rejected the request (HTTP ${response.status}).`;
      return jsonError(message, response.status, data);
    }

    const requestId =
      (typeof data.job_id === "string" && data.job_id) ||
      (typeof data.client_request_id === "string" && data.client_request_id) ||
      clientRequestId;

    const status = typeof data.status === "string" ? data.status : "queued";

    return Response.json(
      {
        request: {
          id: requestId,
          status,
          createdAt: new Date().toISOString(),
        },
        dispatched: true,
        detail: "The lead generation workflow accepted the request.",
        workflow: data,
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Could not reach the n8n lead generation workflow.",
      502,
    );
  }
}

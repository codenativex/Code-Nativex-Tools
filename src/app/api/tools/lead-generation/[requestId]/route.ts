type Row = Record<string, unknown>;

const STAGES = [
  ["request", "Request accepted", 0],
  ["discovery", "Business discovery", 10],
  ["website_verification", "Website verification", 30],
  ["intake", "Intake & cleaning", 40],
  ["research_scoring", "Research & scoring", 50],
  ["outreach", "Outreach", 65],
  ["reply_monitoring", "Reply monitoring", 80],
  ["meeting_booking", "Meeting booking", 90],
  ["complete", "Complete", 100],
] as const;

function num(row: Row, key: string, fallback = 0) {
  const value = row[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function str(row: Row, key: string) {
  const value = row[key];
  return typeof value === "string" ? value : "";
}

function object(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Row) : {};
}

async function supabaseRows(path: string): Promise<Row[]> {
  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!baseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");

  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const raw = await response.text();
  if (!response.ok) throw new Error(`Supabase progress query failed (HTTP ${response.status}): ${raw.slice(0, 300)}`);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as Row[]) : [];
}

export async function GET(_request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params;
    const rows = await supabaseRows(
      `lead_discovery_jobs?job_id=eq.${encodeURIComponent(requestId)}&select=*&limit=1`,
    );
    const row = rows[0];
    if (!row) return Response.json({ error: "That lead generation run could not be found." }, { status: 404 });

    const savedPercent = Math.max(0, Math.min(100, num(row, "progress_percent")));
    const rawStatus = str(row, "status") || "queued";
    const nextWorkflow = str(row, "next_workflow");
    const status = rawStatus === "completed" && nextWorkflow ? "running" : rawStatus;
    const currentBackendStage = str(row, "current_stage") || "request_accepted";
    const terminal = ["completed", "needs_review", "failed", "cancelled"].includes(status);

    let activeIndex = 0;
    STAGES.forEach(([, , threshold], index) => {
      if (savedPercent >= threshold) activeIndex = index;
    });
    if (!terminal && activeIndex === STAGES.length - 1) activeIndex = STAGES.length - 2;

    const stages = STAGES.map(([key, label], index) => {
      let stageStatus = "pending";
      if (terminal) {
        if (index < activeIndex) stageStatus = "completed";
        else if (index === activeIndex) stageStatus = status === "failed" ? "failed" : "completed";
        else stageStatus = "skipped";
      } else if (index < activeIndex) stageStatus = "completed";
      else if (index === activeIndex) stageStatus = "active";

      return {
        key,
        label,
        status: stageStatus,
        detail: index === activeIndex ? currentBackendStage.replaceAll("_", " ") : null,
        startedAt: typeof row.requested_at === "string" ? row.requested_at : null,
        completedAt: stageStatus === "completed" && typeof row.completed_at === "string" ? row.completed_at : null,
      };
    });

    const summary = object(row.result_summary);
    const highPotentialLeads = num(row, "high_potential_leads", num(summary, "high_potential_leads", 0));
    const startedAt = str(row, "started_at") || str(row, "requested_at") || null;
    const updatedAt = str(row, "updated_at") || new Date().toISOString();
    const completedAt = str(row, "completed_at") || null;
    const elapsedSeconds = startedAt
      ? Math.max(0, Math.floor((Date.parse(completedAt || new Date().toISOString()) - Date.parse(startedAt)) / 1000))
      : 0;

    return Response.json(
      {
        requestId,
        status,
        percentComplete: savedPercent,
        currentStage: currentBackendStage,
        stages,
        sourcesChecked: Array.isArray(row.sources) ? row.sources.length : 0,
        businessesDiscovered: num(row, "businesses_found"),
        duplicatesRemoved: num(row, "duplicates_removed"),
        invalidContactsRejected: num(row, "rejected_leads"),
        verifiedLeads: num(row, "verified_leads"),
        highPotentialLeads,
        startedAt,
        updatedAt,
        elapsedSeconds,
        errorMessage: str(row, "error_message") || null,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load lead generation progress." },
      { status: 502 },
    );
  }
}

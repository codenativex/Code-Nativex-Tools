type Row = Record<string, unknown>;

function str(row: Row, key: string) {
  const value = row[key];
  return typeof value === "string" ? value : "";
}
function nullable(row: Row, key: string) {
  const value = row[key];
  return typeof value === "string" && value.trim() ? value : null;
}
function num(row: Row, key: string, fallback = 0) {
  const value = row[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}
function strArray(row: Row, key: string) {
  const value = row[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
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
  if (!response.ok) throw new Error(`Supabase leads query failed (HTTP ${response.status}): ${raw.slice(0, 300)}`);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as Row[]) : [];
}

export async function GET(_request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params;
    const rows = await supabaseRows(
      `lead_pipeline?job_id=eq.${encodeURIComponent(requestId)}&select=*&order=qualification_score.desc&limit=100`,
    );

    const items = rows.map((row) => {
      const name = nullable(row, "contact_name");
      const role = nullable(row, "job_title");
      const issues = [nullable(row, "website_condition"), nullable(row, "validation_notes")].filter(
        (value): value is string => Boolean(value),
      );
      const signals = strArray(row, "need_signals");
      const singleSignal = nullable(row, "need_signal");

      return {
        id: str(row, "id"),
        companyName: str(row, "company_name") || "Unnamed business",
        category: str(row, "industry") || "Uncategorized",
        country: str(row, "country"),
        region: nullable(row, "region") ?? nullable(row, "state"),
        city: nullable(row, "city"),
        website: nullable(row, "website"),
        email: nullable(row, "email"),
        phone: nullable(row, "phone"),
        score: num(row, "qualification_score", num(row, "data_quality_score", 0)),
        verificationStatus:
          str(row, "email_validation_status") || str(row, "website_verification_status") || "unverified",
        approvalStatus: str(row, "approval_status") || "pending",
        recommendedService: str(row, "recommended_service") || str(row, "service_interest") || "",
        opportunitySignals: signals.length ? signals : singleSignal ? [singleSignal] : [],
        websiteIssues: issues,
        decisionMaker:
          name || role
            ? {
                name,
                role,
                email: nullable(row, "email"),
                phone: nullable(row, "phone"),
                profileUrl: nullable(row, "contact_source_url"),
              }
            : null,
      };
    });

    return Response.json(
      { items, total: items.length, page: 1, pageSize: 100 },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load lead results." },
      { status: 502 },
    );
  }
}

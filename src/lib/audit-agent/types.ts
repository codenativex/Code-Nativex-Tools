export type AuditStatus = "queued" | "running" | "completed" | "partial" | "failed" | "cancelled" | string;

export interface AuditOptions {
  max_pages: number;
  performance_pages: number;
  lighthouse_runs: number;
  external_links: number;
  cross_browser: boolean;
  firefox: boolean;
  ai_enabled: boolean;
}

export interface AuditSubmission extends AuditOptions {
  url: string;
  company_name?: string;
  client_request_id: string;
}

export interface AuditStatusResponse {
  audit_id: string;
  status: AuditStatus;
  stage?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  request?: Partial<AuditSubmission> | null;
  pages_discovered?: number | null;
  pages_processed?: number | null;
  files?: string[] | null;
  downloads?: Record<string, string> | null;
  error?: string | null;
  [key: string]: unknown;
}

export interface AuditFinding {
  id?: string | null;
  category?: string | null;
  code?: string | null;
  title?: string | null;
  severity?: string | null;
  status?: string | null;
  evidence?: string | null;
  recommendation?: string | null;
  url?: string | null;
  [key: string]: unknown;
}

export interface LighthouseRunResult {
  state?: string | null;
  scores?: {
    performance?: number | null;
    seo?: number | null;
    accessibility?: number | null;
    best_practices?: number | null;
    "best-practices"?: number | null;
    [key: string]: number | null | undefined;
  } | null;
  metrics?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface AuditPageResult {
  url?: string | null;
  final_url?: string | null;
  title?: string | null;
  state?: string | null;
  http_status?: number | null;
  status_code?: number | null;
  findings?: AuditFinding[] | null;
  seo?: Record<string, unknown> | null;
  lighthouse?: {
    mobile?: { runs?: LighthouseRunResult[] | null; selected?: LighthouseRunResult | null; state?: string | null } | null;
    desktop?: { runs?: LighthouseRunResult[] | null; selected?: LighthouseRunResult | null; state?: string | null } | null;
  } | null;
  [key: string]: unknown;
}

export interface AuditReport {
  audit_id?: string | null;
  status?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  start_url?: string | null;
  origin?: string | null;
  request?: Partial<AuditSubmission> | null;
  coverage?: Record<string, unknown> | null;
  pages?: AuditPageResult[] | null;
  findings?: AuditFinding[] | null;
  errors?: unknown[] | null;
  skipped?: unknown[] | null;
  link_checks?: unknown[] | null;
  ai?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export function isTerminalStatus(status: string | undefined): boolean {
  return status === "completed" || status === "partial" || status === "failed" || status === "cancelled";
}

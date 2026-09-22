import "server-only";

const ALLOWED_ARTIFACTS = new Set(["report.pdf", "report.html", "report.json", "audit-evidence.zip", "email-draft.html"]);
const AUDIT_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

function getConfig() {
  const baseUrl = process.env.AUDIT_WORKER_BASE_URL?.trim().replace(/\/+$/, "");
  const token = process.env.AUDIT_WORKER_TOKEN?.trim();

  if (!baseUrl) throw new Error("AUDIT_WORKER_BASE_URL is not configured.");
  if (!/^https?:\/\//i.test(baseUrl)) throw new Error("AUDIT_WORKER_BASE_URL must use http:// or https://.");
  if (!token) throw new Error("AUDIT_WORKER_TOKEN is not configured.");

  return { baseUrl, token };
}

function assertAuditId(value: string) {
  if (!AUDIT_ID_PATTERN.test(value)) throw new Error("Invalid audit id.");
  return value;
}

export function assertArtifactName(value: string) {
  if (!ALLOWED_ARTIFACTS.has(value)) throw new Error("This artifact is not allowed.");
  return value;
}

export async function auditWorkerFetch(path: string, init: RequestInit = {}) {
  const { baseUrl, token } = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 135_000);

  try {
    return await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
      signal: controller.signal,
      redirect: "manual",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function auditWorkerJson<T>(path: string, init: RequestInit = {}): Promise<{ data: T; status: number }> {
  let response: Response;
  try {
    response = await auditWorkerFetch(path, init);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The audit service timed out while responding.");
    }
    throw new Error("The audit service is not reachable. Make sure the audit worker is running.");
  }

  if (!response.ok) {
    let message = `Audit service returned HTTP ${response.status}.`;
    try {
      const payload = (await response.json()) as { error?: unknown; message?: unknown };
      const candidate = payload.message ?? payload.error;
      if (typeof candidate === "string" && candidate.trim()) message = candidate;
    } catch {
      // Keep the generic error.
    }
    throw new Error(message);
  }

  return { data: (await response.json()) as T, status: response.status };
}

export function auditStatusPath(auditId: string) {
  return `/v1/audits/${encodeURIComponent(assertAuditId(auditId))}`;
}

export function auditArtifactPath(auditId: string, filename: string) {
  return `${auditStatusPath(auditId)}/files/${encodeURIComponent(assertArtifactName(filename))}`;
}

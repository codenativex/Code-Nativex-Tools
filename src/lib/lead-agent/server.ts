import "server-only";

function config() {
  const baseUrl = (process.env.LEAD_AGENT_BASE_URL ?? "").replace(/\/$/, "");
  const token = process.env.LEAD_AGENT_TOKEN ?? "";
  if (!baseUrl) throw new Error("LEAD_AGENT_BASE_URL is not configured.");
  if (!token) throw new Error("LEAD_AGENT_TOKEN is not configured.");
  return { baseUrl, token };
}

export async function leadAgentFetch(path: string, init?: RequestInit): Promise<Response> {
  const { baseUrl, token } = config();
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-codenativex-tools-key": token,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function passThrough(response: Response): Promise<Response> {
  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}

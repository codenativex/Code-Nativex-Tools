import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

/** Network-level constraints for outbound audit requests. */
const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_BYTES = 3_000_000;
const USER_AGENT = "CodeNativexAuditAgent/1.0 (+https://codenativex.com)";

/** Hosts that always point back at the machine running the audit. */
const LOOPBACK_HOSTS = new Set(["localhost", "localhost.localdomain", "metadata.google.internal", "[::1]"]);

export class AuditFetchError extends Error {
  constructor(
    message: string,
    readonly code:
      | "invalid_url"
      | "blocked_host"
      | "unreachable"
      | "timeout"
      | "http_error"
      | "not_html"
      | "too_large",
  ) {
    super(message);
    this.name = "AuditFetchError";
  }
}

export interface FetchedPage {
  readonly requestedUrl: string;
  readonly finalUrl: string;
  readonly statusCode: number;
  readonly html: string;
  readonly bytes: number;
  readonly durationMs: number;
}

/** Normalises user input into an http(s) URL, defaulting to https. */
export function normalizeUrl(input: string): URL {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new AuditFetchError("Enter a website URL to audit.", "invalid_url");
  }

  // A non-http scheme is rejected outright; anything else defaults to https.
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed)?.[1]?.toLowerCase();
  if (scheme && scheme !== "http" && scheme !== "https") {
    throw new AuditFetchError("Only http and https URLs can be audited.", "invalid_url");
  }

  const withProtocol = scheme ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new AuditFetchError("That does not look like a valid URL.", "invalid_url");
  }

  if (LOOPBACK_HOSTS.has(url.hostname.toLowerCase())) {
    throw new AuditFetchError("That host cannot be audited.", "blocked_host");
  }
  if (url.hostname.length === 0 || !url.hostname.includes(".")) {
    throw new AuditFetchError("Enter a full domain, for example https://example.com.", "invalid_url");
  }

  url.hash = "";
  return url;
}

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const normalized = address.toLowerCase();
    return (
      normalized === "::1" ||
      normalized === "::" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80") ||
      normalized.startsWith("::ffff:")
    );
  }

  const parts = address.split(".").map(Number);
  const [a = 0, b = 0] = parts;
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

/**
 * Rejects hosts that resolve to loopback, link-local or private ranges so the
 * audit endpoint cannot be used to probe internal infrastructure.
 */
async function assertPublicHost(hostname: string): Promise<void> {
  if (LOOPBACK_HOSTS.has(hostname.toLowerCase())) {
    throw new AuditFetchError("That host cannot be audited.", "blocked_host");
  }

  let addresses: readonly { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    throw new AuditFetchError("We could not resolve that domain. Check the spelling and try again.", "unreachable");
  }

  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new AuditFetchError("That host cannot be audited.", "blocked_host");
  }
}

/** Fetches a public page's HTML with timeout, size and content-type guards. */
export async function fetchPage(rawUrl: string): Promise<FetchedPage> {
  const url = normalizeUrl(rawUrl);
  await assertPublicHost(url.hostname);

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AuditFetchError("The site took too long to respond. Try again in a moment.", "timeout");
    }
    throw new AuditFetchError("We could not reach that website.", "unreachable");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new AuditFetchError(
      `The site responded with HTTP ${response.status}. Audits need a page that loads successfully.`,
      "http_error",
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("html")) {
    throw new AuditFetchError("That URL did not return an HTML page.", "not_html");
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_HTML_BYTES) {
    throw new AuditFetchError("That page is too large to audit.", "too_large");
  }

  return {
    requestedUrl: url.toString(),
    finalUrl: response.url || url.toString(),
    statusCode: response.status,
    html: new TextDecoder("utf-8").decode(buffer),
    bytes: buffer.byteLength,
    durationMs: Date.now() - startedAt,
  };
}

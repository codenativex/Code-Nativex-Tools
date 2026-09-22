/**
 * Lightweight fixed-window limiter.
 *
 * Deliberately in-memory: it protects a single instance from accidental
 * hammering. Swap the store for Redis (or an edge KV) before running multiple
 * instances behind a load balancer.
 */
interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Keeps the map from growing without bound on a long-running instance. */
const PRUNE_THRESHOLD = 5_000;

function pruneExpired(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitOptions {
  readonly limit: number;
  readonly windowMs: number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly retryAfterSeconds: number;
}

export function checkRateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size > PRUNE_THRESHOLD) pruneExpired(now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Best-effort client identity from proxy headers. */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded || request.headers.get("x-real-ip") || "unknown"}`;
}

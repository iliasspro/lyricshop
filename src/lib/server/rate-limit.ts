// Tiny in-memory fixed-window limiter. Good enough for one server instance; use a shared
// store (Redis, Upstash, etc.) when deploying to multiple instances.

const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= limit) return { ok: false, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

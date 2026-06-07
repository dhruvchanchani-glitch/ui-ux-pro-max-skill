// Simple in-memory rate limiter for Edge Functions. PRD NFR-SEC-3
// requires rate limits on every public endpoint to prevent budget
// burn. This implementation buckets by user id (or IP fallback) and is
// good for the demo; for high-traffic production swap in a Redis or
// Upstash store so limits survive function cold-starts.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limitPerWindow: number, windowMs: number): {
  ok: boolean;
  retryAfterMs: number;
} {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (b.count >= limitPerWindow) {
    return { ok: false, retryAfterMs: b.resetAt - now };
  }
  b.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

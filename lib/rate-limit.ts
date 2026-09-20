type Hit = { count: number; resetAt: number };

// In-memory, per server process. Fine for one Node server; on serverless or several
// instances, replace with a shared store such as Upstash Redis.
const store = new Map<string, Hit>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();

  // Keep the map small
  if (store.size > 5000) {
    for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
  }

  const hit = store.get(key);
  if (!hit || hit.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  hit.count += 1;
  if (hit.count > limit) return { ok: false, retryAfter: Math.ceil((hit.resetAt - now) / 1000) };
  return { ok: true, retryAfter: 0 };
}

import type { Payload, TypedUser } from "payload";

type Entry = { expires: number; value: Promise<unknown> };
const caches = new WeakMap<Payload, Map<string, Entry>>();
const TTL = 30_000;

// Private, bounded, per-user server memory. Never caches authentication or edits.
export function adminRead<T>(payload: Payload, user: TypedUser | null | undefined, key: string, read: () => Promise<T>): Promise<T> {
  if (!user) return read();
  let cache = caches.get(payload);
  if (!cache) { cache = new Map(); caches.set(payload, cache); }
  const scopedKey = JSON.stringify([user.collection, user.id, user.role, user.updatedAt, key]);
  const now = Date.now();
  const hit = cache.get(scopedKey);
  if (hit && hit.expires > now) return hit.value as Promise<T>;
  for (const [entryKey, entry] of cache) if (entry.expires <= now) cache.delete(entryKey);
  if (cache.size >= 512) cache.delete(cache.keys().next().value!);
  const value = read();
  const entry = { expires: now + TTL, value };
  cache.set(scopedKey, entry);
  void value.catch(() => { if (cache.get(scopedKey) === entry) cache.delete(scopedKey); });
  return value;
}

export function invalidateAdminReads(payload: Payload) {
  caches.get(payload)?.clear();
}

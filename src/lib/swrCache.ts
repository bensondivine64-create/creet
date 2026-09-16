// Lightweight stale-while-revalidate cache for client-side data fetching.
// Not persisted (in-memory only) — resets on full page reload, which is fine
// since the goal is fast in-session navigation, not cross-session persistence.

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export function getCached<T>(key: string, maxAgeMs: number): T | undefined {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() - entry.fetchedAt > maxAgeMs) return undefined;
  return entry.data;
}

// Returns cached data immediately if present (even if stale), and always
// kicks off a background fetch to refresh it — calling onFresh when new
// data arrives. Deduplicates concurrent calls for the same key.
export function swrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  onFresh: (data: T) => void,
  staleAfterMs = 30_000
): T | undefined {
  const stale = getCached<T>(key, Infinity);

  const existing = inflight.get(key) as Promise<T> | undefined;
  if (!existing) {
    const isFreshEnough = getCached<T>(key, staleAfterMs) !== undefined;
    if (!isFreshEnough) {
      const promise = fetcher()
        .then((data) => {
          cache.set(key, { data, fetchedAt: Date.now() });
          onFresh(data);
          return data;
        })
        .finally(() => {
          inflight.delete(key);
        });
      inflight.set(key, promise);
    }
  }

  return stale;
}

export function invalidateCache(keyPrefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) cache.delete(key);
  }
}

import { Listing } from '@/types/listing';

const cache = new Map<string, Listing[]>();

export function cacheKey(kind: string, search: string) {
  return `${kind}::${search}`;
}

export function getCachedListings(kind: string, search: string): Listing[] | undefined {
  return cache.get(cacheKey(kind, search));
}

export function setCachedListings(kind: string, search: string, listings: Listing[]) {
  cache.set(cacheKey(kind, search), listings);
}

// Call this after a successful post/edit/delete so the next Browse visit
// fetches fresh data instead of showing stale cached results.
export function clearListingsCache() {
  cache.clear();
}

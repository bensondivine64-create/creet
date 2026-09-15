import { PremiumPlan } from '@/lib/payments';

const CACHE_KEY = 'creet_premium_quote_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CachedQuote {
  currency: string;
  amounts: Record<PremiumPlan, number>;
  cachedAt: number;
}

export function readCachedQuote(): CachedQuote | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedQuote;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCachedQuote(currency: string, amounts: Record<PremiumPlan, number>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ currency, amounts, cachedAt: Date.now() }));
  } catch {
    // localStorage unavailable or full — just skip caching, not worth failing over
  }
}

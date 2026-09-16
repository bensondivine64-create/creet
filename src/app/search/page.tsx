'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getListings } from '@/lib/listings';
import { Listing, ListingKind } from '@/types/listing';
import { CATEGORIES } from '@/lib/categories';
import { CATEGORY_GRADIENTS } from '@/lib/categoryColors';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';
import VerifiedBadge from '@/components/VerifiedBadge';
import Avatar from '@/components/Avatar';

type ShopByMode = 'none' | 'category' | 'price' | 'rating';

interface PriceBucket {
  label: string;
  min: number;
  max: number | null;
}

const PRICE_BUCKETS: PriceBucket[] = [
  { label: 'Under ₦10,000', min: 0, max: 10000 },
  { label: '₦10,000 - ₦50,000', min: 10000, max: 50000 },
  { label: '₦50,000 - ₦200,000', min: 50000, max: 200000 },
  { label: '₦200,000+', min: 200000, max: null },
];

const RATING_BUCKETS = [4, 3, 2];

function SearchPageInner() {
  const params = useSearchParams();

  const [tab, setTab] = useState<ListingKind>((params.get('kind') as ListingKind) || 'gig');
  const [query, setQuery] = useState(params.get('search') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [priceBucket, setPriceBucket] = useState<PriceBucket | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [shopByMode, setShopByMode] = useState<ShopByMode>('none');

  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    const timeout = setTimeout(() => {
      getListings({ kind: tab, search: query.trim() || undefined, category: category || undefined })
        .then((res) => { if (!ignore) setResults(res.listings); })
        .catch((err) => { if (!ignore) setError(err instanceof Error ? err.message : 'Could not search'); })
        .finally(() => { if (!ignore) setLoading(false); });
    }, 350);
    return () => { clearTimeout(timeout); ignore = true; };
  }, [tab, query, category]);

  const filtered = useMemo(() => {
    return results.filter((item) => {
      if (priceBucket) {
        if (item.price < priceBucket.min) return false;
        if (priceBucket.max !== null && item.price >= priceBucket.max) return false;
      }
      if (minRating !== null) {
        if (item.rating_count === 0 || item.rating_avg < minRating) return false;
      }
      return true;
    });
  }, [results, priceBucket, minRating]);

  const activeFilters: { label: string; onClear: () => void }[] = [];
  if (category) activeFilters.push({ label: category, onClear: () => setCategory('') });
  if (priceBucket) activeFilters.push({ label: priceBucket.label, onClear: () => setPriceBucket(null) });
  if (minRating !== null) activeFilters.push({ label: `${minRating}★ & up`, onClear: () => setMinRating(null) });

  function toggleShopBy(mode: ShopByMode) {
    setShopByMode((prev) => (prev === mode ? 'none' : mode));
  }

  return (
    <main className="min-h-screen bg-paper pb-20">
      <div className="px-5 pt-5 pb-4">
        <span className="font-display text-xl font-bold tracking-tight text-fg">Search</span>
      </div>

      <div className="px-5">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search freelancers or products..."
            className="w-full rounded-2xl border border-line bg-mist pl-10 pr-4 py-3.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-fg/30 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2 px-5 pt-4 pb-2 overflow-x-auto">
        <button
          onClick={() => setTab('gig')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium active:scale-[0.97] transition-transform ${
            tab === 'gig' ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'
          }`}
        >
          Freelancers
        </button>
        <button
          onClick={() => setTab('product')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium active:scale-[0.97] transition-transform ${
            tab === 'product' ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setTab('request')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium active:scale-[0.97] transition-transform ${
            tab === 'request' ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'
          }`}
        >
          Requests
        </button>
      </div>

      <div className="px-5 pt-2">
        <p className="text-xs text-muted mb-2">Shop by</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['category', 'price', 'rating'] as ShopByMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => toggleShopBy(mode)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                shopByMode === mode ? 'bg-fg text-black' : 'bg-mist border border-line text-muted'
              }`}
            >
              {mode === 'category' ? 'Category' : mode === 'price' ? 'Price' : 'Rating'}
            </button>
          ))}
        </div>

        {shopByMode === 'category' && (
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(category === cat ? '' : cat); setShopByMode('none'); }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                  category === cat ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {shopByMode === 'price' && (
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1">
            {PRICE_BUCKETS.map((b) => (
              <button
                key={b.label}
                onClick={() => { setPriceBucket(priceBucket?.label === b.label ? null : b); setShopByMode('none'); }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                  priceBucket?.label === b.label ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {shopByMode === 'rating' && (
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1">
            {RATING_BUCKETS.map((r) => (
              <button
                key={r}
                onClick={() => { setMinRating(minRating === r ? null : r); setShopByMode('none'); }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium active:scale-[0.97] transition-transform ${
                  minRating === r ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'
                }`}
              >
                {r}★ & up
              </button>
            ))}
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pt-3 pb-1">
            {activeFilters.map((f) => (
              <button
                key={f.label}
                onClick={f.onClear}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-fg/10 text-fg"
              >
                {f.label}
                <span className="text-fg/50">✕</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="px-5 pt-4">
        {loading && (
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-mist border border-line rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-line/20" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-2/3 bg-line/20 rounded" />
                  <div className="h-3 w-1/2 bg-line/20 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <EmptyState icon="search" title="Couldn't search right now" subtitle="Try again." />
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon="search"
            title="No results found"
            subtitle={query ? `Nothing matched "${query}". Try a different search or filter.` : 'Try a different filter, or check back soon.'}
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/listing/${item.id}`}
                className="flex gap-3 bg-mist border border-line rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
              >
                {item.images && item.images.length > 0 ? (
                  <div className="w-28 h-28 shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover"  loading="lazy" decoding="async" />
                  </div>
                ) : (
                  <div
                    className="w-28 h-28 shrink-0 relative flex items-center justify-center p-2"
                    style={{ backgroundImage: CATEGORY_GRADIENTS[item.category] || CATEGORY_GRADIENTS['Other'] }}
                  >
                    <span className="text-white/90 text-[11px] font-semibold text-center leading-tight">{item.category}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0 py-2.5 pr-3 flex flex-col justify-between">
                  <div>
                    {item.rating_count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted mb-1">
                        <span>★</span>
                        <span className="text-fg font-medium">{item.rating_avg.toFixed(1)}</span>
                        <span>({item.rating_count})</span>
                      </div>
                    )}
                    <div className="text-sm font-semibold text-fg leading-snug line-clamp-2">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Avatar avatar={item.seller.avatar} name={item.seller.full_name} size={14} />
                      <span className="text-[11px] text-muted truncate flex items-center gap-0.5">
                        {item.seller.full_name}
                        {item.seller.verified && <VerifiedBadge size={9} />}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted">
                    From <span className="text-sm font-bold text-fg">{item.currency} {item.price.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <SearchPageInner />
    </Suspense>
  );
}

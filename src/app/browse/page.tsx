'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getListings } from '@/lib/listings';
import { Listing, ListingKind } from '@/types/listing';
import { CATEGORIES } from '@/lib/categories';
import BottomNav from '@/components/BottomNav';
import NotificationBell from '@/components/NotificationBell';
import EmptyState from '@/components/EmptyState';
import VerifiedBadge from '@/components/VerifiedBadge';
import Avatar from '@/components/Avatar';

const CATEGORY_GRADIENTS: Record<string, string> = {
  'Web Development': 'linear-gradient(135deg,#2b5876,#4e4376)',
  'Design & Creative': 'linear-gradient(135deg,#7b2ff7,#f107a3)',
  'Writing & Translation': 'linear-gradient(135deg,#3a7bd5,#3a6073)',
  'Marketing': 'linear-gradient(135deg,#ee0979,#ff6a00)',
  'Video & Audio': 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)',
  'Electronics': 'linear-gradient(135deg,#134e5e,#71b280)',
  'Fashion': 'linear-gradient(135deg,#c94b4b,#4b134f)',
  'Home & Living': 'linear-gradient(135deg,#5f2c82,#49a09d)',
  'Business Services': 'linear-gradient(135deg,#232526,#414345)',
  'Other': 'linear-gradient(135deg,#3e3e3e,#1a1a1a)',
};

export default function BrowsePage() {
  const [tab, setTab] = useState<ListingKind>('gig');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getListings({ kind: tab, search: search || undefined, category: category || undefined })
      .then((res) => setListings(res.listings))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load listings'))
      .finally(() => setLoading(false));
  }, [tab, search, category]);

  const featured = useMemo(
    () => [...listings].sort((a, b) => b.rating_avg - a.rating_avg).slice(0, 4),
    [listings]
  );
  const featuredIds = useMemo(() => new Set(featured.map((f) => f.id)), [featured]);
  const rest = useMemo(() => listings.filter((l) => !featuredIds.has(l.id)), [listings, featuredIds]);

  return (
    <main className="min-h-screen bg-paper pb-20">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <span className="font-display text-xl font-bold tracking-tight text-fg">CREET</span>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link
            href="/login"
            className="h-8 w-8 rounded-full bg-mist border border-line flex items-center justify-center text-fg/50 active:scale-95 transition-transform"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" />
            </svg>
          </Link>
        </div>
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
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'gig' ? 'Search services' : 'Search products'}
            className="w-full rounded-2xl border border-line bg-mist pl-10 pr-4 py-3.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
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
      </div>

      <section className="pt-5">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="font-display font-bold text-fg text-lg">Explore categories</h2>
        </div>
        <div className="flex gap-3 px-5 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? '' : cat)}
              style={{ backgroundImage: CATEGORY_GRADIENTS[cat] }}
              className={`relative shrink-0 snap-start w-36 h-24 rounded-2xl overflow-hidden text-left p-3 flex items-end active:scale-[0.96] transition-transform ${
                category === cat ? 'ring-2 ring-white' : ''
              }`}
            >
              <span className="absolute inset-0 bg-black/20" />
              <span className="relative text-sm font-semibold text-white leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {!loading && !error && featured.length > 0 && (
        <section className="pt-7">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="font-display font-bold text-fg text-lg">Featured</h2>
            <span className="text-xs text-muted">Top rated</span>
          </div>
          <div className="flex gap-3 px-5 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {featured.map((item) => (
              <Link
                key={item.id}
                href={`/listing/${item.id}`}
                className="shrink-0 snap-start w-48 bg-mist border border-line rounded-2xl overflow-hidden shadow-lg shadow-black/30 active:scale-[0.97] transition-transform"
              >
                <div className="relative aspect-video bg-line/20 flex items-center justify-center">
                  <svg className="h-6 w-6 text-fg/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h16M4 4h16v16H4V4z" />
                  </svg>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Avatar avatar={item.seller.avatar} name={item.seller.full_name} size={16} />
                    <span className="text-xs text-muted truncate">{item.seller.full_name}</span>
                  </div>
                  <div className="text-sm font-semibold text-fg leading-snug line-clamp-2 mb-1">{item.title}</div>
                  <span className="text-xs text-muted">★ {item.rating_avg.toFixed(1)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-5 pt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-fg text-lg">
            {tab === 'gig' ? 'Popular freelancers' : 'Popular products'}
          </h2>
          {category && (
            <button onClick={() => setCategory('')} className="text-xs text-muted underline">
              Clear filter: {category}
            </button>
          )}
        </div>

        {loading && <p className="text-sm text-muted text-center py-16">Loading...</p>}

        {!loading && error && (
          <EmptyState icon="search" title="Couldn't load listings" subtitle="Check your connection and try again." />
        )}

        {!loading && !error && listings.length === 0 && (
          <EmptyState
            icon="search"
            title={`No ${tab === 'gig' ? 'freelancers' : 'products'} found`}
            subtitle="Try a different search, or check back soon as more people join."
          />
        )}

        {!loading && !error && listings.length > 0 && rest.length === 0 && (
          <p className="text-center text-xs text-muted py-6">
            That&apos;s everything for now — check the Featured row above.
          </p>
        )}

        {!loading && !error && rest.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {rest.map((item) => (
                <div
                  key={item.id}
                  className="bg-mist border border-line rounded-2xl overflow-hidden shadow-lg shadow-black/30"
                >
                  <Link href={`/listing/${item.id}`} className="block active:scale-[0.98] transition-transform">
                    <div className="relative aspect-video bg-line/20 flex items-center justify-center">
                      <svg
                        className="h-7 w-7 text-fg/15"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h16M4 4h16v16H4V4z"
                        />
                      </svg>
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link
                      href={`/u/${item.seller.username}`}
                      className="flex items-center gap-1.5 mb-1.5 active:opacity-70"
                    >
                      <Avatar avatar={item.seller.avatar} name={item.seller.full_name} size={20} />
                      <span className="text-xs text-muted truncate flex items-center gap-0.5">
                        {item.seller.full_name}
                        {item.seller.verified && <VerifiedBadge size={10} />}
                      </span>
                    </Link>
                    <Link href={`/listing/${item.id}`}>
                      <div className="text-sm font-semibold text-fg leading-snug line-clamp-2 mb-1.5">
                        {item.title}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted">
                          ★ {item.rating_avg.toFixed(1)} ({item.rating_count})
                        </span>
                      </div>
                      <div className="text-xs text-muted mt-1.5 pt-1.5 border-t border-line">
                        From{' '}
                        <span className="text-sm font-bold text-fg">
                          {item.currency} {item.price.toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {rest.length < 4 && (
              <p className="text-center text-xs text-muted mt-6">
                More {tab === 'gig' ? 'freelancers' : 'products'} joining soon.
              </p>
            )}
          </>
        )}
      </section>

      <BottomNav />
    </main>
  );
}

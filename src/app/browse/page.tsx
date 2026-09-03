'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getListings } from '@/lib/listings';
import { Listing, ListingKind } from '@/types/listing';
import BottomNav from '@/components/BottomNav';
import NotificationBell from '@/components/NotificationBell';
import EmptyState from '@/components/EmptyState';
import VerifiedBadge from '@/components/VerifiedBadge';

export default function BrowsePage() {
  const [tab, setTab] = useState<ListingKind>('gig');
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getListings({ kind: tab, search: search || undefined })
      .then((res) => setListings(res.listings))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load listings'))
      .finally(() => setLoading(false));
  }, [tab, search]);

  return (
    <main className="min-h-screen bg-paper pb-24 animate-fade-in-up">
      <div className="sticky top-0 z-10 bg-paper/90 backdrop-blur-md border-b border-line">
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <span className="font-display text-xl font-bold tracking-tight text-fg">CREET</span>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link
              href="/profile"
              className="h-8 w-8 rounded-full bg-mist border border-line flex items-center justify-center text-muted active:scale-95 transition-transform"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="px-5 pb-4">
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
              className="w-full rounded-2xl border border-line bg-mist pl-10 pr-9 py-3.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted active:scale-90 transition-transform"
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>

          <div className="relative inline-flex bg-mist border border-line rounded-full p-1">
            <span
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-blue transition-transform duration-300 ease-out"
              style={{ transform: tab === 'gig' ? 'translateX(0%)' : 'translateX(calc(100% + 8px))' }}
            />
            <button
              onClick={() => setTab('gig')}
              className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                tab === 'gig' ? 'text-white' : 'text-muted'
              }`}
            >
              Freelancers
            </button>
            <button
              onClick={() => setTab('product')}
              className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                tab === 'product' ? 'text-white' : 'text-muted'
              }`}
            >
              Products
            </button>
          </div>
        </div>
      </div>

      <section className="px-5 pt-4">
        <h2 className="font-display font-bold text-fg text-lg mb-3">
          {tab === 'gig' ? 'Popular freelancers' : 'Popular products'}
        </h2>

        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-line bg-mist">
                <div className="aspect-video bg-[linear-gradient(90deg,#1A1D24_0%,#242833_50%,#1A1D24_100%)] bg-[length:800px_100%] animate-shimmer" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-[linear-gradient(90deg,#1A1D24_0%,#242833_50%,#1A1D24_100%)] bg-[length:800px_100%] animate-shimmer" />
                  <div className="h-3 w-full rounded bg-[linear-gradient(90deg,#1A1D24_0%,#242833_50%,#1A1D24_100%)] bg-[length:800px_100%] animate-shimmer" />
                  <div className="h-3 w-1/2 rounded bg-[linear-gradient(90deg,#1A1D24_0%,#242833_50%,#1A1D24_100%)] bg-[length:800px_100%] animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <EmptyState
            icon="search"
            title="Couldn't load listings"
            subtitle="Check your connection and try again."
          />
        )}

        {!loading && !error && listings.length === 0 && (
          <EmptyState
            icon="search"
            title={`No ${tab === 'gig' ? 'freelancers' : 'products'} found`}
            subtitle="Try a different search term, or check back soon — new sellers join every day."
          />
        )}

        {!loading && !error && listings.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {listings.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/listing/${item.id}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="block bg-mist border border-line rounded-2xl overflow-hidden shadow-lg shadow-black/30 active:scale-[0.98] transition-transform opacity-0 animate-fade-in-up"
                >
                  <div className="relative aspect-video bg-line/20 flex items-center justify-center overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
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
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Link
                        href={`/u/${item.seller.username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="h-5 w-5 rounded-full bg-blue text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                      >
                        {item.seller.full_name.charAt(0).toUpperCase()}
                      </Link>
                      <Link
                        href={`/u/${item.seller.username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-muted truncate flex items-center gap-0.5 hover:text-fg transition-colors"
                      >
                        {item.seller.full_name}
                        {item.seller.verified && <VerifiedBadge size={10} />}
                      </Link>
                    </div>
                    <div className="text-sm font-semibold text-fg leading-snug line-clamp-2 mb-1.5">
                      {item.title}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted flex items-center gap-0.5">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="#F5B300">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {item.rating_avg.toFixed(1)} ({item.rating_count})
                      </span>
                    </div>
                    <div className="text-xs text-muted mt-1.5 pt-1.5 border-t border-line">
                      From{' '}
                      <span className="text-sm font-bold text-fg">
                        {item.currency} {item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {listings.length < 4 && (
              <p className="text-center text-xs text-muted mt-6">
                That&apos;s everyone right now — more {tab === 'gig' ? 'freelancers' : 'products'} joining soon.
              </p>
            )}
          </>
        )}
      </section>

      <BottomNav />
    </main>
  );
}

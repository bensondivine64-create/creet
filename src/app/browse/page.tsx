'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getListings } from '@/lib/listings';
import { Listing, ListingKind } from '@/types/listing';
import BottomNav from '@/components/BottomNav';
import NotificationBell from '@/components/NotificationBell';
import EmptyState from '@/components/EmptyState';

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
    <main className="min-h-screen bg-paper pb-20">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <span className="font-display text-xl font-bold tracking-tight text-fg">CREET</span>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link
            href="/login"
            className="h-8 w-8 rounded-full bg-mist flex items-center justify-center text-fg/50"
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
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fg/30"
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
            className="w-full rounded-2xl border-0 bg-mist pl-10 pr-4 py-3.5 text-sm text-fg placeholder:text-fg/40 focus:outline-none focus:ring-2 focus:ring-blue transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2 px-5 pt-4 pb-2 overflow-x-auto">
        <button
          onClick={() => setTab('gig')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium active:scale-[0.97] transition-transform ${
            tab === 'gig' ? 'bg-blue text-white' : 'bg-mist text-fg/50'
          }`}
        >
          Freelancers
        </button>
        <button
          onClick={() => setTab('product')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium active:scale-[0.97] transition-transform ${
            tab === 'product' ? 'bg-blue text-white' : 'bg-mist text-fg/50'
          }`}
        >
          Products
        </button>
      </div>

      <section className="px-5 pt-4">
        <h2 className="font-display font-bold text-fg text-lg mb-3">
          {tab === 'gig' ? 'Popular freelancers' : 'Popular products'}
        </h2>

        {loading && <p className="text-sm text-fg/40 text-center py-16">Loading...</p>}

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
            subtitle="Try a different search, or check back soon as more people join."
          />
        )}

        {!loading && !error && listings.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {listings.map((item) => (
                <Link key={item.id} href={`/listing/${item.id}`} className="block active:scale-[0.98] transition-transform">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-mist">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="h-8 w-8 text-fg/15"
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
                    <span className="absolute top-2 right-2 bg-white rounded-full px-2 py-0.5 text-[11px] font-bold text-black">
                      {item.currency} {item.price.toLocaleString()}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2.5 py-2">
                      <div className="text-white text-xs font-semibold line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-white/70 text-[11px] mt-0.5">
                        {item.seller.full_name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {listings.length < 4 && (
              <p className="text-center text-xs text-fg/30 mt-6">
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

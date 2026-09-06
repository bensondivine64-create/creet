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
import AdCarousel from '@/components/AdCarousel';
import { getProfileDirectory, DirectoryProfile } from '@/lib/profile';

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

const CATEGORY_ICON_PATHS: Record<string, string[]> = {
  'Web Development': ['M8 9l-4 3 4 3', 'M16 9l4 3-4 3', 'M13 6l-2 12'],
  'Design & Creative': ['M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z'],
  'Writing & Translation': ['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7', 'M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'],
  'Marketing': ['M3 11l18-5v12L3 13v-2z', 'M11.6 16.8a3 3 0 11-5.8-1.6'],
  'Video & Audio': ['M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14', 'M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'],
  'Electronics': ['M9 3v2', 'M15 3v2', 'M9 19v2', 'M15 19v2', 'M3 9h2', 'M19 9h2', 'M3 15h2', 'M19 15h2', 'M7 7h10v10H7V7z'],
  'Fashion': ['M8 4L4 8l3 3-2 8h14l-2-8 3-3-4-4-3 2h-2L8 4z'],
  'Home & Living': ['M4 11l8-7 8 7', 'M6 9.5V20h12V9.5'],
  'Business Services': ['M3 7h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z', 'M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2'],
  'Other': ['M4 4h6v6H4V4z', 'M14 4h6v6h-6V4z', 'M4 14h6v6H4v-6z', 'M14 14h6v6h-6v-6z'],
};

function CategoryIcon({ cat }: { cat: string }) {
  const paths = CATEGORY_ICON_PATHS[cat] || [];
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.6} className="mb-2 opacity-90">
      {paths.map((d, i) => (
        <path key={i} d={d} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function BrowsePage() {
  const [tab, setTab] = useState<ListingKind>('gig');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [directory, setDirectory] = useState<DirectoryProfile[]>([]);

  useEffect(() => {
    setLoading(true);
    setError('');
    getListings({ kind: tab, search: search || undefined, category: category || undefined })
      .then((res) => setListings(res.listings))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load listings'))
      .finally(() => setLoading(false));
  }, [tab, search, category]);

  useEffect(() => {
    getProfileDirectory(tab === 'gig' ? 'freelancer' : 'vendor', 6)
      .then((res) => setDirectory(res.profiles))
      .catch(() => setDirectory([]));
  }, [tab]);

  const featured = useMemo(
    () => [...listings].sort((a, b) => b.rating_avg - a.rating_avg).slice(0, 4),
    [listings]
  );
  const featuredIds = useMemo(() => new Set(featured.map((f) => f.id)), [featured]);
  const rest = useMemo(() => listings.filter((l) => !featuredIds.has(l.id)), [listings, featuredIds]);

  return (
    <main className="min-h-screen bg-paper pb-40">
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

      <div className="flex gap-2 px-5 pt-4 pb-2 overflow-x-auto pr-5">
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

      <AdCarousel />

      <section className="pt-5">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="font-display font-bold text-fg text-lg">Explore categories</h2>
          <Link href="/search" className="text-xs text-fg underline underline-offset-2">
            See All
          </Link>
        </div>
        <div className="flex gap-3 px-5 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide pr-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? '' : cat)}
              style={{ backgroundImage: CATEGORY_GRADIENTS[cat] }}
              className={`relative shrink-0 snap-start w-36 h-28 rounded-2xl overflow-hidden text-left p-3.5 flex flex-col justify-between active:scale-[0.96] transition-transform ${
                category === cat ? 'ring-2 ring-white' : ''
              }`}
            >
              <span className="absolute inset-0 bg-black/15" />
              <span className="relative">
                <CategoryIcon cat={cat} />
              </span>
              <span className="relative text-sm font-semibold text-white leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {directory.length > 0 && (
        <section className="pt-8">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="font-display font-bold text-fg text-lg">
              {tab === 'gig' ? 'Popular freelancers' : 'Popular vendors'}
            </h2>
            <Link href="/search" className="text-xs text-fg underline underline-offset-2">
              See All
            </Link>
          </div>
          <div className="flex gap-3 px-5 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide pr-5">
            {directory.map((p) => (
              <Link
                key={p.username}
                href={`/u/${p.username}`}
                className="shrink-0 snap-start w-52 bg-mist border border-line rounded-2xl p-3 active:scale-[0.97] transition-transform"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar avatar={p.avatar} name={p.full_name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-fg truncate">{p.full_name}</span>
                      {p.is_verified && <VerifiedBadge size={11} />}
                    </div>
                    {p.location && <span className="text-xs text-muted truncate block">{p.location}</span>}
                  </div>
                </div>
                <p className="text-xs text-muted line-clamp-2">{p.bio || (tab === 'gig' ? 'Freelancer' : 'Vendor')}</p>
                <div className="flex justify-end mt-1">
                  <Chevron />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && !error && featured.length > 0 && (
        <section className="pt-8">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="font-display font-bold text-fg text-lg">Featured</h2>
            <Link href="/search" className="text-xs text-fg underline underline-offset-2">
              See All
            </Link>
          </div>
          <div className="flex gap-3 px-5 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide pr-5">
            {featured.map((item) => (
              <Link
                key={item.id}
                href={`/listing/${item.id}`}
                className="shrink-0 snap-start w-48 bg-mist border border-line rounded-2xl overflow-hidden shadow-lg shadow-black/30 active:scale-[0.97] transition-transform"
              >
                {item.images && item.images.length > 0 && (
                  <div className="relative aspect-video overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                )}
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

      <section className="px-5 pt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-fg text-lg">
            {tab === 'gig' ? 'All gigs' : 'All products'}
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
                    {item.images && item.images.length > 0 && (
                      <div className="relative aspect-video overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                    )}
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

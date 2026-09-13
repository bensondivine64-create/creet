'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
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

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

interface TabOption {
  kind: ListingKind;
  label: string;
}

function tabsForRole(role: string | undefined): TabOption[] {
  if (role === 'freelancer') {
    return [
      { kind: 'request', label: 'Requests' },
      { kind: 'product', label: 'Products' },
    ];
  }
  if (role === 'vendor') {
    return [
      { kind: 'request', label: 'Requests' },
      { kind: 'gig', label: 'Freelancers' },
    ];
  }
  return [
    { kind: 'gig', label: 'Freelancers' },
    { kind: 'product', label: 'Products' },
  ];
}

// The directory ("Popular X") always shows the seller type this viewer would hire/browse,
// never their own competitor type.
function directoryRoleForTab(viewerRole: string | undefined, tab: ListingKind): 'freelancer' | 'vendor' {
  if (viewerRole === 'freelancer') return 'vendor';
  if (viewerRole === 'vendor') return 'freelancer';
  return tab === 'gig' ? 'freelancer' : 'vendor';
}

function kindLabel(kind: ListingKind, plural = true) {
  if (kind === 'gig') return plural ? 'freelancers' : 'freelancer';
  if (kind === 'product') return plural ? 'products' : 'product';
  return plural ? 'requests' : 'request';
}

interface CategoryRow {
  category: string;
  listings: Listing[];
}

function ListingCard({ item }: { item: Listing }) {
  return (
    <Link
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
        {item.rating_count > 0 && (
          <span className="text-xs text-muted">★ {item.rating_avg.toFixed(1)}</span>
        )}
      </div>
    </Link>
  );
}

function ScrollRow({
  title,
  seeAllHref,
  children,
}: {
  title: string;
  seeAllHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-8">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="font-display font-bold text-fg text-lg">{title}</h2>
        <Link href={seeAllHref} className="text-xs text-fg underline underline-offset-2">
          See All
        </Link>
      </div>
      <div className="relative">
        <div className="flex gap-3 px-5 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {children}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-paper to-transparent" />
      </div>
    </section>
  );
}

export default function BrowsePage() {
  const { user } = useAuth();
  const tabs = useMemo(() => tabsForRole(user?.role), [user?.role]);

  const [tab, setTab] = useState<ListingKind>('gig');
  const [hasSetDefault, setHasSetDefault] = useState(false);
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [directory, setDirectory] = useState<DirectoryProfile[]>([]);
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);
  const [categoryRowsLoading, setCategoryRowsLoading] = useState(true);

  // Set the default tab once we know the viewer's role (only on first resolution,
  // so we don't yank the tab out from under someone who already picked one).
  useEffect(() => {
    if (hasSetDefault) return;
    if (user === null) {
      setHasSetDefault(true);
      return;
    }
    if (user) {
      setTab(tabsForRole(user.role)[0].kind);
      setHasSetDefault(true);
    }
  }, [user, hasSetDefault]);

  useEffect(() => {
    if (!hasSetDefault) return;
    let ignore = false;
    setLoading(true);
    setError('');
    getListings({ kind: tab, search: search || undefined })
      .then((res) => { if (!ignore) setListings(res.listings); })
      .catch((err) => { if (!ignore) setError(err instanceof Error ? err.message : 'Could not load listings'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [hasSetDefault, tab, search]);

  useEffect(() => {
    if (!hasSetDefault) return;
    let ignore = false;
    const directoryRole = directoryRoleForTab(user?.role, tab);
    getProfileDirectory(directoryRole, 6)
      .then((res) => { if (!ignore) setDirectory(res.profiles); })
      .catch(() => { if (!ignore) setDirectory([]); });
    return () => { ignore = true; };
  }, [hasSetDefault, tab, user?.role]);

  // One row per category, populated with real listings — only categories that
  // actually have something to show get a row.
  useEffect(() => {
    if (!hasSetDefault) return;
    let ignore = false;
    setCategoryRowsLoading(true);
    Promise.all(
      CATEGORIES.map((cat) =>
        getListings({ kind: tab, category: cat, limit: 6 })
          .then((res) => ({ category: cat, listings: res.listings }))
          .catch(() => ({ category: cat, listings: [] }))
      )
    )
      .then((rows) => {
        if (!ignore) setCategoryRows(rows.filter((r) => r.listings.length > 0));
      })
      .finally(() => { if (!ignore) setCategoryRowsLoading(false); });
    return () => { ignore = true; };
  }, [hasSetDefault, tab]);

  const featured = useMemo(
    () => [...listings].sort((a, b) => b.rating_avg - a.rating_avg).slice(0, 4),
    [listings]
  );
  const featuredIds = useMemo(() => new Set(featured.map((f) => f.id)), [featured]);
  const rest = useMemo(() => listings.filter((l) => !featuredIds.has(l.id)), [listings, featuredIds]);

  const directoryRole = directoryRoleForTab(user?.role, tab);
  const directoryLabel = directoryRole === 'freelancer' ? 'Popular freelancers' : 'Popular vendors';

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
            placeholder={`Search ${kindLabel(tab)}`}
            className="w-full rounded-2xl border border-line bg-mist pl-10 pr-4 py-3.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2 px-5 pt-4 pb-2 overflow-x-auto pr-5">
        {tabs.map((t) => (
          <button
            key={t.kind}
            onClick={() => setTab(t.kind)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium active:scale-[0.97] transition-transform ${
              tab === t.kind ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AdCarousel />

      {!loading && !error && featured.length > 0 && (
        <ScrollRow title="Featured" seeAllHref="/search">
          {featured.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </ScrollRow>
      )}

      {!categoryRowsLoading && categoryRows.map((row) => (
        <ScrollRow
          key={row.category}
          title={row.category}
          seeAllHref={`/search?kind=${tab}&category=${encodeURIComponent(row.category)}`}
        >
          {row.listings.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </ScrollRow>
      ))}

      <section className="px-5 pt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-fg text-lg">
            All {kindLabel(tab)}
          </h2>
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-mist border border-line rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-line/20" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-2/3 bg-line/20 rounded" />
                  <div className="h-3 w-1/2 bg-line/20 rounded" />
                  <div className="h-3 w-1/3 bg-line/20 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <EmptyState icon="search" title="Couldn't load listings" subtitle="Check your connection and try again." />
        )}

        {!loading && !error && listings.length === 0 && (
          <EmptyState
            icon="search"
            title={`No ${kindLabel(tab)} found`}
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
                      {item.rating_count > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted">
                            ★ {item.rating_avg.toFixed(1)} ({item.rating_count})
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-muted mt-1.5 pt-1.5 border-t border-line">
                        {item.kind === 'request' ? 'Budget' : 'From'}{' '}
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
                More {kindLabel(tab)} joining soon.
              </p>
            )}
          </>
        )}
      </section>

      {directory.length > 0 && (
        <ScrollRow title={directoryLabel} seeAllHref="/search">
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
                    {p.verified_badge && <VerifiedBadge size={11} />}
                  </div>
                  {p.location && <span className="text-xs text-muted truncate block">{p.location}</span>}
                </div>
              </div>
              <p className="text-xs text-muted line-clamp-2">{p.bio || (directoryRole === 'freelancer' ? 'Freelancer' : 'Vendor')}</p>
              <div className="flex justify-end mt-1">
                <Chevron />
              </div>
            </Link>
          ))}
        </ScrollRow>
      )}

      <BottomNav />
    </main>
  );
}

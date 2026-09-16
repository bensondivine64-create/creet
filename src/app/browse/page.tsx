'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getListings } from '@/lib/listings';
import { Listing, ListingKind } from '@/types/listing';
import { CATEGORIES } from '@/lib/categories';
import { CATEGORY_GRADIENTS } from '@/lib/categoryColors';
import BottomNav from '@/components/BottomNav';
import NotificationBell from '@/components/NotificationBell';
import EmptyState from '@/components/EmptyState';
import VerifiedBadge from '@/components/VerifiedBadge';
import Avatar from '@/components/Avatar';
import AdCarousel from '@/components/AdCarousel';
import { getProfileDirectory, DirectoryProfile } from '@/lib/profile';
import { getCachedListings, setCachedListings } from '@/lib/listingsCache';

interface TileDef {
  label: string;
  category: string;
  search: string;
  gradient: string;
}

interface ThemeRow {
  title: string;
  kinds: ListingKind[];
  tiles: TileDef[];
}

const THEMES: ThemeRow[] = [
  {
    title: 'Build a website',
    kinds: ['gig'],
    tiles: [
      { label: 'Website Design', category: 'Web Development', search: 'website', gradient: 'linear-gradient(135deg,#7a2e1e,#a8431f)' },
      { label: 'Web App Development', category: 'Web Development', search: 'app', gradient: 'linear-gradient(135deg,#7a1a3a,#a8225a)' },
      { label: 'Bug Fixes & Maintenance', category: 'Web Development', search: 'fix', gradient: 'linear-gradient(135deg,#1e2a3a,#2c3e50)' },
    ],
  },
  {
    title: 'Develop a brand identity',
    kinds: ['gig'],
    tiles: [
      { label: 'Logo Design', category: 'Design & Creative', search: 'logo', gradient: 'linear-gradient(135deg,#3d5c1a,#6a8c2e)' },
      { label: 'Brand Kit', category: 'Design & Creative', search: 'brand', gradient: 'linear-gradient(135deg,#5c3a1a,#8c5a2e)' },
      { label: 'UI/UX Design', category: 'Design & Creative', search: 'UI', gradient: 'linear-gradient(135deg,#3d1e57,#5c2a5c)' },
    ],
  },
  {
    title: 'Get your content written',
    kinds: ['gig'],
    tiles: [
      { label: 'Blog Writing', category: 'Writing & Translation', search: 'blog', gradient: 'linear-gradient(135deg,#1f3a4d,#2c4a4a)' },
      { label: 'Translation', category: 'Writing & Translation', search: 'translat', gradient: 'linear-gradient(135deg,#3a1f4d,#4a2c5a)' },
      { label: 'Product Descriptions', category: 'Writing & Translation', search: 'product', gradient: 'linear-gradient(135deg,#4d3a1f,#5a4a2c)' },
    ],
  },
  {
    title: 'Grow your business',
    kinds: ['gig'],
    tiles: [
      { label: 'Social Media Ads', category: 'Marketing', search: 'ads', gradient: 'linear-gradient(135deg,#5c1a2e,#7a3a1a)' },
      { label: 'SEO & Marketing', category: 'Marketing', search: 'SEO', gradient: 'linear-gradient(135deg,#1a4a3a,#2e6a4a)' },
      { label: 'Email Campaigns', category: 'Marketing', search: 'email', gradient: 'linear-gradient(135deg,#1a3a5c,#2e4a7a)' },
    ],
  },
  {
    title: 'Create video & audio',
    kinds: ['gig'],
    tiles: [
      { label: 'Video Editing', category: 'Video & Audio', search: 'video', gradient: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)' },
      { label: 'Music Production', category: 'Video & Audio', search: 'music', gradient: 'linear-gradient(135deg,#3a1a5c,#5a2e7a)' },
      { label: 'Voiceovers', category: 'Video & Audio', search: 'voice', gradient: 'linear-gradient(135deg,#5c1a1a,#7a2e2e)' },
    ],
  },
  {
    title: 'Shop electronics',
    kinds: ['product'],
    tiles: [
      { label: 'Phones', category: 'Electronics', search: 'phone', gradient: 'linear-gradient(135deg,#0f3d3d,#2d5c4a)' },
      { label: 'Laptops', category: 'Electronics', search: 'laptop', gradient: 'linear-gradient(135deg,#1a3a3a,#2e5a5a)' },
      { label: 'Accessories', category: 'Electronics', search: 'headphone', gradient: 'linear-gradient(135deg,#2a2a4a,#3a3a6a)' },
    ],
  },
  {
    title: 'Shop fashion',
    kinds: ['product'],
    tiles: [
      { label: 'Dresses', category: 'Fashion', search: 'dress', gradient: 'linear-gradient(135deg,#5c2020,#3a1030)' },
      { label: 'Bags', category: 'Fashion', search: 'bag', gradient: 'linear-gradient(135deg,#5c3a1a,#7a4a2e)' },
      { label: 'Custom Tailoring', category: 'Fashion', search: 'tailor', gradient: 'linear-gradient(135deg,#4a1a3a,#6a2e5a)' },
    ],
  },
  {
    title: 'Upgrade your home',
    kinds: ['product'],
    tiles: [
      { label: 'Furniture', category: 'Home & Living', search: 'sofa', gradient: 'linear-gradient(135deg,#3a2050,#1f4a48)' },
      { label: 'Interior Design', category: 'Home & Living', search: 'interior', gradient: 'linear-gradient(135deg,#1a3a2a,#2e5a4a)' },
      { label: 'Home Organization', category: 'Home & Living', search: 'organiz', gradient: 'linear-gradient(135deg,#3a3a1a,#5a5a2e)' },
    ],
  },
  {
    title: 'Business essentials',
    kinds: ['gig', 'product'],
    tiles: [
      { label: 'Bookkeeping', category: 'Business Services', search: 'bookkeep', gradient: 'linear-gradient(135deg,#232526,#414345)' },
      { label: 'Business Plans', category: 'Business Services', search: 'business plan', gradient: 'linear-gradient(135deg,#1a2a4a,#2e3a6a)' },
      { label: 'Office Supplies', category: 'Business Services', search: 'office', gradient: 'linear-gradient(135deg,#3a2a1a,#5a4a2e)' },
    ],
  },
  {
    title: 'Explore more',
    kinds: ['gig', 'product'],
    tiles: [
      { label: 'Virtual Assistant', category: 'Other', search: 'assistant', gradient: 'linear-gradient(135deg,#3e3e3e,#1a1a1a)' },
      { label: 'Research', category: 'Other', search: 'research', gradient: 'linear-gradient(135deg,#2a3a3a,#1a2a2a)' },
      { label: 'Everything Else', category: 'Other', search: '', gradient: 'linear-gradient(135deg,#1a1a1a,#0a0a0a)' },
    ],
  },
];

function BrowseSkeleton() {
  return (
    <main className="min-h-screen bg-paper pb-40 animate-pulse">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="h-6 w-20 bg-line/20 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-line/20" />
          <div className="h-8 w-8 rounded-full bg-line/20" />
        </div>
      </div>
      <div className="px-5">
        <div className="h-12 w-full bg-line/20 rounded-2xl" />
      </div>
      <div className="flex gap-2 px-5 pt-4 pb-2">
        <div className="h-9 w-24 bg-line/20 rounded-full" />
        <div className="h-9 w-24 bg-line/20 rounded-full" />
      </div>
      <div className="pt-8">
        <div className="px-5 mb-3">
          <div className="h-5 w-32 bg-line/20 rounded" />
        </div>
        <div className="flex gap-3 px-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 w-36 shrink-0 bg-line/20 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="px-5 pt-8">
        <div className="h-5 w-28 bg-line/20 rounded mb-3" />
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-line/20 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}

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

function postHrefForRole(role: string | undefined) {
  if (role === 'freelancer') return '/post-gig';
  if (role === 'vendor') return '/post-product';
  if (role === 'buyer') return '/post-request';
  return null;
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
          <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover"  loading="lazy" decoding="async" />
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

function ScrollRow({ title, seeAllHref, children }: { title: string; seeAllHref: string; children: React.ReactNode }) {
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

function ThemeTileRow({ tab, theme }: { tab: ListingKind; theme: ThemeRow }) {
  return (
    <ScrollRow title={theme.title} seeAllHref={`/search?kind=${tab}&category=${encodeURIComponent(theme.tiles[0].category)}`}>
      {theme.tiles.map((tile) => (
        <Link
          key={tile.label}
          href={`/search?kind=${tab}&category=${encodeURIComponent(tile.category)}${tile.search ? `&search=${encodeURIComponent(tile.search)}` : ''}`}
          style={{ backgroundImage: tile.gradient }}
          className="relative shrink-0 snap-start w-36 h-28 rounded-2xl overflow-hidden text-left p-3.5 flex items-end active:scale-[0.96] transition-transform"
        >
          <span className="absolute inset-0 bg-black/20" />
          <span className="relative text-sm font-semibold text-white leading-tight">{tile.label}</span>
        </Link>
      ))}
    </ScrollRow>
  );
}

function PremiumBanner() {
  return (
    <div className="px-5 pt-8">
      <Link
        href="/premium"
        className="block rounded-2xl p-5 active:scale-[0.98] transition-transform"
        style={{ backgroundImage: 'linear-gradient(135deg,#e8b4c8,#d89ab8)' }}
      >
        <h3 className="font-display font-bold text-base text-black/90 mb-1">Get Premium today</h3>
        <p className="text-sm text-black/70 leading-snug mb-2">Stand out with priority placement and a premium badge.</p>
        <span className="text-sm font-semibold text-black/90">Upgrade now →</span>
      </Link>
    </div>
  );
}

function PostCtaBanner({ role }: { role: string | undefined }) {
  const href = postHrefForRole(role);
  if (!href) return null;
  const copy =
    role === 'freelancer'
      ? { title: 'Grow your gigs', body: 'Post a new gig and get discovered by buyers today.', cta: 'Post a gig →' }
      : role === 'vendor'
      ? { title: 'List something new', body: 'Add a product and start reaching more buyers.', cta: 'Post a product →' }
      : { title: "What's new on CREET?", body: 'Post a request and let sellers come to you.', cta: 'Post a request →' };
  return (
    <div className="px-5 pt-8">
      <Link
        href={href}
        className="block rounded-2xl p-5 bg-mist border border-line active:scale-[0.98] transition-transform"
      >
        <h3 className="font-display font-bold text-base text-fg mb-1">{copy.title}</h3>
        <p className="text-sm text-muted leading-snug mb-2">{copy.body}</p>
        <span className="text-sm font-semibold text-fg">{copy.cta}</span>
      </Link>
    </div>
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
    const cached = getCachedListings(tab, search);

    if (cached) {
      // Show cached data immediately, no skeleton — then quietly refresh in the background.
      setListings(cached);
      setLoading(false);
      setError('');
      getListings({ kind: tab, search: search || undefined })
        .then((res) => {
          if (ignore) return;
          setCachedListings(tab, search, res.listings);
          setListings(res.listings);
        })
        .catch(() => {});
    } else {
      setLoading(true);
      setError('');
      getListings({ kind: tab, search: search || undefined })
        .then((res) => {
          if (ignore) return;
          setCachedListings(tab, search, res.listings);
          setListings(res.listings);
        })
        .catch((err) => { if (!ignore) setError(err instanceof Error ? err.message : 'Could not load listings'); })
        .finally(() => { if (!ignore) setLoading(false); });
    }

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

  const featured = useMemo(
    () => [...listings].sort((a, b) => b.rating_avg - a.rating_avg).slice(0, 4),
    [listings]
  );
  const featuredIds = useMemo(() => new Set(featured.map((f) => f.id)), [featured]);
  const rest = useMemo(() => listings.filter((l) => !featuredIds.has(l.id)), [listings, featuredIds]);

  const directoryRole = directoryRoleForTab(user?.role, tab);
  const directoryLabel = directoryRole === 'freelancer' ? 'Popular freelancers' : 'Popular vendors';

  if (!hasSetDefault || loading) {
    return <BrowseSkeleton />;
  }

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

      {tab === 'request' ? (
        <section className="pt-8">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="font-display font-bold text-fg text-lg">Browse by category</h2>
          </div>
          <div className="relative">
            <div className="flex gap-3 px-5 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/search?kind=request&category=${encodeURIComponent(cat)}`}
                  style={{ backgroundImage: THEMES.flatMap((t) => t.tiles).find((t) => t.category === cat)?.gradient || 'linear-gradient(135deg,#2a2a2a,#1a1a1a)' }}
                  className="relative shrink-0 snap-start w-36 h-28 rounded-2xl overflow-hidden text-left p-3.5 flex items-end active:scale-[0.96] transition-transform"
                >
                  <span className="absolute inset-0 bg-black/20" />
                  <span className="relative text-sm font-semibold text-white leading-tight">{cat}</span>
                </Link>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-paper to-transparent" />
          </div>
        </section>
      ) : (
        THEMES.filter((theme) => theme.kinds.includes(tab)).map((theme, i) => (
          <div key={theme.title}>
            <ThemeTileRow tab={tab} theme={theme} />
            {i === 1 && <PremiumBanner />}
            {i === 3 && <PostCtaBanner role={user?.role} />}
          </div>
        ))
      )}

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
                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover"  loading="lazy" decoding="async" />
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

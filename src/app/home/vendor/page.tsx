'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/contexts/useRequireAuth';
import { getFeedListings, getMyListings, deleteListing, markSold } from '@/lib/listings';
import { getProfileDirectory, DirectoryProfile } from '@/lib/profile';
import { Listing } from '@/types/listing';
import { formatRelativeTime } from '@/lib/time';
import BottomNav from '@/components/BottomNav';
import NotificationBell from '@/components/NotificationBell';
import Avatar from '@/components/Avatar';
import VerifiedBadge from '@/components/VerifiedBadge';
import EmptyState from '@/components/EmptyState';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import AdCarousel from '@/components/AdCarousel';

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

function ListingMeta({ item }: { item: Listing }) {
  return (
    <div className="flex items-center gap-2.5 text-[11px] text-muted mt-2">
      {typeof item.comment_count === 'number' && item.comment_count > 0 && (
        <span className="flex items-center gap-1">
          <CommentIcon /> {item.comment_count}
        </span>
      )}
      <span className="ml-auto">{formatRelativeTime(item.created_at)}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-black pb-40 animate-pulse">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 safe-top">
        <div className="h-6 w-20 bg-line/20 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-line/20" />
          <div className="h-8 w-8 rounded-full bg-line/20" />
        </div>
      </div>
      <div className="px-5 pt-4 space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="ripple card-elevated bg-mist border border-line rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded-full bg-line/20" />
              <div className="h-3 w-24 bg-line/20 rounded" />
            </div>
            <div className="h-4 w-3/4 bg-line/20 rounded mb-2" />
            <div className="h-3 w-full bg-line/20 rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}

function ProductsSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 pr-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="shrink-0 w-40 ripple card-elevated bg-mist border border-line rounded-2xl p-4 animate-pulse">
          <div className="h-4 w-full bg-line/20 rounded mb-2" />
          <div className="h-3 w-1/2 bg-line/20 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function VendorHomePage() {
  const { user, loading } = useRequireAuth('vendor');
  const confirmDialog = useConfirm();
  const { showToast } = useToast();

  const [requests, setRequests] = useState<Listing[]>([]);
  const [myProducts, setMyProducts] = useState<Listing[]>([]);
  const [directory, setDirectory] = useState<DirectoryProfile[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getFeedListings('request', 8),
      getMyListings(),
      getProfileDirectory('vendor', 8),
    ])
      .then(([reqRes, mineRes, dirRes]) => {
        setRequests(reqRes.listings);
        setMyProducts(mineRes.listings.slice(0, 4));
        setDirectory(dirRes.profiles.filter((p) => p.username !== user.username));
      })
      .catch(() => {})
      .finally(() => setSectionsLoading(false));
  }, [user]);

  useEffect(() => {
    if (sectionsLoading || !user) return;
    if (myProducts.length > 0) return;
    const key = `creet_nudge_first_product_${user.username}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    showToast('Post your first product to get started!', 'info');
  }, [sectionsLoading, myProducts, user]);

  async function handleDelete(item: Listing) {
    const ok = await confirmDialog({
      title: 'Delete this listing?',
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    setPendingId(item.id);
    try {
      await deleteListing(item.id);
      showToast('Listing deleted', 'success');
      setMyProducts((prev) => prev.filter((l) => l.id !== item.id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete listing', 'error');
    } finally {
      setPendingId(null);
    }
  }

  async function handleMarkSold(item: Listing) {
    setPendingId(item.id);
    try {
      const updated = await markSold(item.id);
      setMyProducts((prev) => prev.map((l) => (l.id === item.id ? { ...l, ...updated } : l)));
      showToast('Marked as sold', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not mark as sold', 'error');
    } finally {
      setPendingId(null);
    }
  }

  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="min-h-screen bg-black pb-40 animate-fade-in-up">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 safe-top">
        <span className="font-display text-xl font-bold tracking-tight text-fg">CREET</span>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link href="/profile" className="h-8 w-8 rounded-full overflow-hidden border border-line active:scale-95 transition-transform">
            <Avatar avatar={user?.avatar} name={user?.full_name} size={32} />
          </Link>
        </div>
      </div>

      <AdCarousel />

      <section className="px-5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-fg text-lg">For you</h2>
          <Link href="/requests" className="text-xs text-fg underline underline-offset-2">See All</Link>
        </div>

        {sectionsLoading && (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="ripple card-elevated bg-mist border border-line rounded-2xl p-5 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-5 rounded-full bg-line/20" />
                  <div className="h-3 w-24 bg-line/20 rounded" />
                </div>
                <div className="h-4 w-3/4 bg-line/20 rounded mb-2" />
                <div className="h-3 w-full bg-line/20 rounded" />
              </div>
            ))}
          </div>
        )}

        {!sectionsLoading && requests.length === 0 && (
          <EmptyState icon="listing" title="No open requests right now" subtitle="Check back soon." />
        )}

        {!sectionsLoading && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((item) => (
              <Link
                key={item.id}
                href={`/listing/${item.id}`}
                className="block ripple card-elevated bg-mist border border-line rounded-2xl p-5 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Avatar avatar={item.seller.avatar} name={item.seller.full_name} size={22} />
                  <span className="text-xs text-muted">{item.seller.full_name}</span>
                  <span className="text-xs text-muted/50">·</span>
                  <span className="text-xs text-muted">{item.category}</span>
                </div>
                <h3 className="font-semibold text-fg text-sm">{item.title}</h3>
                <p className="text-xs text-muted mt-1 line-clamp-2">{item.description}</p>
                <div className="text-sm font-bold text-fg mt-2">
                  Budget: {item.currency} {item.price.toLocaleString()}
                </div>
                <ListingMeta item={item} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 pt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-fg text-lg">Your products</h2>
          <Link href="/post-product" className="text-xs text-fg underline underline-offset-2">Post new</Link>
        </div>

        {sectionsLoading && <ProductsSkeleton />}

        {!sectionsLoading && myProducts.length === 0 && (
          <EmptyState icon="listing" title="No products posted yet" ctaLabel="Post your first product" ctaHref="/post-product" />
        )}

        {!sectionsLoading && myProducts.length > 0 && (
          <div className="flex gap-3 overflow-x-auto snap-x scrollbar-hide pb-1 pr-5">
            {myProducts.map((item) => {
              const isPending = pendingId === item.id;
              return (
                <div key={item.id} className="shrink-0 snap-start w-40">
                  <Link
                    href={`/listing/${item.id}`}
                    className="block ripple card-elevated bg-mist border border-line rounded-2xl p-4 active:scale-[0.97] transition-transform"
                  >
                    <div className="text-sm font-semibold text-fg line-clamp-2 mb-1">{item.title}</div>
                    <div className="text-xs text-muted">{item.currency} {item.price.toLocaleString()}</div>
                    <div className="text-[10px] text-muted mt-1">{formatRelativeTime(item.created_at)}</div>
                  </Link>
                  <div className="flex items-center gap-1.5 mt-1.5 px-0.5 flex-wrap">
                    <Link
                      href={`/listing/${item.id}/edit-product`}
                      className="text-[11px] text-fg/60 underline underline-offset-2"
                    >
                      Edit
                    </Link>
                    <span className="text-fg/20 text-[11px]">·</span>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={isPending}
                      className="text-[11px] text-red-400 underline underline-offset-2 disabled:opacity-50"
                    >
                      {isPending ? 'Working...' : 'Delete'}
                    </button>
                    {item.kind === 'product' && !item.sold_at && (
                      <>
                        <span className="text-fg/20 text-[11px]">·</span>
                        <button
                          onClick={() => handleMarkSold(item)}
                          disabled={isPending}
                          className="text-[11px] text-fg/60 underline underline-offset-2 disabled:opacity-50"
                        >
                          {isPending ? 'Working...' : 'Mark sold'}
                        </button>
                      </>
                    )}
                    {item.kind === 'product' && item.sold_at && (
                      <span className="text-[11px] text-fg/40">Sold</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="px-5 pt-10">
        <h2 className="font-display font-bold text-fg text-lg mb-4">Popular vendors</h2>

        {!sectionsLoading && directory.length === 0 && (
          <p className="text-sm text-muted text-center py-6">No other profiles yet.</p>
        )}

        {!sectionsLoading && directory.length > 0 && (
          <div className="space-y-4">
            {directory.map((p) => (
              <Link
                key={p.username}
                href={`/u/${p.username}`}
                className="flex items-center gap-3 ripple card-elevated bg-mist border border-line rounded-2xl p-4 active:scale-[0.98] transition-transform"
              >
                <Avatar avatar={p.avatar} name={p.full_name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-fg truncate">{p.full_name}</span>
                    {p.verified_badge && <VerifiedBadge size={12} />}
                  </div>
                  {p.bio && <p className="text-xs text-muted line-clamp-1">{p.bio}</p>}
                </div>
                <span className="text-fg/30 shrink-0"><Chevron /></span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}

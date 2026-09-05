'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/contexts/useRequireAuth';
import { getListings, getMyListings, deleteListing } from '@/lib/listings';
import { getProfileDirectory, DirectoryProfile } from '@/lib/profile';
import { Listing } from '@/types/listing';
import BottomNav from '@/components/BottomNav';
import NotificationBell from '@/components/NotificationBell';
import Avatar from '@/components/Avatar';
import VerifiedBadge from '@/components/VerifiedBadge';
import EmptyState from '@/components/EmptyState';

export default function FreelancerHomePage() {
  const { user, loading } = useRequireAuth('freelancer');
  const { logout } = useAuth();

  const [requests, setRequests] = useState<Listing[]>([]);
  const [myGigs, setMyGigs] = useState<Listing[]>([]);
  const [directory, setDirectory] = useState<DirectoryProfile[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getListings({ kind: 'request', limit: 5 }),
      getMyListings(),
      getProfileDirectory('freelancer', 8),
    ])
      .then(([reqRes, mineRes, dirRes]) => {
        setRequests(reqRes.listings);
        setMyGigs(mineRes.listings.slice(0, 4));
        setDirectory(dirRes.profiles.filter((p) => p.username !== user.username));
      })
      .catch(() => {})
      .finally(() => setSectionsLoading(false));
  }, [user]);

  if (loading || !user) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper pb-24 animate-fade-in-up">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <span className="font-display text-xl font-bold tracking-tight text-fg">CREET</span>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={logout} className="text-xs text-muted hover:text-fg transition-colors">Log out</button>
        </div>
      </div>

      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-fg text-lg">Open requests</h2>
          <Link href="/requests" className="text-xs text-muted underline">See all</Link>
        </div>

        {sectionsLoading && <p className="text-sm text-muted py-6 text-center">Loading...</p>}

        {!sectionsLoading && requests.length === 0 && (
          <EmptyState icon="listing" title="No open requests right now" subtitle="Check back soon." />
        )}

        {!sectionsLoading && requests.length > 0 && (
          <div className="space-y-3">
            {requests.map((item) => (
              <Link
                key={item.id}
                href={`/listing/${item.id}`}
                className="block bg-mist border border-line rounded-2xl p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-2 mb-2">
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
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 pt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-fg text-lg">Your gigs</h2>
          <Link href="/post-gig" className="text-xs text-muted underline">Post new</Link>
        </div>

        {!sectionsLoading && myGigs.length === 0 && (
          <EmptyState icon="listing" title="No gigs posted yet" ctaLabel="Post your first gig" ctaHref="/post-gig" />
        )}

        {!sectionsLoading && myGigs.length > 0 && (
          <div className="flex gap-3 overflow-x-auto snap-x scrollbar-hide pb-1">
            {myGigs.map((item) => (
              <div key={item.id} className="shrink-0 snap-start w-40">
                <Link
                  href={`/listing/${item.id}`}
                  className="block bg-mist border border-line rounded-2xl p-3 active:scale-[0.97] transition-transform"
                >
                  <div className="text-sm font-semibold text-fg line-clamp-2 mb-1">{item.title}</div>
                  <div className="text-xs text-muted">{item.currency} {item.price.toLocaleString()}</div>
                </Link>
                <div className="flex items-center gap-1.5 mt-1.5 px-0.5">
                  <Link
                    href={`/listing/${item.id}/edit-gig`}
                    className="text-[11px] text-fg/60 underline underline-offset-2"
                  >
                    Edit
                  </Link>
                  <span className="text-fg/20 text-[11px]">·</span>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this listing?')) return;
                      await deleteListing(item.id);
                      setMyGigs((prev) => prev.filter((l) => l.id !== item.id));
                    }}
                    className="text-[11px] text-red-400 underline underline-offset-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 pt-7">
        <h2 className="font-display font-bold text-fg text-lg mb-3">Popular freelancers</h2>

        {!sectionsLoading && directory.length === 0 && (
          <p className="text-sm text-muted text-center py-6">No other profiles yet.</p>
        )}

        {!sectionsLoading && directory.length > 0 && (
          <div className="space-y-3">
            {directory.map((p) => (
              <Link
                key={p.username}
                href={`/u/${p.username}`}
                className="flex items-center gap-3 bg-mist border border-line rounded-2xl p-3 active:scale-[0.98] transition-transform"
              >
                <Avatar avatar={p.avatar} name={p.full_name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-fg truncate">{p.full_name}</span>
                    {p.is_verified && <VerifiedBadge size={12} />}
                  </div>
                  {p.bio && <p className="text-xs text-muted line-clamp-1">{p.bio}</p>}
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

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/contexts/useRequireAuth';
import { getMyListings, deleteListing, markSold } from '@/lib/listings';
import { Listing } from '@/types/listing';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';

export default function FreelancerDashboard() {
  const { user, loading } = useRequireAuth('freelancer');
  const { logout } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMyListings()
      .then((res) => setListings(res.listings))
      .catch(() => setListings([]))
      .finally(() => setListingsLoading(false));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-fg/40 text-sm font-mono">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-20 animate-fade-in-up">
      <header className="border-b border-line px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-fg">CREET</span>
        <button onClick={logout} className="text-sm text-fg/50 hover:text-blue transition-colors">
          Log out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-fg">Welcome, {user.full_name}</h1>
        <p className="text-fg/50 mt-1 mb-6">Here&apos;s what&apos;s happening on your account.</p>

        {user.is_admin && (
          <Link
            href="/admin"
            className="flex items-center justify-between bg-mist rounded-2xl px-4 py-3.5 mb-3 shadow-lg shadow-black/40 active:scale-[0.98] transition-transform"
          >
            <span className="font-semibold text-fg text-sm">Admin System</span>
            <span className="text-fg/40 text-sm">→</span>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <Link
            href="/post-gig"
            className="bg-blue shadow-lg shadow-black/30 active:scale-[0.98] transition-transform text-black rounded-2xl px-4 py-4"
          >
            <div className="font-semibold text-sm">Post a gig</div>
            <div className="text-xs text-black/60 mt-0.5">Offer a service</div>
          </Link>
          <Link
            href="/requests"
            className="bg-mist shadow-lg shadow-black/40 active:scale-[0.98] transition-transform rounded-2xl px-4 py-4"
          >
            <div className="font-semibold text-fg text-sm">Open requests</div>
            <div className="text-xs text-fg/50 mt-0.5">See what buyers need</div>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-fg">Your gigs</h2>
          <Link href="/browse" className="text-xs text-blue font-medium">
            Browse marketplace →
          </Link>
        </div>

        {listingsLoading && <p className="text-sm text-fg/40 py-8 text-center">Loading...</p>}

        {!listingsLoading && listings.length === 0 && (
          <EmptyState
            icon="listing"
            title="No gigs posted yet"
            subtitle="Post a gig to start getting hired."
            ctaLabel="Post your first gig"
            ctaHref="/post-gig"
          />
        )}

        {!listingsLoading && listings.length > 0 && (
          <div className="space-y-3">
            {listings.map((item, i) => (
              <div key={item.id} style={{ animationDelay: `${i * 60}ms` }} className="opacity-0 animate-fade-in-up">
                <Link
                  href={`/listing/${item.id}`}
                  className="flex items-center gap-3 bg-mist rounded-2xl p-3 shadow-lg shadow-black/40 active:scale-[0.98] transition-transform"
                >
                  {item.images && item.images.length > 0 && (
                    <div className="h-14 w-14 rounded-xl shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-fg truncate">{item.title}</div>
                    <div className="text-sm font-bold text-blue mt-0.5">
                      {item.currency} {item.price.toLocaleString()}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 mt-2 px-1">
                  <Link
                    href={`/listing/${item.id}/edit-gig`}
                    className="text-xs text-fg/60 underline underline-offset-2"
                  >
                    Edit
                  </Link>
                  <span className="text-fg/20 text-xs">·</span>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete this listing?')) return;
                      await deleteListing(item.id);
                      setListings((prev) => prev.filter((l) => l.id !== item.id));
                    }}
                    className="text-xs text-red-400 underline underline-offset-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

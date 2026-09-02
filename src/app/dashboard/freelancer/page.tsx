'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/contexts/useRequireAuth';
import { getMyListings } from '@/lib/listings';
import { Listing } from '@/types/listing';
import BottomNav from '@/components/BottomNav';

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
      <div className="min-h-screen flex items-center justify-center text-ink/40 text-sm font-mono">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pb-20">
      <header className="border-b border-line px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-ink">CREET</span>
        <button onClick={logout} className="text-sm text-ink/50 hover:text-blue transition-colors">
          Log out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-ink">Welcome, {user.full_name}</h1>
        <p className="text-ink/50 mt-1 mb-6">Here&apos;s what&apos;s happening on your account.</p>

        {user.is_admin && (
          <Link
            href="/admin"
            className="block bg-mist border border-line rounded-xl px-4 py-3.5 mb-3 hover:border-ink transition-colors"
          >
            <div className="font-semibold text-ink text-sm">Admin System</div>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link
            href="/post-gig"
            className="bg-blue hover:bg-blue-deep text-white rounded-xl px-4 py-4 transition-colors"
          >
            <div className="font-semibold text-sm">Post a gig</div>
            <div className="text-xs text-white/70 mt-0.5">Offer a service</div>
          </Link>
          <Link
            href="/requests"
            className="border border-line rounded-xl px-4 py-4 hover:border-ink transition-colors"
          >
            <div className="font-semibold text-ink text-sm">Open requests</div>
            <div className="text-xs text-ink/50 mt-0.5">See what buyers need</div>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-ink">Your gigs</h2>
          <Link href="/browse" className="text-xs text-blue font-medium">
            Browse marketplace →
          </Link>
        </div>

        {listingsLoading && <p className="text-sm text-ink/40 py-8 text-center">Loading...</p>}

        {!listingsLoading && listings.length === 0 && (
          <div className="border border-dashed border-line rounded-xl px-4 py-8 text-center">
            <p className="text-sm text-ink/50">You haven&apos;t posted any gigs yet.</p>
            <Link href="/post-gig" className="text-sm text-blue font-medium mt-1 inline-block">
              Post your first gig
            </Link>
          </div>
        )}

        {!listingsLoading && listings.length > 0 && (
          <div className="space-y-3">
            {listings.map((item) => (
              <Link
                key={item.id}
                href={`/listing/${item.id}`}
                className="block border border-line rounded-xl px-4 py-3.5 hover:border-ink transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink truncate">{item.title}</span>
                  <span className="text-sm font-bold text-ink shrink-0 ml-2">
                    {item.currency} {item.price.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

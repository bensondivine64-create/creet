'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/contexts/useRequireAuth';
import { getMyListings } from '@/lib/listings';
import { Listing } from '@/types/listing';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';

export default function VendorDashboard() {
  const { user, loading } = useRequireAuth('vendor');
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
    <div className="min-h-screen bg-paper pb-20">
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

        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link
            href="/post-product"
            className="bg-blue shadow-lg shadow-blue/30 active:scale-[0.98] transition-transform text-white rounded-2xl px-4 py-4"
          >
            <div className="font-semibold text-sm">Post a product</div>
            <div className="text-xs text-white/70 mt-0.5">List for sale</div>
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
          <h2 className="font-display font-semibold text-fg">Your products</h2>
          <Link href="/browse" className="text-xs text-blue font-medium">
            Browse marketplace →
          </Link>
        </div>

        {listingsLoading && <p className="text-sm text-fg/40 py-8 text-center">Loading...</p>}

        {!listingsLoading && listings.length === 0 && (
          <EmptyState
            icon="listing"
            title="No products posted yet"
            subtitle="List a product to start selling."
            ctaLabel="Post your first product"
            ctaHref="/post-product"
          />
        )}

        {!listingsLoading && listings.length > 0 && (
          <div className="space-y-3">
            {listings.map((item) => (
              <Link
                key={item.id}
                href={`/listing/${item.id}`}
                className="flex items-center gap-3 bg-mist rounded-2xl p-3 shadow-lg shadow-black/40 active:scale-[0.98] transition-transform"
              >
                <div className="h-14 w-14 rounded-xl bg-line/40 flex items-center justify-center shrink-0">
                  <svg
                    className="h-6 w-6 text-fg/20"
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
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-fg truncate">{item.title}</div>
                  <div className="text-sm font-bold text-blue mt-0.5">
                    {item.currency} {item.price.toLocaleString()}
                  </div>
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

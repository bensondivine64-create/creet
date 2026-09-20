'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getListings } from '@/lib/listings';
import { Listing } from '@/types/listing';
import { formatRelativeTime } from '@/lib/time';
import { useRequireRole } from '@/contexts/useRequireRole';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/Avatar';

export default function RequestsFeedPage() {
  const { user, loading: authLoading } = useRequireRole(['freelancer', 'vendor']);
  const { logout } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getListings({ kind: 'request' })
      .then((res) => setListings(res.listings))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load requests'))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-fg/40 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-black">
      <header className="border-b border-line/60 px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-fg">CREET</span>
        <button onClick={logout} className="text-sm text-fg/50 hover:text-blue transition-colors">
          Log out
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <h1 className="font-display text-xl font-bold text-fg mb-1">Open requests</h1>
        <p className="text-sm text-fg/50 mb-6">What buyers are looking for right now.</p>

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-mist border border-line rounded-2xl p-4 animate-pulse">
                <div className="h-3 w-24 bg-line/20 rounded mb-3" />
                <div className="h-4 w-3/4 bg-line/20 rounded mb-2" />
                <div className="h-3 w-full bg-line/20 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-fg/40 text-center py-16">Couldn&apos;t load requests right now.</p>
        )}

        {!loading && !error && listings.length === 0 && (
          <p className="text-sm text-fg/40 text-center py-16">No open requests yet.</p>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="space-y-3">
            {listings.map((item) => (
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
                  {item.kind === 'hiring' && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue/15 text-blue ml-auto">
                      Hiring
                    </span>
                  )}
                </div>

                <h2 className="font-display font-semibold text-fg text-base">{item.title}</h2>
                <p className="text-sm text-fg/60 mt-1 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-line/60">
                  <span className="text-sm font-bold text-fg">
                    {item.display_currency ?? item.currency} {(item.display_price ?? item.price).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted">{formatRelativeTime(item.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

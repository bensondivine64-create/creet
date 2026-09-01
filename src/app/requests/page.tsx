'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getListings } from '@/lib/listings';
import { Listing } from '@/types/listing';
import { useRequireRole } from '@/contexts/useRequireRole';
import { useAuth } from '@/contexts/AuthContext';

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
    return <div className="min-h-screen flex items-center justify-center text-ink/40 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line px-5 py-4 flex items-center justify-between">
        <span className="font-display text-lg font-bold tracking-tight text-ink">CREET</span>
        <button onClick={logout} className="text-sm text-ink/50 hover:text-blue transition-colors">
          Log out
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6">
        <h1 className="font-display text-xl font-bold text-ink mb-1">Open requests</h1>
        <p className="text-sm text-ink/50 mb-6">What buyers are looking for right now.</p>

        {loading && <p className="text-sm text-ink/40 text-center py-16">Loading...</p>}

        {!loading && error && (
          <p className="text-sm text-ink/40 text-center py-16">Couldn&apos;t load requests right now.</p>
        )}

        {!loading && !error && listings.length === 0 && (
          <p className="text-sm text-ink/40 text-center py-16">No open requests yet.</p>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="space-y-3">
            {listings.map((item) => (
              <Link
                key={item.id}
                href={`/listing/${item.id}`}
                className="block border border-line rounded-2xl p-4 hover:border-ink transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-7 w-7 rounded-full bg-ink text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {item.seller.full_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs text-ink/50">{item.seller.full_name}</span>
                  <span className="text-xs text-ink/30">·</span>
                  <span className="text-xs text-ink/50">{item.category}</span>
                </div>

                <h2 className="font-display font-semibold text-ink text-base">{item.title}</h2>
                <p className="text-sm text-ink/60 mt-1 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-bold text-ink">
                    Budget: {item.currency} {item.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-blue font-medium">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

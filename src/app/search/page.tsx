'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getListings } from '@/lib/listings';
import { Listing, ListingKind } from '@/types/listing';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';
import VerifiedBadge from '@/components/VerifiedBadge';
import Avatar from '@/components/Avatar';

export default function SearchPage() {
  const [tab, setTab] = useState<ListingKind>('gig');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearched(true);
    setLoading(true);
    setError('');
    const timeout = setTimeout(() => {
      getListings({ kind: tab, search: query.trim() })
        .then((res) => setResults(res.listings))
        .catch((err) => setError(err instanceof Error ? err.message : 'Could not search'))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, tab]);

  return (
    <main className="min-h-screen bg-paper pb-20">
      <div className="px-5 pt-5 pb-4">
        <span className="font-display text-xl font-bold tracking-tight text-fg">Search</span>
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
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search freelancers or products..."
            className="w-full rounded-2xl border border-line bg-mist pl-10 pr-4 py-3.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-fg/30 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2 px-5 pt-4 pb-2">
        <button
          onClick={() => setTab('gig')}
          className={`px-4 py-2 rounded-full text-sm font-medium active:scale-[0.97] transition-transform ${
            tab === 'gig' ? 'bg-blue text-white' : 'bg-mist border border-line text-muted'
          }`}
        >
          Freelancers
        </button>
        <button
          onClick={() => setTab('product')}
          className={`px-4 py-2 rounded-full text-sm font-medium active:scale-[0.97] transition-transform ${
            tab === 'product' ? 'bg-blue text-white' : 'bg-mist border border-line text-muted'
          }`}
        >
          Products
        </button>
      </div>

      <section className="px-5 pt-2">
        {!searched && (
          <EmptyState
            icon="search"
            title="Search CREET"
            subtitle="Find freelancers, services, and products."
          />
        )}

        {searched && loading && (
          <p className="text-sm text-muted text-center py-16">Searching...</p>
        )}

        {searched && !loading && error && (
          <EmptyState icon="search" title="Couldn't search right now" subtitle="Try again." />
        )}

        {searched && !loading && !error && results.length === 0 && (
          <EmptyState
            icon="search"
            title="No results found"
            subtitle={`Nothing matched "${query}". Try a different search.`}
          />
        )}

        {searched && !loading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {results.map((item) => (
              <div
                key={item.id}
                className="bg-mist border border-line rounded-2xl overflow-hidden shadow-lg shadow-black/30"
              >
                <Link href={`/listing/${item.id}`} className="block active:scale-[0.98] transition-transform">
                  <div className="relative aspect-video bg-line/20 flex items-center justify-center">
                    <svg
                      className="h-7 w-7 text-fg/15"
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
                </Link>
                <div className="p-3">
                  <Link href={`/u/${item.seller.username}`} className="flex items-center gap-1.5 mb-1.5 active:opacity-70">
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
                    <div className="text-xs text-muted mt-1.5 pt-1.5 border-t border-line">
                      From <span className="text-sm font-bold text-fg">{item.currency} {item.price.toLocaleString()}</span>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}

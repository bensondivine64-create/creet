'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { searchPeople, PersonResult } from '@/lib/network';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import Avatar from '@/components/Avatar';
import VerifiedBadge from '@/components/VerifiedBadge';
import FollowButton from '@/components/FollowButton';
import EmptyState from '@/components/EmptyState';
import BottomNav from '@/components/BottomNav';

const ROLES = [
  { id: '', label: 'Everyone' },
  { id: 'freelancer', label: 'Freelancers' },
  { id: 'vendor', label: 'Vendors' },
  { id: 'buyer', label: 'Buyers' },
];

function ResultsSkeleton() {
  return (
    <div className="px-5 space-y-2.5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 card-elevated bg-mist border border-line rounded-2xl p-3.5 animate-pulse">
          <div className="h-12 w-12 rounded-full bg-line/20 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-line/20 rounded" />
            <div className="h-2.5 w-48 bg-line/20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PeoplePage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [results, setResults] = useState<PersonResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const reqId = useRef(0);

  useEffect(() => {
    if (!user) return;
    const id = ++reqId.current;
    setLoading(true);
    setError(false);
    const t = setTimeout(() => {
      searchPeople({ q: query.trim(), role })
        .then((res) => { if (id === reqId.current) setResults(res.users); })
        .catch(() => { if (id === reqId.current) setError(true); })
        .finally(() => { if (id === reqId.current) setLoading(false); });
    }, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [user, query, role, attempt]);

  if (authLoading || !user) {
    return (
      <main className="min-h-screen bg-black pb-32">
        <div className="px-5 pt-5 pb-4 safe-top"><div className="h-6 w-32 bg-line/20 rounded animate-pulse" /></div>
        <ResultsSkeleton />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pb-32">
      <div className="flex items-center justify-between px-5 py-4 safe-top">
        <Link href="/connections" className="text-sm text-muted hover:text-fg transition-colors">← Back</Link>
        <span className="font-display text-lg font-bold text-fg">Find people</span>
        <span className="w-10" />
      </div>

      <div className="px-5 pb-3">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, skill, or location"
            aria-label="Search people"
            className="w-full bg-mist border border-line rounded-2xl pl-4 pr-10 py-3.5 text-sm text-fg placeholder:text-fg/30 outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-line/30 flex items-center justify-center text-fg/50 active:scale-90 transition-transform"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`ripple shrink-0 px-4 py-2 rounded-full text-sm font-semibold active:scale-[0.95] transition-transform ${
              role === r.id ? 'bg-blue text-black' : 'bg-mist border border-line text-fg/70'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && <ResultsSkeleton />}

      {!loading && error && (
        <EmptyState icon="search" title="Couldn't load people" subtitle="Check your connection and try again." onRetry={() => setAttempt((a) => a + 1)} />
      )}

      {!loading && !error && results.length === 0 && (
        <EmptyState icon="search" title="No people found" subtitle="Try a different name, skill, or location." />
      )}

      {!loading && !error && results.length > 0 && (
        <div className="px-5 space-y-2.5">
          {results.map((p) => (
            <div key={p.id} className="flex items-center gap-3 card-elevated bg-mist border border-line rounded-2xl p-3.5">
              <Link href={`/u/${p.username}`} className="flex items-center gap-3 flex-1 min-w-0 active:opacity-70">
                <Avatar avatar={p.avatar} name={p.full_name} size={48} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-fg truncate">{p.full_name}</span>
                    {p.verified && <VerifiedBadge size={11} />}
                  </div>
                  <div className="text-xs text-muted truncate capitalize">
                    {p.role}{p.location ? ` · ${p.location}` : ''}
                  </div>
                  {p.short_bio && <p className="text-xs text-fg/60 mt-0.5 line-clamp-1">{p.short_bio}</p>}
                </div>
              </Link>
              {p.verified && <FollowButton userId={p.id} />}
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}

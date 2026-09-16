'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { getMyConnections, getConnectionsFeed, acceptConnection, declineConnection, ConnectionUser } from '@/lib/connections';
import { getCachedConnections, setCachedConnections, clearConnectionsCache } from '@/lib/connectionsCache';
import { Listing } from '@/types/listing';
import { formatRelativeTime } from '@/lib/time';
import Avatar from '@/components/Avatar';
import VerifiedBadge from '@/components/VerifiedBadge';
import BottomNav from '@/components/BottomNav';

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="16.5" cy="9.5" r="2.6" />
      <path strokeLinecap="round" d="M3.5 19c.6-3.2 3-5 5.5-5s4.9 1.8 5.5 5M14.8 14.6c2 .1 4 1.6 4.5 4.4" />
    </svg>
  );
}

function ListingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
      <rect x="3.5" y="6" width="17" height="14" rx="2" />
      <path strokeLinecap="round" d="M8 6V4.5A1.5 1.5 0 019.5 3h5A1.5 1.5 0 0116 4.5V6" />
    </svg>
  );
}

function ConnectionsSkeleton() {
  return (
    <div className="px-5 py-6 space-y-3 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 bg-mist border border-line rounded-2xl p-4">
          <div className="h-11 w-11 rounded-full bg-line/20 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 bg-line/20 rounded" />
            <div className="h-2.5 w-16 bg-line/20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ConnectionsPage() {
  const { user, loading } = useRequireAnyAuth();
  const [connections, setConnections] = useState<ConnectionUser[]>([]);
  const [pending, setPending] = useState<ConnectionUser[]>([]);
  const [feed, setFeed] = useState<Listing[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  function fetchFresh() {
    return Promise.all([getMyConnections(), getConnectionsFeed()]).then(([connRes, feedRes]) => {
      const data = {
        connections: connRes.connections,
        pending: connRes.pending_received,
        feed: feedRes.listings,
      };
      setConnections(data.connections);
      setPending(data.pending);
      setFeed(data.feed);
      setCachedConnections(data);
    });
  }

  useEffect(() => {
    if (!user) return;

    const cached = getCachedConnections();
    if (cached) {
      setConnections(cached.connections);
      setPending(cached.pending);
      setFeed(cached.feed);
      setDataLoading(false);
      fetchFresh().catch(() => {});
    } else {
      setDataLoading(true);
      fetchFresh()
        .catch(() => {})
        .finally(() => setDataLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleAccept(connectionId: number) {
    await acceptConnection(connectionId);
    clearConnectionsCache();
    fetchFresh().catch(() => {});
  }

  async function handleDecline(connectionId: number) {
    await declineConnection(connectionId);
    clearConnectionsCache();
    fetchFresh().catch(() => {});
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-black pb-40">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line/60">
        <Link href="/browse" className="text-sm text-muted hover:text-fg transition-colors">← Back</Link>
        <span className="font-display text-lg font-bold text-fg">Connections</span>
        <span className="w-10" />
      </div>

      {dataLoading ? (
        <ConnectionsSkeleton />
      ) : (
        <div className="px-5 py-6">
          {pending.length > 0 && (
            <section className="mb-8">
              <h2 className="font-display font-bold text-fg text-base mb-3">
                Pending requests <span className="text-muted font-normal">({pending.length})</span>
              </h2>
              <div className="space-y-2.5">
                {pending.map((p) => (
                  <div
                    key={p.connection_id}
                    className="flex items-center gap-3 bg-mist border border-line rounded-2xl p-3.5 shadow-lg shadow-black/30"
                  >
                    <Link href={`/u/${p.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar avatar={p.avatar} name={p.full_name} size={44} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-fg truncate">{p.full_name}</span>
                          {p.verified_badge && <VerifiedBadge size={11} />}
                        </div>
                        <span className="text-xs text-muted capitalize">{p.role}</span>
                      </div>
                    </Link>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleAccept(p.connection_id)}
                        className="text-xs bg-blue text-black font-semibold rounded-full px-3.5 py-2 active:scale-[0.96] transition-transform"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(p.connection_id)}
                        className="text-xs border border-line text-fg/70 rounded-full px-3.5 py-2 active:scale-[0.96] transition-transform"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="font-display font-bold text-fg text-base mb-3">
              Your connections {connections.length > 0 && <span className="text-muted font-normal">({connections.length})</span>}
            </h2>

            {connections.length === 0 && (
              <div className="flex flex-col items-center text-center py-10 px-4">
                <div className="h-14 w-14 rounded-full bg-mist border border-line flex items-center justify-center text-fg/40 mb-4">
                  <PeopleIcon />
                </div>
                <p className="text-sm font-medium text-fg mb-1">No connections yet</p>
                <p className="text-xs text-muted max-w-[240px] leading-relaxed">
                  When you connect with people on CREET, they&apos;ll show up here.
                </p>
              </div>
            )}

            {connections.length > 0 && (
              <div className="space-y-2.5">
                {connections.map((c) => (
                  <Link
                    key={c.connection_id}
                    href={`/u/${c.username}`}
                    className="flex items-center gap-3 bg-mist border border-line rounded-2xl p-3.5 shadow-lg shadow-black/30 active:scale-[0.98] transition-transform"
                  >
                    <Avatar avatar={c.avatar} name={c.full_name} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-fg truncate">{c.full_name}</span>
                        {c.verified_badge && <VerifiedBadge size={11} />}
                      </div>
                      <span className="text-xs text-muted capitalize">{c.role}</span>
                    </div>
                    <span className="text-fg/25 shrink-0"><Chevron /></span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display font-bold text-fg text-base mb-3">From your connections</h2>

            {feed.length === 0 && (
              <div className="flex flex-col items-center text-center py-10 px-4">
                <div className="h-14 w-14 rounded-full bg-mist border border-line flex items-center justify-center text-fg/40 mb-4">
                  <ListingIcon />
                </div>
                <p className="text-sm font-medium text-fg mb-1">Nothing to show yet</p>
                <p className="text-xs text-muted max-w-[240px] leading-relaxed">
                  Connect with people to see the gigs and products they post here.
                </p>
              </div>
            )}

            {feed.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {feed.map((item) => (
                  <Link
                    key={item.id}
                    href={`/listing/${item.id}`}
                    className="block bg-mist border border-line rounded-2xl overflow-hidden shadow-lg shadow-black/30 active:scale-[0.98] transition-transform"
                  >
                    {item.images && item.images.length > 0 && (
                      <div className="aspect-video overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Avatar avatar={item.seller.avatar} name={item.seller.full_name} size={18} />
                        <span className="text-xs text-muted truncate">{item.seller.full_name}</span>
                      </div>
                      <div className="text-sm font-semibold text-fg leading-snug line-clamp-2 mb-1.5">{item.title}</div>
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{item.currency} {item.price.toLocaleString()}</span>
                        <span>{formatRelativeTime(item.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

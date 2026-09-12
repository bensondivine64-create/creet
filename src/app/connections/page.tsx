'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { getMyConnections, getConnectionsFeed, acceptConnection, declineConnection, ConnectionUser } from '@/lib/connections';
import { Listing } from '@/types/listing';
import Avatar from '@/components/Avatar';
import VerifiedBadge from '@/components/VerifiedBadge';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';

export default function ConnectionsPage() {
  const { user, loading } = useRequireAnyAuth();
  const [connections, setConnections] = useState<ConnectionUser[]>([]);
  const [pending, setPending] = useState<ConnectionUser[]>([]);
  const [feed, setFeed] = useState<Listing[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  function load() {
    setDataLoading(true);
    Promise.all([getMyConnections(), getConnectionsFeed()])
      .then(([connRes, feedRes]) => {
        setConnections(connRes.connections);
        setPending(connRes.pending_received);
        setFeed(feedRes.listings);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleAccept(connectionId: number) {
    await acceptConnection(connectionId);
    load();
  }

  async function handleDecline(connectionId: number) {
    await declineConnection(connectionId);
    load();
  }

  if (loading || !user) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper pb-40">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/browse" className="text-sm text-muted hover:text-fg transition-colors">← Back</Link>
        <span className="font-display text-lg font-bold text-fg">Connections</span>
        <span className="w-10" />
      </div>

      <div className="px-5 py-5">
        {dataLoading && <p className="text-sm text-muted text-center py-10">Loading...</p>}

        {!dataLoading && pending.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display font-bold text-fg text-lg mb-3">Pending requests</h2>
            <div className="space-y-3">
              {pending.map((p) => (
                <div key={p.connection_id} className="flex items-center gap-3 bg-mist border border-line rounded-2xl p-3">
                  <Link href={`/u/${p.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar avatar={p.avatar} name={p.full_name} size={40} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-fg truncate">{p.full_name}</span>
                        {p.is_verified && <VerifiedBadge size={11} />}
                      </div>
                      <span className="text-xs text-muted capitalize">{p.role}</span>
                    </div>
                  </Link>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleAccept(p.connection_id)} className="text-xs bg-blue text-black font-semibold rounded-full px-3 py-1.5">Accept</button>
                    <button onClick={() => handleDecline(p.connection_id)} className="text-xs bg-paper border border-line text-fg rounded-full px-3 py-1.5">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!dataLoading && (
          <section className="mb-8">
            <h2 className="font-display font-bold text-fg text-lg mb-3">
              Your connections {connections.length > 0 && `(${connections.length})`}
            </h2>
            {connections.length === 0 && (
              <EmptyState icon="search" title="No connections yet" subtitle="Connect with people you meet on CREET." />
            )}
            {connections.length > 0 && (
              <div className="space-y-3">
                {connections.map((c) => (
                  <Link key={c.connection_id} href={`/u/${c.username}`} className="flex items-center gap-3 bg-mist border border-line rounded-2xl p-3 active:scale-[0.98] transition-transform">
                    <Avatar avatar={c.avatar} name={c.full_name} size={40} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-fg truncate">{c.full_name}</span>
                        {c.is_verified && <VerifiedBadge size={11} />}
                      </div>
                      <span className="text-xs text-muted capitalize">{c.role}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {!dataLoading && (
          <section>
            <h2 className="font-display font-bold text-fg text-lg mb-3">From your connections</h2>
            {feed.length === 0 && (
              <p className="text-sm text-muted text-center py-6">
                Nothing to show yet — connect with people to see their listings here.
              </p>
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
                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Avatar avatar={item.seller.avatar} name={item.seller.full_name} size={18} />
                        <span className="text-xs text-muted truncate">{item.seller.full_name}</span>
                      </div>
                      <div className="text-sm font-semibold text-fg leading-snug line-clamp-2 mb-1">{item.title}</div>
                      <div className="text-xs text-muted">
                        {item.currency} {item.price.toLocaleString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

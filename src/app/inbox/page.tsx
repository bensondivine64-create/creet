'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getConversations } from '@/lib/messages';
import { Conversation } from '@/types/message';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';
import VerifiedBadge from '@/components/VerifiedBadge';
import PageLoader from '@/components/PageLoader';

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export default function InboxPage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 30;

  useEffect(() => {
    if (!user) return;
    getConversations({ limit: PAGE_SIZE, offset: 0 })
      .then((res) => { setConversations(res.conversations); setTotal(res.total); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load inbox'))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const res = await getConversations({ limit: PAGE_SIZE, offset: conversations.length });
      setConversations((prev) => [...prev, ...res.conversations]);
      setTotal(res.total);
    } catch {
      // silent — the button just stays available to retry
    } finally {
      setLoadingMore(false);
    }
  }

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread_count, 0),
    [conversations]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.trim().toLowerCase();
    return conversations.filter(
      (c) =>
        c.participant.full_name.toLowerCase().includes(q) ||
        c.last_message.toLowerCase().includes(q) ||
        (c.listing_title ?? '').toLowerCase().includes(q)
    );
  }, [conversations, query]);

  if (authLoading || !user) {
    return <PageLoader />;
  }

  return (
    <main className="min-h-screen bg-paper pb-20 animate-fade-in-up">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-fg">Inbox</span>
          {totalUnread > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-green-500 text-white text-[11px] font-bold flex items-center justify-center">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </div>
      </div>

      {!loading && !error && conversations.length > 0 && (
        <div className="px-5 pb-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8B98A5"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages"
              className="w-full bg-mist rounded-xl pl-9 pr-3 py-3 text-sm text-fg placeholder:text-fg/30 outline-none focus:ring-1 focus:ring-fg/30"
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="px-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-line animate-pulse">
              <div className="h-14 w-14 rounded-full bg-mist shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 bg-mist rounded" />
                <div className="h-2.5 w-2/3 bg-mist rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon="inbox"
          title="Couldn't load your inbox"
          subtitle="Check your connection and try again."
        />
      )}

      {!loading && !error && conversations.length === 0 && (
        <EmptyState
          icon="inbox"
          title="No conversations yet"
          subtitle="When you message a seller or someone reaches out, it'll show up here."
          ctaLabel="Browse the marketplace"
          ctaHref="/browse"
        />
      )}

      {!loading && !error && conversations.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-fg/40 text-center py-16">No conversations match &ldquo;{query}&rdquo;</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="px-5">
          {filtered.map((c, i) => {
            const unread = c.unread_count > 0;
            return (
              <Link
                key={c.id}
                href={`/inbox/${c.id}`}
                style={{ animationDelay: `${i * 40}ms` }}
                className="flex items-center gap-3 py-3 border-b border-line active:bg-mist/60 transition-colors opacity-0 animate-fade-in-up"
              >
                {c.participant.avatar ? (
                  <img
                    src={c.participant.avatar}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="h-14 w-14 rounded-full bg-fg text-black text-lg font-bold flex items-center justify-center shrink-0">
                    {c.participant.full_name.charAt(0).toUpperCase()}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className={`text-sm truncate ${unread ? 'font-semibold text-fg' : 'font-medium text-fg/80'}`}>
                      {c.participant.full_name}
                    </span>
                    {c.participant.verified && <VerifiedBadge size={12} />}
                  </div>

                  {c.listing_title && (
                    <span className="inline-block mt-0.5 text-[10px] text-fg/50 truncate max-w-full">
                      Re: {c.listing_title}
                    </span>
                  )}

                  <div className={`text-sm truncate mt-0.5 ${unread ? 'text-fg/80 font-medium' : 'text-fg/40'}`}>
                    {c.last_message}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[11px] ${unread ? 'text-green-500 font-medium' : 'text-fg/30'}`}>
                    {formatRelativeTime(c.last_message_at)}
                  </span>
                  {unread && (
                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-green-500 text-white text-[11px] font-bold flex items-center justify-center">
                      {c.unread_count > 99 ? '99+' : c.unread_count}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {!query && conversations.length < total && (
            <div className="py-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="text-sm text-fg font-medium underline underline-offset-2 disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getConversations } from '@/lib/messages';
import { Conversation } from '@/types/message';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';
import VerifiedBadge from '@/components/VerifiedBadge';

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

  useEffect(() => {
    if (!user) return;
    getConversations()
      .then((res) => setConversations(res.conversations))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load inbox'))
      .finally(() => setLoading(false));
  }, [user]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unread_count > 0 ? 1 : 0), 0),
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
    return <div className="min-h-screen flex items-center justify-center text-fg/40 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper pb-20 animate-fade-in-up">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-fg">Inbox</span>
          {totalUnread > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-blue text-black text-[11px] font-bold flex items-center justify-center">
              {totalUnread}
            </span>
          )}
        </div>
      </div>

      {!loading && !error && conversations.length > 0 && (
        <div className="px-5 pb-3">
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
              className="w-full bg-mist rounded-xl pl-9 pr-3 py-2.5 text-sm text-fg placeholder:text-fg/30 outline-none focus:ring-1 focus:ring-blue/50"
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="px-5 space-y-3 pt-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 bg-mist rounded-2xl px-4 py-3.5 animate-pulse">
              <div className="h-12 w-12 rounded-full bg-fg/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 bg-fg/10 rounded" />
                <div className="h-2.5 w-2/3 bg-fg/10 rounded" />
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
        <div className="px-5 space-y-2.5">
          {filtered.map((c, i) => {
            const unread = c.unread_count > 0;
            return (
              <Link
                key={c.id}
                href={`/inbox/${c.id}`}
                style={{ animationDelay: `${i * 50}ms` }}
                className={`relative flex items-center gap-3 rounded-2xl pl-4 pr-4 py-3.5 shadow-lg shadow-black/40 active:scale-[0.98] transition-transform opacity-0 animate-fade-in-up ${
                  unread ? 'bg-mist' : 'bg-mist/60'
                }`}
              >
                {unread && (
                  <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-blue" />
                )}

                {c.participant.avatar ? (
                  <img
                    src={c.participant.avatar}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="h-12 w-12 rounded-full bg-blue text-black text-base font-bold flex items-center justify-center shrink-0">
                    {c.participant.full_name.charAt(0).toUpperCase()}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm truncate flex items-center gap-1 ${
                        unread ? 'font-semibold text-fg' : 'font-medium text-fg/80'
                      }`}
                    >
                      {c.participant.full_name}
                      {c.participant.verified && <VerifiedBadge size={12} />}
                    </span>
                    <span className={`text-[11px] shrink-0 ${unread ? 'text-fg/70' : 'text-fg/30'}`}>
                      {formatRelativeTime(c.last_message_at)}
                    </span>
                  </div>

                  {c.listing_title && (
                    <span className="inline-block mt-1 text-[10px] text-fg/50 bg-paper rounded-full px-2 py-0.5 truncate max-w-full">
                      {c.listing_title}
                    </span>
                  )}

                  <div
                    className={`text-sm truncate mt-1 ${
                      unread ? 'text-fg/80 font-medium' : 'text-fg/40'
                    }`}
                  >
                    {c.last_message}
                  </div>
                </div>

                {unread && (
                  <span className="h-2 w-2 rounded-full bg-blue shrink-0 self-start mt-1" />
                )}
              </Link>
            );
          })}
        </div>
      )}

      <BottomNav />
    </main>
  );
}

'use client';
// inbox-v2

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getConversations } from '@/lib/messages';
import { Conversation } from '@/types/message';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';
import VerifiedBadge from '@/components/VerifiedBadge';
import Avatar from '@/components/Avatar';
import PageLoader from '@/components/PageLoader';

const PAGE_SIZE = 30;

// The API sends timestamps without a timezone; they are UTC.
function parseUtc(iso: string): number {
  const hasZone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso);
  return new Date(hasZone ? iso : iso + 'Z').getTime();
}

function formatTime(iso: string): string {
  const t = parseUtc(iso);
  if (Number.isNaN(t)) return '';
  const diffMin = Math.max(0, Math.floor((Date.now() - t) / 60000));
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const d = new Date(t);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function mergeConvs(prev: Conversation[], fresh: Conversation[]): Conversation[] {
  const map = new Map<number, Conversation>(prev.map((c) => [c.id, c]));
  fresh.forEach((c) => map.set(c.id, c));
  return Array.from(map.values()).sort((a, b) => parseUtc(b.last_message_at) - parseUtc(a.last_message_at));
}

function isPhotoMessage(text: string) {
  return text.trim().toLowerCase() === '📷 photo';
}

function InboxSkeleton() {
  return (
    <div className="px-5 space-y-2.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-mist animate-pulse">
          <div className="h-14 w-14 rounded-full bg-line/20 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 bg-line/20 rounded" />
            <div className="h-2.5 w-2/3 bg-line/20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InboxPage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (silent: boolean) => {
    if (!silent) {
      setLoading(true);
      setError(false);
    }
    try {
      const res = await getConversations({ limit: PAGE_SIZE, offset: 0 });
      setConversations((prev) => mergeConvs(silent ? prev : [], res.conversations));
      setTotal(res.total);
    } catch {
      if (!silent) setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load(false);
  }, [user, load]);

  // Live updates: this replaces message notifications
  useEffect(() => {
    if (!user) return;
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') load(true);
    };
    const t = setInterval(refreshIfVisible, 30000);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [user, load]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const res = await getConversations({ limit: PAGE_SIZE, offset: conversations.length });
      setConversations((prev) => mergeConvs(prev, res.conversations));
      setTotal(res.total);
    } catch {
      // button stays available to retry
    } finally {
      setLoadingMore(false);
    }
  }

  const totalUnread = useMemo(() => conversations.reduce((sum, c) => sum + c.unread_count, 0), [conversations]);
  const online = useMemo(() => conversations.filter((c) => c.participant.is_online).slice(0, 12), [conversations]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === 'unread' && c.unread_count === 0) return false;
      if (!q) return true;
      return (
        c.participant.full_name.toLowerCase().includes(q) ||
        c.participant.username.toLowerCase().includes(q) ||
        c.last_message.toLowerCase().includes(q) ||
        (c.listing_title ?? '').toLowerCase().includes(q)
      );
    });
  }, [conversations, query, filter]);

  if (authLoading || !user) return <PageLoader />;

  const hasConversations = conversations.length > 0;

  return (
    <main className="min-h-screen bg-paper pb-32">
      <div className="px-5 pt-5 pb-3 safe-top">
        <h1 className="font-display text-2xl font-bold text-fg">Inbox</h1>
        {!loading && !error && hasConversations && (
          <p className="text-xs text-muted mt-0.5">{totalUnread > 0 ? `${totalUnread} unread` : 'All caught up'}</p>
        )}
      </div>

      {!loading && !error && hasConversations && (
        <>
          <div className="px-5 pb-3">
            <div className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
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
                placeholder="Search conversations"
                aria-label="Search conversations"
                className="w-full bg-mist border border-line rounded-2xl pl-10 pr-10 py-3.5 text-sm text-fg placeholder:text-fg/30 outline-none focus:ring-2 focus:ring-white/20 transition-all"
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

          <div className="flex gap-2 px-5 pb-3">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`ripple px-4 py-2 rounded-full text-sm font-semibold active:scale-[0.95] transition-transform ${
                  filter === f ? 'bg-blue text-black' : 'bg-mist border border-line text-fg/70'
                }`}
              >
                {f === 'all' ? 'All' : `Unread${totalUnread > 0 ? ` (${totalUnread})` : ''}`}
              </button>
            ))}
          </div>

          {online.length > 0 && !query && filter === 'all' && (
            <div className="pb-3">
              <p className="px-5 text-xs font-semibold text-muted uppercase tracking-wide mb-2">Online now</p>
              <div className="flex gap-4 overflow-x-auto px-5 pb-1 scrollbar-hide">
                {online.map((c) => (
                  <Link
                    key={c.id}
                    href={`/inbox/${c.id}`}
                    className="shrink-0 w-14 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <span className="relative">
                      <Avatar avatar={c.participant.avatar} name={c.participant.full_name} size={52} />
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-paper" />
                    </span>
                    <span className="text-[11px] text-fg/70 truncate w-full text-center">
                      {c.participant.full_name.split(' ')[0]}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {loading && <InboxSkeleton />}

      {!loading && error && (
        <EmptyState
          icon="inbox"
          title="Couldn't load your inbox"
          subtitle="Check your connection and try again."
          onRetry={() => load(false)}
        />
      )}

      {!loading && !error && !hasConversations && (
        <EmptyState
          icon="inbox"
          title="No conversations yet"
          subtitle="When you message a seller or someone reaches out, it'll show up here."
          ctaLabel="Browse the marketplace"
          ctaHref="/browse"
        />
      )}

      {!loading && !error && hasConversations && visible.length === 0 && (
        <div className="text-center py-14 px-6">
          <p className="text-sm text-fg/50 mb-3">
            {query ? `No conversations match "${query}"` : 'No unread messages'}
          </p>
          <button
            onClick={() => {
              setQuery('');
              setFilter('all');
            }}
            className="ripple text-sm text-fg font-medium underline underline-offset-2"
          >
            Show all conversations
          </button>
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="px-5 space-y-2">
          {visible.map((c, i) => {
            const unread = c.unread_count > 0;
            const photo = isPhotoMessage(c.last_message);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(i, 8) * 0.025 }}
              >
                <Link
                  href={`/inbox/${c.id}`}
                  className={`ripple flex items-center gap-3 p-3.5 rounded-2xl transition-colors active:scale-[0.99] ${
                    unread ? 'bg-mist border border-line card-elevated' : 'border border-transparent active:bg-mist/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar avatar={c.participant.avatar} name={c.participant.full_name} size={56} />
                    {c.participant.is_online && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-paper" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className={`text-sm truncate ${unread ? 'font-semibold text-fg' : 'font-medium text-fg/80'}`}>
                        {c.participant.full_name}
                      </span>
                      {c.participant.verified && <VerifiedBadge size={12} />}
                    </div>

                    {c.listing_title && (
                      <span className="block mt-0.5 text-[10px] text-fg/45 truncate">Re: {c.listing_title}</span>
                    )}

                    <div className={`flex items-center gap-1 text-sm mt-0.5 ${unread ? 'text-fg/90 font-medium' : 'text-fg/45'}`}>
                      {photo && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="shrink-0">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <circle cx="8.5" cy="10.5" r="1.5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 19" />
                        </svg>
                      )}
                      <span className="truncate">{photo ? 'Photo' : c.last_message}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-[11px] ${unread ? 'text-fg font-semibold' : 'text-fg/35'}`}>
                      {formatTime(c.last_message_at)}
                    </span>
                    {unread && (
                      <span className="h-5 min-w-5 px-1.5 rounded-full bg-blue text-black text-[11px] font-bold flex items-center justify-center">
                        {c.unread_count > 99 ? '99+' : c.unread_count}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {!query && filter === 'all' && conversations.length < total && (
            <div className="py-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="ripple card-elevated bg-mist border border-line text-fg text-sm font-semibold rounded-full px-6 py-2.5 active:scale-[0.96] transition-transform disabled:opacity-60"
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

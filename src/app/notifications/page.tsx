'use client';
// notif-v2

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import EmptyState from '@/components/EmptyState';
import Avatar from '@/components/Avatar';
import VerifiedBadge from '@/components/VerifiedBadge';
import FollowButton from '@/components/FollowButton';
import PageLoader from '@/components/PageLoader';
import BottomNav from '@/components/BottomNav';
import { formatRelativeTime } from '@/lib/time';

type Actor = { id?: number; username: string; full_name: string; avatar?: string | null; verified?: boolean };
type Kind = 'follow' | 'like' | 'comment' | 'other';

function kindOf(title: string): Kind {
  const t = title.toLowerCase();
  if (t.includes('follow')) return 'follow';
  if (/\blikes?\b/.test(t)) return 'like';
  if (t.includes('comment')) return 'comment';
  return 'other';
}

function dayKey(iso: string): 'Today' | 'Yesterday' | 'Earlier' {
  const hasZone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso);
  const t = new Date(hasZone ? iso : iso + 'Z').getTime();
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (t >= startToday) return 'Today';
  if (t >= startToday - 86400000) return 'Yesterday';
  return 'Earlier';
}

function describe(body: string, actor: Actor | null, kind: Kind): { action: string; snippet: string | null } {
  let rest = body || '';
  if (actor) {
    for (const prefix of [`${actor.full_name}: `, `${actor.full_name} `]) {
      if (rest.startsWith(prefix)) {
        rest = rest.slice(prefix.length);
        break;
      }
    }
  }
  if (kind === 'like' || kind === 'comment') {
    const i = rest.indexOf(': ');
    if (i !== -1) {
      return { action: rest.slice(0, i), snippet: rest.slice(i + 2).replace(/^"|"$/g, '') };
    }
  }
  return { action: rest, snippet: null };
}

function KindBadge({ kind }: { kind: Kind }) {
  const base = 'absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-black flex items-center justify-center';
  if (kind === 'like') {
    return (
      <span className={`${base} bg-red-500 text-white`}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21s-6.7-4.35-9.3-8.1C.9 9.9 2 6 5.6 5.1c2-.5 3.9.4 5 2 .8-1.1 2.9-2.5 5-2 3.6.9 4.7 4.8 2.9 7.8C18.7 16.65 12 21 12 21z" />
        </svg>
      </span>
    );
  }
  if (kind === 'follow') {
    return (
      <span className={`${base} bg-fg text-black`}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${base} bg-neutral-600 text-white`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8A8.5 8.5 0 018.7 3.9a8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8v.5z" />
      </svg>
    </span>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const { notifications, loading, loaded, refresh, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loadError, setLoadError] = useState(false);

  function load() {
    setLoadError(false);
    Promise.resolve(refresh()).catch(() => setLoadError(true));
  }

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const visible = useMemo(() => notifications.filter((n) => n.title !== 'New message'), [notifications]);
  const unreadCount = visible.filter((n) => !n.read).length;
  const shown = filter === 'unread' ? visible.filter((n) => !n.read) : visible;

  const groups = useMemo(() => {
    const order = ['Today', 'Yesterday', 'Earlier'] as const;
    return order
      .map((label) => ({ label, items: shown.filter((n) => dayKey(n.created_at) === label) }))
      .filter((g) => g.items.length > 0);
  }, [shown]);

  if (authLoading) return <PageLoader />;

  const showSkeleton = loading && !loaded && !loadError;

  return (
    <main className="min-h-screen bg-black pb-28">
      <div className="flex items-center justify-between px-5 py-4 safe-top">
        <Link href="/browse" className="text-sm text-fg/50 hover:text-fg transition-colors">← Back</Link>
        <span className="font-display text-lg font-bold text-fg">Notifications</span>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="text-xs text-fg font-medium underline underline-offset-2 disabled:opacity-30 disabled:no-underline"
        >
          Mark all read
        </button>
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
            {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {showSkeleton && (
        <div className="px-5 space-y-2.5 pt-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-mist border border-line p-3.5 animate-pulse">
              <div className="h-[46px] w-[46px] rounded-full bg-line/20 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-line/20 rounded" />
                <div className="h-2.5 w-1/4 bg-line/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!showSkeleton && loadError && visible.length === 0 && (
        <EmptyState icon="bell" title="Couldn't load notifications" subtitle="Check your connection and try again." onRetry={load} />
      )}

      {!showSkeleton && !loadError && loaded && shown.length === 0 && (
        <EmptyState
          icon="bell"
          title={filter === 'unread' ? "You're all caught up" : 'No notifications yet'}
          subtitle={
            filter === 'unread'
              ? 'No unread notifications.'
              : "When someone follows you or likes your post, you'll see it here."
          }
        />
      )}

      {!showSkeleton &&
        groups.map((g) => (
          <section key={g.label} className="px-5 pt-3">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">{g.label}</h2>
            <div className="space-y-2">
              {g.items.map((n) => {
                const actor = (n.actor ?? null) as unknown as Actor | null;
                const kind = kindOf(n.title);
                const { action, snippet } = describe(n.body, actor, kind);
                return (
                  <div
                    key={n.id}
                    className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-colors ${
                      n.read ? 'active:bg-mist/60' : 'bg-mist border border-line card-elevated'
                    }`}
                  >
                    {actor ? (
                      <Link
                        href={`/u/${actor.username}`}
                        onClick={() => !n.read && markRead(n.id)}
                        aria-label={`View ${actor.full_name}'s profile`}
                        className="relative shrink-0"
                      >
                        <Avatar avatar={actor.avatar} name={actor.full_name} size={46} />
                        <KindBadge kind={kind} />
                      </Link>
                    ) : (
                      <span className="h-[46px] w-[46px] rounded-full bg-mist border border-line flex items-center justify-center text-fg/60 shrink-0">
                        <BellIcon />
                      </span>
                    )}

                    <Link
                      href={n.link || '#'}
                      onClick={() => !n.read && markRead(n.id)}
                      className="min-w-0 flex-1 active:opacity-70 transition-opacity"
                    >
                      <div className={`text-sm leading-snug ${n.read ? 'text-fg/70' : 'text-fg'}`}>
                        <span className="font-semibold text-fg inline-flex items-center gap-1">
                          {actor ? actor.full_name : n.title}
                          {actor?.verified && <VerifiedBadge size={11} />}
                        </span>{' '}
                        <span>{action}</span>
                      </div>
                      {snippet && (
                        <p className="mt-1 text-xs text-fg/50 line-clamp-2 border-l-2 border-line pl-2">{snippet}</p>
                      )}
                      <div className="text-xs text-fg/40 mt-1">{formatRelativeTime(n.created_at)}</div>
                    </Link>

                    {kind === 'follow' && actor?.id && actor.verified ? (
                      <FollowButton userId={actor.id} />
                    ) : (
                      !n.read && <span className="h-2.5 w-2.5 rounded-full bg-blue shrink-0" aria-label="Unread" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

      <BottomNav />
    </main>
  );
}

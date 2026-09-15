'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import EmptyState from '@/components/EmptyState';
import Avatar from '@/components/Avatar';
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
  if (diffDay < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const { notifications, loading, loaded, refresh, markRead, markAllRead } = useNotifications();

  // Refresh in the background every time this page is opened, without blocking
  // display of whatever's already cached from the shared context.
  useEffect(() => {
    if (user) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading) {
    return <PageLoader />;
  }

  const showSkeleton = loading && !loaded;

  return (
    <main className="min-h-screen bg-paper pb-10">
      <div className="flex items-center justify-between px-5 py-6">
        <Link href="/browse" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Notifications</span>
        <button onClick={markAllRead} className="text-xs text-fg font-medium underline underline-offset-2">
          Mark all read
        </button>
      </div>

      {showSkeleton && (
        <div className="px-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-line animate-pulse">
              <div className="h-12 w-12 rounded-full bg-mist shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 bg-mist rounded" />
                <div className="h-2.5 w-1/3 bg-mist rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!showSkeleton && loaded && notifications.length === 0 && (
        <EmptyState icon="bell" title="You're all caught up" subtitle="Nothing new right now." />
      )}

      {!showSkeleton && notifications.length > 0 && (
        <div className="px-5">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || '#'}
              onClick={() => !n.read && markRead(n.id)}
              className="flex items-center gap-3 py-3 border-b border-line active:bg-mist/60 transition-colors"
            >
              {n.actor ? (
                <Avatar avatar={n.actor.avatar} name={n.actor.full_name} size={48} />
              ) : (
                <span className="h-12 w-12 rounded-full bg-mist border border-line flex items-center justify-center text-fg/60 shrink-0">
                  <BellIcon />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className={`text-sm leading-snug ${n.read ? 'text-fg/70' : 'text-fg font-medium'}`}>
                  {n.actor ? (
                    <>
                      <span className="font-semibold text-fg">{n.actor.full_name}</span>{' '}
                      {n.body.replace(`${n.actor.full_name}: `, '').replace(`${n.actor.full_name} `, '')}
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-fg">{n.title}</span>{' '}
                      {n.body}
                    </>
                  )}
                </div>
                <div className="text-xs text-fg/40 mt-0.5">{formatRelativeTime(n.created_at)}</div>
              </div>

              {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-blue shrink-0" />}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

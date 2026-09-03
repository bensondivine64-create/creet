'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/notifications';
import { Notification } from '@/types/notification';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import EmptyState from '@/components/EmptyState';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getNotifications()
      .then((res) => setItems(res.notifications))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load notifications'))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleOpen(n: Notification) {
    if (!n.read) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
      markNotificationRead(n.id).catch(() => {});
    }
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    markAllNotificationsRead().catch(() => {});
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-fg/40 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper pb-10">
      <div className="flex items-center justify-between px-5 py-4">
        <Link href="/browse" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">Notifications</span>
        <button onClick={handleMarkAll} className="text-xs text-blue font-medium">
          Mark all read
        </button>
      </div>

      {loading && <p className="text-sm text-fg/40 text-center py-16">Loading...</p>}
      {!loading && error && (
        <EmptyState icon="bell" title="Couldn't load notifications" />
      )}
      {!loading && !error && items.length === 0 && (
        <EmptyState icon="bell" title="You're all caught up" subtitle="Nothing new right now." />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="px-5 space-y-3">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.link || '#'}
              onClick={() => handleOpen(n)}
              className={`flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-lg shadow-black/40 active:scale-[0.98] transition-transform ${
                n.read ? 'bg-mist' : 'bg-blue/15'
              }`}
            >
              {!n.read && <span className="h-2 w-2 rounded-full bg-blue mt-1.5 shrink-0" />}
              {n.read && <span className="h-2 w-2 shrink-0" />}
              <div className="min-w-0">
                <div className="text-sm font-medium text-fg">{n.title}</div>
                <div className="text-sm text-fg/50 mt-0.5">{n.body}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications } from '@/lib/notifications';

export default function NotificationBell() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    getNotifications()
      .then((res) => setUnread(res.unread_count))
      .catch(() => setUnread(0));
  }, [user]);

  return (
    <Link
      href="/notifications"
      className="relative h-8 w-8 rounded-full bg-mist flex items-center justify-center text-fg/60 active:scale-[0.95] transition-transform"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {unread > 0 && (
        <>
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-blue border-2 border-paper z-10" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-blue animate-pulse-ring" />
        </>
      )}
    </Link>
  );
}

'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/notifications';
import { Notification } from '@/types/notification';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loaded: boolean;
  refresh: () => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}

const REFRESH_INTERVAL_MS = 60000;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback((silent: boolean) => {
    if (!silent) setLoading(true);
    getNotifications()
      .then((res) => {
        setNotifications(res.notifications);
        setUnreadCount(res.unread_count);
        setLoaded(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoaded(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    // First load for this user shows loading state; background refreshes don't.
    fetchNotifications(false);
    intervalRef.current = setInterval(() => fetchNotifications(true), REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetchNotifications]);

  function refresh() {
    fetchNotifications(true);
  }

  function markRead(id: number) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    markNotificationRead(id).catch(() => {});
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    markAllNotificationsRead().catch(() => {});
  }

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, loading, loaded, refresh, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

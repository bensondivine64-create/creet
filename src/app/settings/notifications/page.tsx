'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { updateNotificationPrefs } from '@/lib/account';

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${on ? 'bg-blue' : 'bg-mist border border-line'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const { user, loading } = useRequireAnyAuth();
  const { refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  if (loading || !user) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  async function toggle(field: 'notify_messages' | 'notify_announcements' | 'notify_listing_activity') {
    if (!user) return;
    setSaving(true);
    try {
      await updateNotificationPrefs({ [field]: !user[field] });
      await refreshUser();
    } finally {
      setSaving(false);
    }
  }

  const rows: { key: 'notify_messages' | 'notify_announcements' | 'notify_listing_activity'; label: string; sub: string }[] = [
    { key: 'notify_messages', label: 'Messages', sub: 'New messages from buyers, sellers, or freelancers.' },
    { key: 'notify_announcements', label: 'Announcements', sub: 'Platform-wide announcements from CREET.' },
    { key: 'notify_listing_activity', label: 'Listing activity', sub: 'Comments and updates on your listings.' },
  ];

  return (
    <main className="min-h-screen bg-paper pb-24">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/settings" className="text-sm text-muted hover:text-fg transition-colors">← Back</Link>
        <span className="font-display text-lg font-bold text-fg">Notifications</span>
        <span className="w-10" />
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-3">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between bg-mist border border-line rounded-xl px-4 py-3.5">
            <div className="min-w-0 pr-3">
              <div className="font-semibold text-fg text-sm">{r.label}</div>
              <div className="text-xs text-muted mt-0.5">{r.sub}</div>
            </div>
            <Toggle on={user[r.key]} onClick={() => toggle(r.key)} />
          </div>
        ))}
        {saving && <p className="text-xs text-muted text-center">Saving...</p>}
      </div>
    </main>
  );
}

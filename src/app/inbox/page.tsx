'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getConversations } from '@/lib/messages';
import { Conversation } from '@/types/message';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import BottomNav from '@/components/BottomNav';

export default function InboxPage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    getConversations()
      .then((res) => setConversations(res.conversations))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load inbox'))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-ink/40 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper pb-20">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <span className="font-display text-lg font-bold text-ink">Inbox</span>
      </div>

      {loading && <p className="text-sm text-ink/40 text-center py-16">Loading...</p>}

      {!loading && error && (
        <p className="text-sm text-ink/40 text-center py-16">Couldn&apos;t load your inbox.</p>
      )}

      {!loading && !error && conversations.length === 0 && (
        <p className="text-sm text-ink/40 text-center py-16">No conversations yet.</p>
      )}

      {!loading && !error && conversations.length > 0 && (
        <div>
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/inbox/${c.id}`}
              className="flex items-center gap-3 px-5 py-4 border-b border-line hover:bg-mist transition-colors"
            >
              <span className="h-11 w-11 rounded-full bg-ink text-white text-sm font-bold flex items-center justify-center shrink-0">
                {c.participant.full_name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink truncate flex items-center gap-1">
                    {c.participant.full_name}
                    {c.participant.verified && <span className="text-blue text-xs">✓</span>}
                  </span>
                  {c.unread_count > 0 && (
                    <span className="h-2 w-2 rounded-full bg-blue shrink-0" />
                  )}
                </div>
                {c.listing_title && (
                  <div className="text-xs text-ink/40 truncate">Re: {c.listing_title}</div>
                )}
                <div className="text-sm text-ink/50 truncate mt-0.5">{c.last_message}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}

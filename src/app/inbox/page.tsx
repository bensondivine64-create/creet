'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getConversations } from '@/lib/messages';
import { Conversation } from '@/types/message';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';
import VerifiedBadge from '@/components/VerifiedBadge';

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
    return <div className="min-h-screen flex items-center justify-center text-fg/40 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper pb-20 animate-fade-in-up">
      <div className="px-5 py-4">
        <span className="font-display text-xl font-bold text-fg">Inbox</span>
      </div>

      {loading && <p className="text-sm text-fg/40 text-center py-16">Loading...</p>}

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

      {!loading && !error && conversations.length > 0 && (
        <div className="px-5 space-y-3">
          {conversations.map((c, i) => (
            <Link
              key={c.id}
              href={`/inbox/${c.id}`}
              style={{ animationDelay: `${i * 60}ms` }}
              className="flex items-center gap-3 bg-mist rounded-2xl px-4 py-3.5 shadow-lg shadow-black/40 active:scale-[0.98] transition-transform opacity-0 animate-fade-in-up"
            >
              <span className="h-12 w-12 rounded-full bg-blue text-white text-base font-bold flex items-center justify-center shrink-0">
                {c.participant.full_name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-fg truncate flex items-center gap-1">
                    {c.participant.full_name}
                    {c.participant.verified && <VerifiedBadge size={12} />}
                  </span>
                  {c.unread_count > 0 && (
                    <span className="h-2 w-2 rounded-full bg-blue shrink-0" />
                  )}
                </div>
                {c.listing_title && (
                  <div className="text-xs text-fg/40 truncate">Re: {c.listing_title}</div>
                )}
                <div className="text-sm text-fg/50 truncate mt-0.5">{c.last_message}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}

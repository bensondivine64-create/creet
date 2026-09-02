'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getMessages, sendMessage } from '@/lib/messages';
import { Message } from '@/types/message';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';

export default function ConversationPage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !params.id) return;
    getMessages(params.id as string)
      .then((res) => setMessages(res.messages))
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load messages'))
      .finally(() => setLoading(false));
  }, [user, params.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !params.id) return;
    setSending(true);
    try {
      const res = await sendMessage(params.id as string, draft.trim());
      setMessages((prev) => [...prev, res.message]);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message');
    } finally {
      setSending(false);
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-fg/40 text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
        <Link href="/inbox" className="text-sm text-fg/50 hover:text-fg transition-colors">
          ←
        </Link>
        <span className="font-display font-semibold text-fg">Conversation</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
        {loading && <p className="text-sm text-fg/40 text-center py-10">Loading...</p>}
        {!loading && error && (
          <p className="text-sm text-fg/40 text-center py-10">Couldn&apos;t load this conversation.</p>
        )}
        {!loading && !error && messages.length === 0 && (
          <p className="text-sm text-fg/40 text-center py-10">Say hello 👋</p>
        )}
        {!loading &&
          !error &&
          messages.map((m) => {
            const mine = m.sender_username === user.username;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine ? 'bg-blue text-white' : 'bg-mist text-fg'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-line px-4 py-3 flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message..."
          className="flex-1 rounded-full border border-line bg-mist px-4 py-2.5 text-sm text-fg placeholder:text-fg/40 focus:outline-none focus:ring-2 focus:ring-blue transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="h-10 w-10 rounded-full bg-blue hover:bg-blue-deep disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </main>
  );
}

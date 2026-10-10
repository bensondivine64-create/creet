'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getSupportConversation, sendSupportMessage, SupportMessage, SupportStatus } from '@/lib/support';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { useToast } from '@/contexts/ToastContext';
import VerifiedBadge from '@/components/VerifiedBadge';

const QUICK_ACTIONS = [
  'How does CREET work?',
  'Account problem',
  'Report a user',
  'Problem with a listing',
  "Something isn't working",
  'Talk to human support',
];

function SupportLogo({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-blue flex items-center justify-center shrink-0 overflow-hidden"
    >
      {/* Swap this span for <img src="/creet-logo.png" alt="" className="h-full w-full object-cover" /> once a logo asset is uploaded */}
      <span className="font-display font-bold text-black" style={{ fontSize: size * 0.45 }}>C</span>
    </div>
  );
}

function SenderBadge({ status }: { status: SupportStatus }) {
  if (status === 'human') {
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">
        Human agent
      </span>
    );
  }
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue/15 text-blue">
      AI
    </span>
  );
}

function MessageBubble({ msg, mine }: { msg: SupportMessage; mine: boolean }) {
  if (msg.sender_type === 'system') {
    return (
      <div className="text-center my-3">
        <span className="text-[11px] text-muted bg-mist px-3 py-1.5 rounded-full">{msg.content}</span>
      </div>
    );
  }

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} mt-3`}>
      <div className={`max-w-[80%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
        {!mine && (
          <span className="text-[10px] text-muted mb-1 px-1">
            {msg.sender_type === 'agent' ? 'CREET Support (Human)' : 'CREET Support (AI)'}
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            mine ? 'bg-blue text-black' : 'bg-mist text-fg'
          }`}
        >
          {msg.content}
        </div>
      </div>
    </div>
  );
}

export default function SupportConversationPage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [status, setStatus] = useState<SupportStatus>('ai');
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    getSupportConversation()
      .then((res) => {
        setMessages(res.messages);
        setStatus(res.status);
        if (res.ticket) setTicketId(res.ticket.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function submit(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    const userMsg: SupportMessage = {
      id: Date.now(),
      sender_type: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');

    try {
      const res = await sendSupportMessage(text.trim());
      setStatus(res.status);
      if (res.ticket_id) setTicketId(res.ticket_id);
      if (res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender_type: res.status === 'human' ? 'system' : 'ai',
            content: res.reply as string,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not send message', 'error');
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(draft);
  }

  if (authLoading || !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-fg/40 text-sm">Loading...</div>;
  }

  const showQuickActions = !loading && messages.length === 0;
  const isWaitingForAgent = status === 'human' && messages.length > 0 && messages[messages.length - 1].sender_type !== 'agent';

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-line/60 safe-top">
        <Link href="/inbox" className="text-sm text-fg/50 hover:text-fg transition-colors shrink-0">
          ←
        </Link>
        <SupportLogo />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-semibold text-fg text-sm">CREET Support</span>
            <VerifiedBadge size={14} />
          </div>
          <SenderBadge status={status} />
        </div>
        {ticketId && (
          <span className="text-[10px] font-medium text-muted border border-line rounded-full px-2.5 py-1 shrink-0">
            Ticket #{ticketId}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {loading && <p className="text-sm text-fg/40 text-center py-10">Loading...</p>}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center text-center py-10 px-4">
            <SupportLogo />
            <p className="text-sm font-medium text-fg mt-4 mb-1">Hi, I&apos;m CREET Support</p>
            <p className="text-xs text-muted max-w-[260px] leading-relaxed">
              Ask me anything about using CREET, or pick a quick topic below.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} mine={m.sender_type === 'user'} />
        ))}

        {isWaitingForAgent && (
          <div className="text-center my-3">
            <span className="text-[11px] text-muted bg-mist px-3 py-1.5 rounded-full">
              Waiting for a human agent to respond...
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {showQuickActions && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => submit(action)}
              disabled={sending}
              className="text-xs font-medium border border-line text-fg/80 rounded-full px-3.5 py-2 active:scale-[0.96] transition-transform disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-line/60 px-5 py-4 flex items-center gap-2.5 safe-bottom">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message CREET Support..."
          disabled={sending}
          className="flex-1 rounded-full border border-line bg-mist px-4 py-3 text-sm text-fg placeholder:text-fg/40 focus:outline-none focus:ring-2 focus:ring-blue/40 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="h-10 w-10 rounded-full bg-blue hover:bg-blue-deep disabled:opacity-40 text-black flex items-center justify-center shrink-0 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </main>
  );
}

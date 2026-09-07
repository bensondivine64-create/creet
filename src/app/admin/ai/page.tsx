'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAdmin } from '@/contexts/useRequireAdmin';
import { sendAiCommand, confirmAiAction, PendingAction, HistoryItem } from '@/lib/adminAi';

interface ChatMsg {
  role: 'admin' | 'ai';
  text: string;
  pending?: PendingAction | null;
  resolved?: boolean;
}

export default function AdminAiPage() {
  const { user, loading } = useRequireAdmin();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', text: "Hi, I'm CREET's admin assistant. Tell me what you need — e.g. \"suspend user 12\" or \"resolve report 3\"." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setError('');
    const historyToSend: HistoryItem[] = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: 'admin', text }]);
    setSending(true);
    try {
      const res = await sendAiCommand(text, historyToSend);
      setMessages((prev) => [...prev, { role: 'ai', text: res.reply, pending: res.pending_action }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the assistant');
    } finally {
      setSending(false);
    }
  }

  async function handleConfirm(index: number, pending: PendingAction) {
    setSending(true);
    try {
      const res = await confirmAiAction(pending.action, pending.target_id, pending.message);
      setMessages((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], resolved: true };
        copy.push({
          role: 'ai',
          text: res.success ? 'Done — action completed.' : `Couldn't complete that: ${res.error}`,
        });
        return copy;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm action');
    } finally {
      setSending(false);
    }
  }

  function handleCancel(index: number) {
    setMessages((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], resolved: true };
      copy.push({ role: 'ai', text: 'Cancelled — no action taken.' });
      return copy;
    });
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <Link href="/admin" className="text-sm text-muted hover:text-fg transition-colors">
          ← Back
        </Link>
        <span className="font-display text-lg font-bold text-fg">AI Assistant</span>
        <span className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.role === 'admin' ? 'bg-blue text-black' : 'bg-mist text-fg border border-line'
            }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.pending && !m.resolved && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleConfirm(i, m.pending!)}
                    disabled={sending}
                    className="bg-fg text-black text-xs font-semibold rounded-lg px-3 py-1.5 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleCancel(i)}
                    disabled={sending}
                    className="bg-paper border border-line text-fg text-xs font-semibold rounded-lg px-3 py-1.5 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-line px-4 py-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command..."
          className="flex-1 rounded-full border border-line bg-mist px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-fg/30 transition-colors"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="h-10 w-10 rounded-full bg-fg disabled:opacity-40 text-black flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
    </main>
  );
}

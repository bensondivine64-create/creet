'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getMessages, sendMessage, sendMessageImage } from '@/lib/messages';
import { Message } from '@/types/message';
import { useRequireAnyAuth } from '@/contexts/useRequireAnyAuth';
import { useToast } from '@/contexts/ToastContext';

interface Participant {
  username: string;
  full_name: string;
  avatar?: string | null;
  verified: boolean;
  last_active?: string | null;
  is_online?: boolean;
}

function formatLastActive(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function formatBubbleTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
}

export default function ConversationPage() {
  const { user, loading: authLoading } = useRequireAnyAuth();
  const { showToast } = useToast();
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !params.id) return;
    getMessages(params.id as string)
      .then((res) => {
        setMessages(res.messages);
        if (res.participant) setParticipant(res.participant);
      })
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
      const message = err instanceof Error ? err.message : 'Could not send message';
      showToast(message, 'error');
    } finally {
      setSending(false);
    }
  }

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !params.id) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('Image must be under 8MB', 'error');
      return;
    }
    setUploadingImage(true);
    try {
      const res = await sendMessageImage(params.id as string, file);
      setMessages((prev) => [...prev, res.message]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send image';
      showToast(message, 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-fg/40 text-sm">Loading...</div>;
  }

  let lastDay = '';

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-line/60 safe-top">
        <Link href="/inbox" className="text-sm text-fg/50 hover:text-fg transition-colors shrink-0">
          ←
        </Link>
        {participant ? (
          <Link href={`/u/${participant.username}`} className="flex items-center gap-2.5 min-w-0 flex-1 active:opacity-70">
            <div className="relative shrink-0">
              {participant.avatar ? (
                <img src={participant.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="h-9 w-9 rounded-full bg-fg text-black text-sm font-bold flex items-center justify-center">
                  {participant.full_name.charAt(0).toUpperCase()}
                </span>
              )}
              {participant.is_online && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-black" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-display font-semibold text-fg text-sm truncate">{participant.full_name}</div>
              {(participant.is_online || participant.last_active) && (
                <div className={`text-xs ${participant.is_online ? 'text-green-500' : 'text-fg/40'}`}>
                  {participant.is_online ? 'Active now' : `Active ${formatLastActive(participant.last_active as string)}`}
                </div>
              )}
            </div>
          </Link>
        ) : (
          <span className="font-display font-semibold text-fg">Conversation</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
        {loading && <p className="text-sm text-fg/40 text-center py-10">Loading...</p>}
        {!loading && error && (
          <p className="text-sm text-fg/40 text-center py-10">Couldn&apos;t load this conversation.</p>
        )}
        {!loading && !error && messages.length === 0 && (
          <p className="text-sm text-fg/40 text-center py-10">Say hello 👋</p>
        )}
        {!loading &&
          !error &&
          messages.map((m, i) => {
            const mine = m.sender_username === user.username;
            const day = formatDayLabel(m.created_at);
            const showDayLabel = day !== lastDay;
            lastDay = day;
            const prev = messages[i - 1];
            const grouped = !showDayLabel && prev && prev.sender_username === m.sender_username;

            return (
              <div key={m.id}>
                {showDayLabel && (
                  <div className="text-center my-4">
                    <span className="text-[11px] text-fg/40 bg-mist px-3 py-1 rounded-full">{day}</span>
                  </div>
                )}
                <div className={`flex ${mine ? 'justify-end' : 'justify-start'} ${grouped ? 'mt-0.5' : 'mt-3'}`}>
                  <div className={`max-w-[75%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                    {m.image_url ? (
                      <button
                        onClick={() => setPreviewImage(m.image_url as string)}
                        className="rounded-2xl overflow-hidden active:opacity-90 transition-opacity"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.image_url} alt="" className="max-w-full max-h-72 object-cover" />
                      </button>
                    ) : (
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm ${
                          mine ? 'bg-blue text-black' : 'bg-mist text-fg'
                        }`}
                      >
                        {m.content}
                      </div>
                    )}
                    <span className="text-[10px] text-fg/30 mt-1 px-1">{formatBubbleTime(m.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-line/60 px-5 py-4 flex items-center gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelected}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="h-10 w-10 rounded-full bg-mist border border-line flex items-center justify-center shrink-0 active:scale-95 transition-transform disabled:opacity-50"
          aria-label="Send image"
        >
          {uploadingImage ? (
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M12 2a10 10 0 0110 10" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10.5" r="1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 19" />
            </svg>
          )}
        </button>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message..."
          className="flex-1 rounded-full border border-line bg-mist px-4 py-3 text-sm text-fg placeholder:text-fg/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
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

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-5"
          onClick={() => setPreviewImage(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewImage} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}

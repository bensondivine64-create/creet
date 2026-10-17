'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { submitFeedback } from '@/lib/feedback';

const SHOWN_KEY = 'creet_feedback_shown';
const DELAY_MS = 12 * 60 * 1000;

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill={filled ? '#1D9BF0' : 'none'} stroke={filled ? '#1D9BF0' : '#8B98A5'} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function FeedbackPrompt() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(SHOWN_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      localStorage.setItem(SHOWN_KEY, '1');
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [user]);

  async function handleSubmit() {
    if (rating === 0) return;
    setSending(true);
    try {
      await submitFeedback(rating, comment.trim());
      setSubmitted(true);
      setTimeout(() => setVisible(false), 1800);
    } catch {
      // fail silently — not worth blocking the user over a feedback prompt
      setVisible(false);
    } finally {
      setSending(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 flex items-end sm:items-center justify-center p-5 animate-fade-in-up">
      <div className="w-full max-w-sm bg-mist border border-line rounded-3xl p-6 shadow-2xl shadow-black/60">
        {submitted ? (
          <div className="text-center py-6">
            <div className="h-12 w-12 rounded-full bg-blue/15 text-blue flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-fg">Thanks for your feedback!</p>
          </div>
        ) : (
          <>
            <h2 className="font-display text-lg font-bold text-fg mb-1">Enjoying CREET?</h2>
            <p className="text-sm text-muted mb-5">Your rating helps us improve the experience for everyone.</p>

            <div className="flex items-center justify-center gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} star${n === 1 ? '' : 's'}`} className="active:scale-90 transition-transform">
                  <StarIcon filled={n <= rating} />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Anything you'd like us to know? (optional)"
              rows={3}
              className="w-full rounded-xl border border-line bg-black px-3.5 py-3 text-sm text-fg placeholder:text-fg/30 resize-none focus:outline-none focus:ring-2 focus:ring-blue/40 transition-colors mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setVisible(false)}
                className="flex-1 border border-line text-fg/70 text-sm font-semibold rounded-full py-3"
              >
                Not now
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || sending}
                className="flex-1 bg-blue disabled:opacity-40 text-black text-sm font-semibold rounded-full py-3 active:scale-[0.98] transition-transform"
              >
                {sending ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

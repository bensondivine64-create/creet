'use client';

import { useState } from 'react';
import { createReport } from '@/lib/reports';

const REASONS = ['Spam', 'Scam or fraud', 'Inappropriate content', 'Fake listing', 'Harassment', 'Other'];

interface ReportModalProps {
  targetType: 'listing' | 'user';
  targetId: number;
  onClose: () => void;
}

export default function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    setError('');
    try {
      await createReport({ target_type: targetType, target_id: targetId, reason, description: description || undefined });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit report');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-paper border border-line rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="text-center py-4">
            <p className="text-fg font-semibold mb-1">Report submitted</p>
            <p className="text-sm text-muted mb-4">Thanks for helping keep CREET safe.</p>
            <button onClick={onClose} className="text-sm text-fg underline underline-offset-2">Close</button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-lg font-bold text-fg mb-3">Report this {targetType}</h2>

            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

            <div className="flex flex-wrap gap-2 mb-3">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    reason === r ? 'bg-blue text-black' : 'bg-mist border border-line text-muted'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              className="w-full rounded-lg border border-line bg-mist px-3 py-2 text-sm text-fg placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-white/30 mb-3"
            />

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 bg-mist border border-line rounded-lg py-2.5 text-sm text-fg">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="flex-1 bg-blue disabled:opacity-50 rounded-lg py-2.5 text-sm font-semibold text-black"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getHistory, addHistory, removeHistory, clearHistory } from '@/lib/searchHistory';

export default function RecentSearches({
  scope,
  current,
  onPick,
}: {
  scope: string;
  current: string;
  onPick: (term: string) => void;
}) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(getHistory(scope));
  }, [scope]);

  // Save a search only once the user has paused on it, so half-typed words don't pile up
  useEffect(() => {
    const term = current.trim();
    if (term.length < 2) return;
    const t = setTimeout(() => {
      addHistory(scope, term);
      setItems(getHistory(scope));
    }, 1500);
    return () => clearTimeout(t);
  }, [scope, current]);

  if (current.trim() !== '' || items.length === 0) return null;

  return (
    <div className="px-5 pt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">Recent searches</span>
        <button
          type="button"
          onClick={() => { clearHistory(scope); setItems([]); }}
          className="text-xs text-muted underline underline-offset-2"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((term) => (
          <span key={term} className="inline-flex items-center rounded-full bg-mist border border-line overflow-hidden">
            <button
              type="button"
              onClick={() => onPick(term)}
              className="pl-3 pr-2 py-1.5 text-xs text-fg/80 flex items-center gap-1.5 active:opacity-60"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {term}
            </button>
            <button
              type="button"
              aria-label={`Remove ${term}`}
              onClick={() => { removeHistory(scope, term); setItems(getHistory(scope)); }}
              className="pr-2.5 pl-1 py-1.5 text-fg/40 text-xs active:opacity-60"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

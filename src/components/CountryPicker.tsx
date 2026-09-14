'use client';

import { useMemo, useState } from 'react';
import { COUNTRIES } from '@/lib/countries';

interface CountryPickerProps {
  value: string;
  onChange: (country: string) => void;
  label?: string;
}

export default function CountryPicker({ value, onChange, label }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return COUNTRIES;
    const q = query.trim().toLowerCase();
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  function handleSelect(country: string) {
    onChange(country);
    setOpen(false);
    setQuery('');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-sm text-left flex items-center justify-between"
      >
        <span className={value ? 'text-fg' : 'text-muted'}>{value || label || 'Select your country'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-muted">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-paper flex flex-col animate-fade-in-up">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
            <button
              type="button"
              onClick={() => { setOpen(false); setQuery(''); }}
              className="text-muted hover:text-fg transition-colors"
              aria-label="Close"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="font-display text-base font-bold text-fg">Select your country</span>
          </div>

          <div className="px-5 py-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B98A5" strokeWidth={2}
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search countries"
                className="w-full bg-mist rounded-xl pl-9 pr-3 py-2.5 text-sm text-fg placeholder:text-muted/50 outline-none focus:ring-1 focus:ring-blue/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-8">
            {filtered.length === 0 && (
              <p className="text-sm text-muted text-center py-10">No countries match &ldquo;{query}&rdquo;</p>
            )}
            {filtered.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleSelect(c)}
                className="w-full flex items-center justify-between px-5 py-3.5 border-b border-line/50 active:bg-mist transition-colors"
              >
                <span className={`text-sm ${value === c ? 'text-fg font-semibold' : 'text-fg/80'}`}>{c}</span>
                <span className={`h-4 w-4 rounded-full border ${value === c ? 'border-blue bg-blue' : 'border-line'}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

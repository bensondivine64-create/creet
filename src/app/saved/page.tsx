'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSaved, removeSaved, SavedItem } from '@/lib/saved';
import { optimizeImg } from '@/lib/img';
import BottomNav from '@/components/BottomNav';
import EmptyState from '@/components/EmptyState';

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[] | null>(null);

  useEffect(() => {
    setItems(getSaved());
  }, []);

  return (
    <main className="min-h-screen bg-black pb-32">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line/60 safe-top">
        <Link href="/settings" className="text-sm text-muted hover:text-fg transition-colors">← Back</Link>
        <span className="font-display text-lg font-bold text-fg">Saved</span>
        <span className="w-10" />
      </div>

      {items === null && (
        <div className="px-5 py-6 grid grid-cols-2 gap-3 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-mist border border-line" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <EmptyState
          icon="listing"
          title="Nothing saved yet"
          subtitle="Tap Save on any listing to keep it here."
          ctaLabel="Browse listings"
          ctaHref="/browse"
        />
      )}

      {items && items.length > 0 && (
        <div className="px-5 py-6 grid grid-cols-2 gap-3">
          {items.map((it) => (
            <div key={it.id} className="relative card-elevated bg-mist border border-line rounded-2xl overflow-hidden">
              <Link href={`/listing/${it.id}`} className="block active:opacity-80 transition-opacity">
                <div className="aspect-video bg-line/20 overflow-hidden">
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={optimizeImg(it.image, 400)} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-fg line-clamp-2 leading-snug">{it.title}</div>
                  <div className="text-xs text-muted mt-1.5">{it.currency} {it.price.toLocaleString()}</div>
                </div>
              </Link>
              <button
                type="button"
                aria-label={`Remove ${it.title} from saved`}
                onClick={() => { removeSaved(it.id); setItems(getSaved()); }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-white text-xs flex items-center justify-center active:scale-90 transition-transform"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}

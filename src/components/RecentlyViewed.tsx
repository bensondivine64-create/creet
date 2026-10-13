'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentlyViewed, clearRecentlyViewed, ViewedItem } from '@/lib/recentlyViewed';
import { optimizeImg } from '@/lib/img';

export default function RecentlyViewed() {
  const [items, setItems] = useState<ViewedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="pt-8">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="font-display font-bold text-fg text-lg">Recently viewed</h2>
        <button
          type="button"
          onClick={() => { clearRecentlyViewed(); setItems([]); }}
          className="text-xs text-muted underline underline-offset-2"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-3 px-5 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/listing/${it.id}`}
            className="ripple card-elevated shrink-0 snap-start w-36 bg-mist border border-line rounded-2xl overflow-hidden active:scale-[0.97] transition-transform"
          >
            <div className="aspect-video bg-line/20 overflow-hidden">
              {it.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={optimizeImg(it.image, 320)} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              )}
            </div>
            <div className="p-2.5">
              <div className="text-xs font-semibold text-fg line-clamp-2 leading-snug">{it.title}</div>
              <div className="text-[11px] text-muted mt-1">{it.currency} {it.price.toLocaleString()}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

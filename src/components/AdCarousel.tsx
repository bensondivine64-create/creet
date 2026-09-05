'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAds, Ad } from '@/lib/ads';

export default function AdCarousel() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    getAds()
      .then((res) => setAds(res.ads))
      .catch(() => setAds([]));
  }, []);

  if (ads.length === 0) return null;

  return (
    <section className="pt-5">
      <div className="flex gap-3 px-5 pb-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {ads.map((ad) => {
          const card = (
            <div className="relative shrink-0 snap-start w-64 h-32 rounded-2xl overflow-hidden border border-line active:scale-[0.97] transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ad.image_url} alt={ad.title} className="h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white leading-tight">
                {ad.title}
              </span>
            </div>
          );

          return ad.link_url ? (
            <a key={ad.id} href={ad.link_url} target="_blank" rel="noopener noreferrer">
              {card}
            </a>
          ) : (
            <div key={ad.id}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}

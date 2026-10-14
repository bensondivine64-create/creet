'use client';

import { useEffect, useState } from 'react';
import { isSaved, toggleSaved } from '@/lib/saved';
import { useToast } from '@/contexts/ToastContext';

export default function SaveButton({
  listing,
}: {
  listing: { id: number; title: string; images?: string[] | null; price: number; currency: string };
}) {
  const { showToast } = useToast();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isSaved(listing.id));
  }, [listing.id]);

  function toggle() {
    const now = toggleSaved({
      id: listing.id,
      title: listing.title,
      image: listing.images?.[0],
      price: listing.price,
      currency: listing.currency,
    });
    setSaved(now);
    showToast(now ? 'Saved to your list' : 'Removed from saved', 'success');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      className="text-xs text-fg/70 underline underline-offset-2"
    >
      {saved ? 'Saved ✓' : 'Save'}
    </button>
  );
}

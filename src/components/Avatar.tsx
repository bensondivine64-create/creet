'use client';

import { useEffect, useState } from 'react';
import { optimizeImg } from '@/lib/img';
import ImageLightbox from '@/components/ImageLightbox';

interface AvatarProps {
  avatar?: string | null;
  name: string;
  size?: number;
  viewable?: boolean;
  onEdit?: () => void;
  editLabel?: string;
}

export default function Avatar({ avatar, name, size = 32, viewable = false, onEdit, editLabel = 'Change photo' }: AvatarProps) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setStage(0);
  }, [avatar]);

  const style = { width: size, height: size };
  const optimized = avatar ? optimizeImg(avatar, Math.max(size * 2, 64)) : '';

  if (avatar && stage < 2) {
    const src = stage === 0 ? optimized : avatar;
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={src}
        src={src}
        alt={name}
        data-managed="1"
        style={style}
        onError={() => setStage((s) => (s === 0 && optimized !== avatar ? 1 : 2))}
        className="rounded-full object-cover shrink-0 border border-line"
      />
    );
    if (!viewable) return img;
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`View ${name}'s photo`}
          className="block shrink-0 rounded-full cursor-zoom-in"
        >
          {img}
        </button>
        {open && (
          <ImageLightbox images={[avatar]} onClose={() => setOpen(false)} onEdit={onEdit ? () => onEdit() : undefined} editLabel={editLabel} />
        )}
      </>
    );
  }

  return (
    <span
      style={style}
      className="rounded-full bg-black text-fg font-bold flex items-center justify-center shrink-0 border border-line"
    >
      <span style={{ fontSize: size * 0.4 }}>{(name || '?').charAt(0).toUpperCase()}</span>
    </span>
  );
}

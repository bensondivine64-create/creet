'use client';

import { useState } from 'react';
import { optimizeImg } from '@/lib/img';
import ImageLightbox from '@/components/ImageLightbox';

export default function ViewableImage({
  src,
  images,
  index = 0,
  alt = '',
  className = 'w-full',
  imgClassName = '',
  width = 900,
  onEdit,
  editLabel,
}: {
  src: string;
  images?: string[];
  index?: number;
  alt?: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  onEdit?: (index: number) => void;
  editLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const list = images && images.length > 0 ? images : [src];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `View ${alt}` : 'View image'}
        className={`block cursor-zoom-in ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={optimizeImg(src, width)} alt={alt} loading="lazy" decoding="async" className={imgClassName} />
      </button>
      {open && <ImageLightbox images={list} startIndex={index} onClose={() => setOpen(false)} onEdit={onEdit} editLabel={editLabel} />}
    </>
  );
}

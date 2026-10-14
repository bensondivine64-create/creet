'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { optimizeImg } from '@/lib/img';

interface ImageLightboxProps {
  images: string[];
  startIndex?: number;
  onClose: () => void;
  onEdit?: (index: number) => void;
  editLabel?: string;
}

export default function ImageLightbox({ images, startIndex = 0, onClose, onEdit, editLabel = 'Edit' }: ImageLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [zoom, setZoom] = useState<{ i: number; ox: number; oy: number } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const indexRef = useRef(startIndex);
  const lastTap = useRef(0);

  const goTo = useCallback(
    (i: number) => {
      const el = scroller.current;
      if (!el) return;
      const next = Math.max(0, Math.min(images.length - 1, i));
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    },
    [images.length]
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ left: startIndex * el.clientWidth, behavior: 'auto' });
  }, [startIndex]);

  useEffect(() => {
    indexRef.current = index;
    setZoom(null);
  }, [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goTo(indexRef.current + 1);
      else if (e.key === 'ArrowLeft') goTo(indexRef.current - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, onClose]);

  function onScroll() {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== indexRef.current) setIndex(i);
  }

  function handleImageTap(e: React.MouseEvent<HTMLImageElement>, i: number) {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (zoom && zoom.i === i) {
        setZoom(null);
      } else {
        const r = e.currentTarget.getBoundingClientRect();
        setZoom({ i, ox: ((e.clientX - r.left) / r.width) * 100, oy: ((e.clientY - r.top) / r.height) * 100 });
      }
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }

  if (images.length === 0) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-[400] bg-black flex flex-col">
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 pb-6 pt-3 safe-top bg-gradient-to-b from-black/80 to-transparent">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center active:scale-90 transition-transform"
        >
          ✕
        </button>
        {images.length > 1 ? (
          <span className="text-xs font-medium text-white/80">{index + 1} / {images.length}</span>
        ) : (
          <span />
        )}
        {onEdit ? (
          <button
            type="button"
            onClick={() => { onEdit(index); onClose(); }}
            className="h-10 rounded-full bg-white/10 px-4 text-sm font-semibold text-white flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            {editLabel}
          </button>
        ) : (
          <span className="w-10" />
        )}
      </div>

      <div
        ref={scroller}
        onScroll={onScroll}
        className={`flex-1 min-h-0 flex ${zoom ? 'overflow-hidden' : 'overflow-x-auto'} snap-x snap-mandatory scrollbar-hide`}
      >
        {images.map((src, i) => (
          <div
            key={i}
            onClick={onClose}
            className="h-full w-full shrink-0 snap-center flex items-center justify-center overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={optimizeImg(src, 1600)}
              alt=""
              draggable={false}
              onClick={(e) => handleImageTap(e, i)}
              className="max-h-full max-w-full object-contain select-none"
              style={{
                transform: zoom && zoom.i === i ? 'scale(2.4)' : 'scale(1)',
                transformOrigin: zoom && zoom.i === i ? `${zoom.ox}% ${zoom.oy}%` : 'center',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 inset-x-0 flex justify-center gap-1.5 safe-bottom pointer-events-none">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import ImageCropModal from '@/components/ImageCropModal';

const RATIOS: { id: string; label: string; value?: number }[] = [
  { id: 'orig', label: 'Original' },
  { id: 'sq', label: '1:1', value: 1 },
  { id: '43', label: '4:3', value: 4 / 3 },
  { id: '169', label: '16:9', value: 16 / 9 },
  { id: '34', label: '3:4', value: 3 / 4 },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('load failed'));
    img.src = src;
  });
}

export default function ImagePreviewSheet({
  file,
  confirmLabel = 'Use photo',
  busy = false,
  lockAspect,
  round = false,
  onCancel,
  onConfirm,
}: {
  file: File;
  confirmLabel?: string;
  busy?: boolean;
  lockAspect?: number;
  round?: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
}) {
  const [current, setCurrent] = useState<File>(file);
  const [natural, setNatural] = useState(4 / 3);
  const [ratioId, setRatioId] = useState('orig');
  const [cropping, setCropping] = useState(false);
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    setCurrent(file);
  }, [file]);

  const url = useMemo(() => URL.createObjectURL(current), [current]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const picked = RATIOS.find((r) => r.id === ratioId);
  const aspect = lockAspect ?? (ratioId === 'orig' ? natural : picked?.value ?? natural);

  async function rotate() {
    setRotating(true);
    try {
      const img = await loadImage(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (blob) {
        const base = current.name.replace(/\.[^.]+$/, '') || 'photo';
        setCurrent(new File([blob], `${base}.jpg`, { type: 'image/jpeg' }));
      }
    } catch {
      // leave the photo as it was
    } finally {
      setRotating(false);
    }
  }

  if (cropping) {
    return createPortal(
      <ImageCropModal
        imageSrc={url}
        aspect={aspect}
        cropShape={round ? 'round' : 'rect'}
        fileName={current.name}
        onCancel={() => setCropping(false)}
        onConfirm={(f: File) => {
          setCurrent(f);
          setCropping(false);
        }}
      />,
      document.body
    );
  }

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Preview photo" className="fixed inset-0 z-[400] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 safe-top">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center active:scale-90 transition-transform"
        >
          ✕
        </button>
        <span className="text-sm font-semibold text-white">Preview</span>
        <span className="w-10" />
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Preview"
          onLoad={(e) => {
            const el = e.currentTarget;
            if (el.naturalHeight > 0) setNatural(el.naturalWidth / el.naturalHeight);
          }}
          className={`max-h-full max-w-full object-contain ${round ? 'rounded-full' : 'rounded-lg'}`}
        />
      </div>

      <div className="px-4 pb-4 safe-bottom space-y-3">
        {!lockAspect && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {RATIOS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRatioId(r.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  ratioId === r.id ? 'bg-white text-black' : 'bg-white/10 text-white/80'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={rotate}
            disabled={rotating || busy}
            className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 11-3-6.7M21 4v5h-5" />
            </svg>
            {rotating ? 'Rotating...' : 'Rotate'}
          </button>
          <button
            type="button"
            onClick={() => setCropping(true)}
            disabled={rotating || busy}
            className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2v14a2 2 0 002 2h14M2 6h14a2 2 0 012 2v14" />
            </svg>
            Crop
          </button>
        </div>

        <button
          type="button"
          onClick={() => onConfirm(current)}
          disabled={busy || rotating}
          className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {busy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </div>,
    document.body
  );
}

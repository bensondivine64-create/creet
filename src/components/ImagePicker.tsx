'use client';
// preview-edit

import { useRef, useState } from 'react';
import { uploadListingImages } from '@/lib/listings';
import { useToast } from '@/contexts/ToastContext';
import { optimizeImg } from '@/lib/img';
import ImagePreviewSheet from '@/components/ImagePreviewSheet';
import ImageLightbox from '@/components/ImageLightbox';

interface ImagePickerProps {
  images: string[];
  onChange: (urls: string[]) => void;
  required?: boolean;
  max?: number;
  [extra: string]: unknown;
}

const MAX_BYTES = 8 * 1024 * 1024;

export default function ImagePicker({ images, onChange, required, max = 6 }: ImagePickerProps) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<File[]>([]);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    const room = max - images.length;
    const valid: File[] = [];
    for (const f of list) {
      if (!f.type.startsWith('image/')) {
        showToast(`${f.name} is not an image`, 'error');
        continue;
      }
      if (f.size > MAX_BYTES) {
        showToast(`${f.name} is over 8MB`, 'error');
        continue;
      }
      valid.push(f);
    }
    if (valid.length > room) showToast(`You can add up to ${max} photos`, 'info');
    const take = valid.slice(0, Math.max(room, 0));
    if (take.length > 0) {
      setReplaceIndex(null);
      setQueue(take);
    }
  }

  async function confirm(file: File) {
    setUploading(true);
    try {
      const urls = await uploadListingImages([file]);
      const url = urls[0];
      if (!url) throw new Error('Upload failed');
      if (replaceIndex !== null) {
        onChange(images.map((u, i) => (i === replaceIndex ? url : u)));
        setReplaceIndex(null);
        setQueue([]);
      } else {
        onChange([...images, url]);
        setQueue((q) => q.slice(1));
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not upload photo', 'error');
    } finally {
      setUploading(false);
    }
  }

  function cancel() {
    setQueue((q) => q.slice(1));
    setReplaceIndex(null);
  }

  async function startEdit(i: number) {
    try {
      const res = await fetch(images[i]);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
      setReplaceIndex(i);
      setQueue([new File([blob], `photo.${ext}`, { type: blob.type || 'image/jpeg' })]);
    } catch {
      showToast('Could not open this photo for editing', 'error');
    }
  }

  function remove(i: number) {
    onChange(images.filter((_, j) => j !== i));
  }

  const confirmLabel =
    replaceIndex !== null ? 'Save changes' : queue.length > 1 ? `Use photo (${queue.length - 1} more)` : 'Use photo';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-fg/70">Photos{required ? ' *' : ' (optional)'}</label>
        <span className="text-xs text-muted">{images.length}/{max}</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {images.map((url, i) => (
          <div key={`${url}-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-mist border border-line">
            <button type="button" onClick={() => setViewer(i)} className="block h-full w-full cursor-zoom-in" aria-label={`View photo ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={optimizeImg(url, 300)} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 left-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white pointer-events-none">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove photo"
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center active:scale-90 transition-transform"
            >
              ✕
            </button>
            <button
              type="button"
              onClick={() => startEdit(i)}
              aria-label="Edit photo"
              className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="ripple aspect-square rounded-xl border border-dashed border-line bg-mist text-muted flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-50"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-[11px]">{uploading ? 'Uploading...' : 'Add photos'}</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onSelect} className="hidden" />

      {required && images.length === 0 && <p className="text-xs text-muted mt-2">Add at least one photo to continue.</p>}

      {queue.length > 0 && (
        <ImagePreviewSheet
          key={`${queue[0].name}-${queue[0].size}-${queue.length}`}
          file={queue[0]}
          busy={uploading}
          confirmLabel={confirmLabel}
          onCancel={cancel}
          onConfirm={confirm}
        />
      )}

      {viewer !== null && images.length > 0 && (
        <ImageLightbox images={images} startIndex={viewer} onClose={() => setViewer(null)} onEdit={(i) => startEdit(i)} editLabel="Edit photo" />
      )}
    </div>
  );
}

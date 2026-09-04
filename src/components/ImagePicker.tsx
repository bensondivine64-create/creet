'use client';

import { useState } from 'react';
import { uploadListingImages } from '@/lib/listings';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api$/, '');

interface ImagePickerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImagePicker({ images, onChange }: ImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError('');
    setUploading(true);
    try {
      const urls = await uploadListingImages(Array.from(files));
      onChange([...images, ...urls].slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeImage(url: string) {
    onChange(images.filter((i) => i !== url));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-fg/70 mb-1">
        Photos <span className="text-muted font-normal">(optional)</span>
      </label>

      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <div key={url} className="relative h-20 w-20 rounded-lg overflow-hidden border border-line">
            <img src={`${API_ORIGIN}${url}`} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}

        {images.length < 6 && (
          <label className="h-20 w-20 rounded-lg border border-dashed border-line flex flex-col items-center justify-center text-muted text-xs cursor-pointer active:scale-95 transition-transform">
            {uploading ? (
              <span className="h-4 w-4 rounded-full border-2 border-blue/30 border-t-blue animate-spin-fast" />
            ) : (
              <>
                <span className="text-lg leading-none mb-0.5">+</span>
                Add
              </>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleFiles}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      <p className="text-xs text-muted mt-2">You can post without photos.</p>
    </div>
  );
}

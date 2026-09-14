'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImageBlob, CropArea } from '@/lib/cropImage';

interface ImageCropModalProps {
  imageSrc: string;
  aspect: number;
  cropShape?: 'round' | 'rect';
  fileName: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

export default function ImageCropModal({
  imageSrc,
  aspect,
  cropShape = 'rect',
  fileName,
  onCancel,
  onConfirm,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea: CropArea, croppedAreaPx: CropArea) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const file = await getCroppedImageBlob(imageSrc, croppedAreaPixels, fileName);
      onConfirm(file);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" style={{ height: '100dvh' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-line/60 shrink-0">
        <button onClick={onCancel} className="text-sm text-muted" disabled={processing}>
          Cancel
        </button>
        <span className="text-sm font-semibold text-fg">Adjust photo</span>
        <button
          onClick={handleConfirm}
          disabled={processing || !croppedAreaPixels}
          className="text-sm font-semibold text-blue disabled:opacity-40"
        >
          {processing ? 'Saving...' : 'Done'}
        </button>
      </div>

      <div className="relative flex-1 min-h-0 bg-black" style={{ position: 'relative' }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={cropShape === 'rect'}
          objectFit="horizontal-cover"
          minZoom={1}
          maxZoom={3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="px-6 py-5 shrink-0">
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-blue"
        />
        <p className="text-center text-xs text-muted mt-2">Drag to reposition, use the slider to zoom</p>
      </div>
    </div>
  );
}

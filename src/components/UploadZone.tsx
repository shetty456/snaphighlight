'use client';

import { useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useImage } from '@/context/ImageContext';
import { cn } from '@/lib/utils';
import { Upload, ImageIcon } from 'lucide-react';

export default function UploadZone() {
  const { setImage } = useImage();
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a PNG, JPEG, or WEBP image.');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataURL = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setImage(dataURL, img.naturalWidth, img.naturalHeight);
          router.push('/editor');
        };
        img.src = dataURL;
      };
      reader.readAsDataURL(file);
    },
    [setImage, router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'));
      const file = item?.getAsFile();
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onPaste={onPaste}
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'relative flex flex-col items-center justify-center gap-5',
        'w-full max-w-xl mx-auto h-64 rounded-3xl cursor-pointer select-none',
        'border-4 border-dashed outline-none transition-all duration-200',
        'focus-visible:ring-4 focus-visible:ring-[#58CC02]/40',
        dragging
          ? 'border-[#58CC02] bg-[#58CC02]/10 scale-[1.02]'
          : 'border-[#E5E5E5] bg-white hover:border-[#58CC02] hover:bg-[#58CC02]/5'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
      />
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        {dragging
          ? <ImageIcon className="w-12 h-12 text-[#58CC02]" />
          : <Upload className="w-12 h-12 text-[#777777]" />
        }
        <p className="text-lg font-extrabold text-[#1A1A1A]">
          {dragging ? 'Drop it!' : 'Drop a screenshot here'}
        </p>
        <p className="text-sm font-semibold text-[#777777]">
          or click to browse · paste with ⌘V
        </p>
      </div>
      {error && (
        <p className="absolute bottom-4 text-sm font-bold text-[#FF4B4B]">{error}</p>
      )}
    </div>
  );
}

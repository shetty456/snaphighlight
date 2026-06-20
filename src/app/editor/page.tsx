'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useImage } from '@/context/ImageContext';
import { Highlighter } from 'lucide-react';

const EditorCanvas = dynamic(() => import('@/components/EditorCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-sm font-semibold" style={{ color: '#777777' }}>
      Loading canvas…
    </div>
  ),
});

export default function EditorPage() {
  const { imageDataURL, imageDimensions, clearImage } = useImage();
  const router = useRouter();

  useEffect(() => {
    if (!imageDataURL) router.replace('/');
  }, [imageDataURL, router]);

  if (!imageDataURL || !imageDimensions) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#F7F7F7' }}>
        <p className="text-sm font-semibold" style={{ color: '#777777' }}>Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      <header className="flex items-center px-5 py-3 bg-white border-b" style={{ borderColor: '#E5E5E5' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#58CC02' }}>
            <Highlighter className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black" style={{ color: '#1A1A1A' }}>SnapHighlight</span>
        </div>
        <button
          onClick={() => { clearImage(); router.push('/'); }}
          className="ml-auto text-sm font-bold transition-colors"
          style={{ color: '#777777' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1A1A')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#777777')}
        >
          ← New image
        </button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <EditorCanvas
          imageDataURL={imageDataURL}
          origW={imageDimensions.width}
          origH={imageDimensions.height}
        />
      </div>
    </div>
  );
}

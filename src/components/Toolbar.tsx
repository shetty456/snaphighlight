'use client';

import { Undo2, Trash2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HighlightColor } from '@/types';

const COLORS: { id: HighlightColor; hex: string; label: string }[] = [
  { id: 'yellow', hex: '#FFC800', label: 'Yellow' },
  { id: 'green',  hex: '#58CC02', label: 'Green'  },
  { id: 'cyan',   hex: '#00C9E0', label: 'Cyan'   },
  { id: 'pink',   hex: '#FF9ECD', label: 'Pink'   },
];

interface ToolbarProps {
  activeColor: HighlightColor;
  onColorChange: (c: HighlightColor) => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
  canUndo: boolean;
  ocrDone: boolean;
}

export default function Toolbar({ activeColor, onColorChange, onUndo, onClear, onExport, canUndo, ocrDone }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-white border-b border-[#E5E5E5] shadow-sm">
      <div className="flex items-center gap-2">
        {COLORS.map(({ id, hex, label }) => (
          <button
            key={id}
            aria-label={label}
            onClick={() => onColorChange(id)}
            title={label}
            className={cn(
              'w-8 h-8 rounded-full border-[3px] transition-all duration-150 active:scale-90',
              activeColor === id
                ? 'border-[#1A1A1A] scale-110 shadow-md'
                : 'border-transparent hover:scale-105 hover:border-[#777]'
            )}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-[#E5E5E5] mx-1" />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-bold border-2 border-[#E5E5E5] text-[#1A1A1A] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#58CC02] hover:text-[#58CC02]"
      >
        <Undo2 className="w-4 h-4" /> Undo
      </button>

      <button
        onClick={onClear}
        className="flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-bold border-2 border-[#FF4B4B]/30 text-[#FF4B4B] transition-all active:scale-95 hover:bg-[#FF4B4B]/10"
      >
        <Trash2 className="w-4 h-4" /> Clear
      </button>

      <button
        onClick={onExport}
        disabled={!ocrDone}
        className="ml-auto flex items-center gap-2 px-5 h-10 rounded-full bg-[#58CC02] text-white font-extrabold text-sm shadow-[0_4px_0_0_#4CAD02] active:shadow-none active:translate-y-1 transition-[transform,box-shadow] duration-100 hover:bg-[#4CAD02] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        <Download className="w-4 h-4" /> Export PNG
      </button>
    </div>
  );
}

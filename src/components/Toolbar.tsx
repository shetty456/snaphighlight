'use client';

import type { HighlightColor } from '@/types';

const COLORS: { id: HighlightColor; hex: string; label: string }[] = [
  { id: 'yellow', hex: '#FFE500', label: 'Yellow' },
  { id: 'green',  hex: '#BEFF40', label: 'Green'  },
  { id: 'cyan',   hex: '#40E8FF', label: 'Cyan'   },
  { id: 'pink',   hex: '#FFB0D4', label: 'Pink'   },
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

const btn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '5px 12px',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  border: '1px solid #e8e8e5',
  background: '#ffffff',
  color: '#1a1a1a',
  transition: 'background 0.12s',
  whiteSpace: 'nowrap' as const,
};

export default function Toolbar({ activeColor, onColorChange, onUndo, onClear, onExport, canUndo, ocrDone }: ToolbarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 16px',
      borderBottom: '1px solid #e8e8e5',
      background: '#ffffff',
      flexWrap: 'wrap',
    }}>

      {/* Color swatches */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {COLORS.map(({ id, hex, label }) => (
          <button
            key={id}
            aria-label={label}
            title={label}
            onClick={() => onColorChange(id)}
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: hex,
              border: activeColor === id ? '2px solid #1a1a1a' : '2px solid transparent',
              cursor: 'pointer',
              outline: 'none',
              transition: 'transform 0.1s, border-color 0.1s',
              transform: activeColor === id ? 'scale(1.2)' : 'scale(1)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
            }}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 18, background: '#e8e8e5', margin: '0 2px' }} />

      {/* Undo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
        style={{
          ...btn,
          opacity: canUndo ? 1 : 0.35,
          cursor: canUndo ? 'pointer' : 'not-allowed',
        }}
        onMouseEnter={e => { if (canUndo) (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f5'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" /><path d="M3 13C5.2 7.5 11 4 17 5.3A9 9 0 0 1 21 13" />
        </svg>
        Undo
      </button>

      {/* Clear */}
      <button
        onClick={onClear}
        title="Remove all highlights"
        style={{ ...btn, color: '#e5484d' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff0f0'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
      >
        Clear
      </button>

      {/* Export — primary action, pushed right */}
      <button
        onClick={onExport}
        disabled={!ocrDone}
        style={{
          marginLeft: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 14px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          cursor: ocrDone ? 'pointer' : 'not-allowed',
          border: 'none',
          background: ocrDone ? '#1a1a1a' : '#e8e8e5',
          color: ocrDone ? '#ffffff' : '#9b9b9b',
          transition: 'background 0.12s',
        }}
        onMouseEnter={e => { if (ocrDone) (e.currentTarget as HTMLButtonElement).style.background = '#2d2d2d'; }}
        onMouseLeave={e => { if (ocrDone) (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export PNG
      </button>

    </div>
  );
}

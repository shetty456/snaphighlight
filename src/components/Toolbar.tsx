'use client';

import type { HighlightColor } from '@/types';

const HIGHLIGHT_COLORS: { id: HighlightColor; hex: string; label: string }[] = [
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
  wordCount: number;
}

const sep = (
  <div style={{ width: 1, height: 18, background: '#e8e8e5', margin: '0 4px', flexShrink: 0 }} />
);

export default function Toolbar({ activeColor, onColorChange, onUndo, onClear, onExport, canUndo, ocrDone, wordCount }: ToolbarProps) {
  const isRedact = activeColor === 'black';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '8px 14px',
      borderBottom: '1px solid #e8e8e5',
      background: '#ffffff',
      flexWrap: 'wrap',
      minHeight: 46,
    }}>

      {/* ── Highlight swatches ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <span style={{ fontSize: 11, color: '#9b9b9b', fontWeight: 500, marginRight: 6, letterSpacing: '0.02em' }}>
          Highlight
        </span>
        {HIGHLIGHT_COLORS.map(({ id, hex, label }) => {
          const isActive = activeColor === id;
          return (
            <button
              key={id}
              aria-label={`Highlight in ${label}`}
              title={label}
              onClick={() => onColorChange(id)}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: hex,
                border: isActive ? '2.5px solid #1a1a1a' : '2px solid transparent',
                cursor: 'pointer',
                outline: 'none',
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.1s, border-color 0.1s',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.10)',
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>

      {sep}

      {/* ── Redact tool ─────────────────────────────────────────── */}
      <button
        onClick={() => onColorChange('black')}
        aria-label="Redact — cover words with a solid black block"
        title="Redact — cover words you don't want to show"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          border: isRedact ? '1.5px solid #1a1a1a' : '1px solid #e8e8e5',
          background: isRedact ? '#1a1a1a' : '#ffffff',
          color: isRedact ? '#ffffff' : '#1a1a1a',
          transition: 'background 0.12s, color 0.12s, border-color 0.12s',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (!isRedact) {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = '#f7f7f5';
            el.style.borderColor = '#9b9b9b';
          }
        }}
        onMouseLeave={e => {
          if (!isRedact) {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = '#ffffff';
            el.style.borderColor = '#e8e8e5';
          }
        }}
      >
        {/* Solid black square icon */}
        <span style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: 2,
          background: isRedact ? '#ffffff' : '#1a1a1a',
          flexShrink: 0,
        }} />
        Redact
      </button>

      {sep}

      {/* ── History ─────────────────────────────────────────────── */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo last action"
        title="Undo"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          cursor: canUndo ? 'pointer' : 'not-allowed',
          border: '1px solid #e8e8e5',
          background: '#ffffff',
          color: '#1a1a1a',
          opacity: canUndo ? 1 : 0.35,
          transition: 'background 0.12s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { if (canUndo) (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f5'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6" /><path d="M3 13C5.2 7.5 11 4 17 5.3A9 9 0 0 1 21 13" />
        </svg>
        Undo
      </button>

      <button
        onClick={onClear}
        aria-label="Remove all highlights and redactions"
        title="Remove all highlights and redactions"
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          border: '1px solid #e8e8e5',
          background: '#ffffff',
          color: '#e5484d',
          transition: 'background 0.12s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff0f0'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
      >
        Clear all
      </button>

      {/* ── Word count — feedback that OCR worked ──────────────── */}
      {ocrDone && wordCount > 0 && (
        <span style={{ fontSize: 11, color: '#9b9b9b', marginLeft: 2 }}>
          {wordCount} words
        </span>
      )}

      {/* ── Export ──────────────────────────────────────────────── */}
      <button
        onClick={onExport}
        disabled={!ocrDone}
        aria-label="Export as PNG — downloads the image with highlights"
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
          background: ocrDone ? '#1a1a1a' : '#f0f0ee',
          color: ocrDone ? '#ffffff' : '#9b9b9b',
          transition: 'background 0.12s',
          flexShrink: 0,
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

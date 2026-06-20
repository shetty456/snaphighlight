'use client';

import type { HighlightColor } from '@/types';

export type ActiveTool = HighlightColor | 'erase';

const COLORS: { id: HighlightColor; hex: string; label: string }[] = [
  { id: 'yellow', hex: '#FFE500', label: 'Yellow' },
  { id: 'green',  hex: '#BEFF40', label: 'Green'  },
  { id: 'cyan',   hex: '#40E8FF', label: 'Cyan'   },
  { id: 'pink',   hex: '#FFB0D4', label: 'Pink'   },
];

interface ToolbarProps {
  activeTool: ActiveTool;
  onToolChange: (t: ActiveTool) => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
  canUndo: boolean;
  ocrDone: boolean;
  wordCount: number;
}

// Shared pill-button base style
function pillBase(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    border: active ? '1.5px solid #1a1a1a' : '1px solid #e8e8e5',
    background: active ? '#f0f0ee' : '#ffffff',
    color: '#1a1a1a',
    transition: 'background 0.1s, border-color 0.1s',
    userSelect: 'none' as const,
    whiteSpace: 'nowrap' as const,
  };
}

const Divider = () => (
  <div style={{ width: 1, height: 20, background: '#e8e8e5', flexShrink: 0 }} />
);

// Inline SVG icons — no library dependency
const UndoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" /><path d="M3 13C5.2 7.5 11 4 17 5.3A9 9 0 0 1 21 13" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const EraseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20H7L3 16l10-10 7 7-3.5 3.5" /><path d="M6.1 10.9 4 13" />
  </svg>
);

export default function Toolbar({ activeTool, onToolChange, onUndo, onClear, onExport, canUndo, ocrDone, wordCount }: ToolbarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '9px 14px',
      borderBottom: '1px solid #e8e8e5',
      background: '#ffffff',
      flexWrap: 'wrap',
    }}>

      {/* ── Color swatches ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {COLORS.map(({ id, hex, label }) => {
          const isActive = activeTool === id;
          return (
            <button
              key={id}
              aria-label={`${label} highlight`}
              title={`${label} highlight`}
              onClick={() => onToolChange(id)}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: hex,
                border: 'none',
                outline: isActive ? '2px solid #1a1a1a' : '2px solid transparent',
                outlineOffset: 2,
                cursor: 'pointer',
                transform: isActive ? 'scale(1.18)' : 'scale(1)',
                transition: 'transform 0.12s, outline-color 0.12s',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.09)',
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>

      <Divider />

      {/* ── Redact ─────────────────────────────────────────────────── */}
      <button
        onClick={() => onToolChange('black')}
        aria-label="Redact — cover words with a dark block"
        title="Redact — cover words you don't want to show"
        style={pillBase(activeTool === 'black')}
        onMouseEnter={e => { if (activeTool !== 'black') (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f5'; }}
        onMouseLeave={e => { if (activeTool !== 'black') (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
      >
        <span style={{ width: 10, height: 10, borderRadius: 2, background: '#2c2c2c', display: 'inline-block', flexShrink: 0 }} />
        Redact
      </button>

      {/* ── Erase ──────────────────────────────────────────────────── */}
      <button
        onClick={() => onToolChange('erase')}
        aria-label="Erase — click or drag over highlights to remove them"
        title="Erase highlights"
        style={pillBase(activeTool === 'erase')}
        onMouseEnter={e => { if (activeTool !== 'erase') (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f5'; }}
        onMouseLeave={e => { if (activeTool !== 'erase') (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
      >
        <EraseIcon />
        Erase
      </button>

      <Divider />

      {/* ── History ────────────────────────────────────────────────── */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo last action"
        title="Undo"
        style={{
          ...pillBase(false),
          opacity: canUndo ? 1 : 0.35,
          cursor: canUndo ? 'pointer' : 'not-allowed',
        }}
        onMouseEnter={e => { if (canUndo) (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f5'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; }}
      >
        <UndoIcon /> Undo
      </button>

      <button
        onClick={onClear}
        aria-label="Remove all highlights and redactions"
        title="Remove all"
        style={{ ...pillBase(false), color: '#e5484d', borderColor: '#fce8e8' }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background = '#fff5f5';
          el.style.borderColor = '#fca5a5';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background = '#ffffff';
          el.style.borderColor = '#fce8e8';
        }}
      >
        Clear all
      </button>

      {/* ── Word count — far from actions to avoid confusion ────────── */}
      {ocrDone && wordCount > 0 && (
        <span style={{ fontSize: 11, color: '#c0c0bc', marginLeft: 2, userSelect: 'none' }}>
          {wordCount} words
        </span>
      )}

      {/* ── Export — rightmost, primary action ─────────────────────── */}
      <button
        onClick={onExport}
        disabled={!ocrDone}
        aria-label="Export as PNG"
        style={{
          marginLeft: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 14px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: ocrDone ? 'pointer' : 'not-allowed',
          border: 'none',
          background: ocrDone ? '#1a1a1a' : '#f0f0ee',
          color: ocrDone ? '#ffffff' : '#9b9b9b',
          transition: 'background 0.1s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { if (ocrDone) (e.currentTarget as HTMLButtonElement).style.background = '#2d2d2d'; }}
        onMouseLeave={e => { if (ocrDone) (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'; }}
      >
        <DownloadIcon /> Export PNG
      </button>

    </div>
  );
}

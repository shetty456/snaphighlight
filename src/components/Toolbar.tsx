'use client';

import { useState, useRef, useEffect } from 'react';
import type { HighlightColor } from '@/types';

export type ActiveTool = HighlightColor | 'erase';

const COLORS: { id: HighlightColor; hex: string; label: string }[] = [
  { id: 'yellow', hex: '#FFE500', label: 'Yellow' },
  { id: 'green',  hex: '#BEFF40', label: 'Green'  },
  { id: 'cyan',   hex: '#40E8FF', label: 'Cyan'   },
  { id: 'pink',   hex: '#FFB0D4', label: 'Pink'   },
  { id: 'black',  hex: '#2c2c2c', label: 'Redact' },
];

interface ToolbarProps {
  activeTool: ActiveTool;
  onToolChange: (t: ActiveTool) => void;
  activeColor: HighlightColor;
  onColorChange: (c: HighlightColor) => void;
  onUndo: () => void;
  onClear: () => void;
  onExport: () => void;
  canUndo: boolean;
  ocrDone: boolean;
}

// ── Shared icon button ────────────────────────────────────────────────────────
function IconBtn({
  label, active = false, danger = false, disabled = false,
  onClick, children,
}: {
  label: string;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6,
        border: active ? '1.5px solid #1a1a1a' : '1px solid transparent',
        background: active ? '#f0f0ee' : 'transparent',
        color: danger ? '#e5484d' : '#3d3d3d',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'background 0.1s, border-color 0.1s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!disabled && !active) (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f3';
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.background = active ? '#f0f0ee' : 'transparent';
      }}
    >
      {children}
    </button>
  );
}

const Divider = () => (
  <div style={{ width: 1, height: 18, background: '#e8e8e5', margin: '0 2px', flexShrink: 0 }} />
);

// ── SVG icons (no library) ────────────────────────────────────────────────────
const HighlightIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    {/* Marker body */}
    <rect x="4" y="9" width="16" height="7" rx="2" fill={color} />
    {/* Nib */}
    <path d="M18 16 L20 20 L16 20 Z" fill={color} />
  </svg>
);

const RedactIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="8" width="18" height="8" rx="2" fill="#2c2c2c" />
  </svg>
);

const EraseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20H7L3 16l10-10 7 7-3.5 3.5" />
    <path d="M6.1 10.9 4 13" />
  </svg>
);

const UndoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" /><path d="M3 13C5.2 7.5 11 4 17 5.3A9 9 0 0 1 21 13" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ── Color picker popover ──────────────────────────────────────────────────────
function ColorPicker({
  activeColor,
  onChange,
  onClose,
}: {
  activeColor: HighlightColor;
  onChange: (c: HighlightColor) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 44, left: 0,
        background: '#ffffff',
        border: '1px solid #e8e8e5',
        borderRadius: 8,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        zIndex: 50,
        minWidth: 120,
      }}
    >
      <p style={{ fontSize: 10, color: '#9b9b9b', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
        Color
      </p>
      {COLORS.filter(c => c.id !== 'black').map(({ id, hex, label }) => (
        <button
          key={id}
          onClick={() => { onChange(id); onClose(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 6px',
            borderRadius: 5,
            border: 'none',
            background: activeColor === id ? '#f0f0ee' : 'transparent',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
          }}
          onMouseEnter={e => { if (activeColor !== id) (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f5'; }}
          onMouseLeave={e => { if (activeColor !== id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: hex, flexShrink: 0, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />
          <span style={{ fontSize: 13, color: '#1a1a1a', fontWeight: activeColor === id ? 500 : 400 }}>{label}</span>
          {activeColor === id && (
            <svg style={{ marginLeft: 'auto' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
export default function Toolbar({
  activeTool, onToolChange, activeColor, onColorChange,
  onUndo, onClear, onExport, canUndo, ocrDone,
}: ToolbarProps) {
  const [showPicker, setShowPicker] = useState(false);
  const colorHex = COLORS.find(c => c.id === activeColor)?.hex ?? '#FFE500';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      padding: '6px 12px',
      borderBottom: '1px solid #e8e8e5',
      background: '#ffffff',
      position: 'relative',
    }}>

      {/* ── Highlight tool — icon shows active color, click opens picker ── */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            if (activeTool !== 'erase' && activeTool !== 'black') {
              setShowPicker(p => !p);
            } else {
              onToolChange(activeColor);
              setShowPicker(true);
            }
          }}
          aria-label={`Highlight (${COLORS.find(c => c.id === activeColor)?.label ?? 'Yellow'})`}
          title="Highlight — click to change color"
          style={{
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 6,
            border: (activeTool !== 'erase' && activeTool !== 'black') ? '1.5px solid #1a1a1a' : '1px solid transparent',
            background: (activeTool !== 'erase' && activeTool !== 'black') ? '#f0f0ee' : 'transparent',
            cursor: 'pointer',
            transition: 'background 0.1s',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            const notActive = activeTool === 'erase' || activeTool === 'black';
            if (notActive) (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f3';
          }}
          onMouseLeave={e => {
            const notActive = activeTool === 'erase' || activeTool === 'black';
            if (notActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <HighlightIcon color={colorHex} />
        </button>

        {showPicker && (
          <ColorPicker
            activeColor={activeColor}
            onChange={c => { onColorChange(c); onToolChange(c); }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>

      {/* ── Redact ─────────────────────────────────────────────────────── */}
      <IconBtn label="Redact — cover words with a dark block" active={activeTool === 'black'} onClick={() => { onToolChange('black'); setShowPicker(false); }}>
        <RedactIcon />
      </IconBtn>

      {/* ── Erase ──────────────────────────────────────────────────────── */}
      <IconBtn label="Erase — click or drag to remove highlights" active={activeTool === 'erase'} onClick={() => { onToolChange('erase'); setShowPicker(false); }}>
        <EraseIcon />
      </IconBtn>

      <Divider />

      {/* ── Undo ───────────────────────────────────────────────────────── */}
      <IconBtn label="Undo" disabled={!canUndo} onClick={onUndo}>
        <UndoIcon />
      </IconBtn>

      {/* ── Clear all ──────────────────────────────────────────────────── */}
      <IconBtn label="Clear all highlights and redactions" danger onClick={onClear}>
        <TrashIcon />
      </IconBtn>

      {/* ── Export ─────────────────────────────────────────────────────── */}
      <button
        onClick={onExport}
        disabled={!ocrDone}
        aria-label="Export as PNG"
        title="Export PNG"
        style={{
          marginLeft: 'auto',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 6,
          fontSize: 12, fontWeight: 600,
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

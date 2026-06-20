'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useHighlights } from '@/hooks/useHighlights';
import { useOCR } from '@/hooks/useOCR';
import { useCanvasExport } from '@/hooks/useCanvasExport';
import { computeScale, toOriginalCoords } from '@/lib/scaleCoords';
import OCRLoader from './OCRLoader';
import Toolbar from './Toolbar';
import Toast from './Toast';
import type { TextWord, HighlightColor } from '@/types';

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#FFE500',
  green:  '#BEFF40',
  cyan:   '#40E8FF',
  pink:   '#FFB0D4',
};

const MAX_W = 900;
const MAX_H = 660;

// Find the word at a given point in display coords
function wordAtPoint(words: TextWord[], px: number, py: number, scale: number): TextWord | undefined {
  const ox = px / scale;
  const oy = py / scale;
  // 3px slop so small words are still easy to click
  return words.find(
    (w) => ox >= w.bbox.x0 - 3 && ox <= w.bbox.x1 + 3 && oy >= w.bbox.y0 - 3 && oy <= w.bbox.y1 + 3
  );
}

// Find all words whose bbox overlaps the given rect in display coords
function wordsInRect(words: TextWord[], rx: number, ry: number, rw: number, rh: number, scale: number): TextWord[] {
  const ox = rx / scale, oy = ry / scale, ow = rw / scale, oh = rh / scale;
  return words.filter(
    (w) => w.bbox.x0 < ox + ow && w.bbox.x1 > ox && w.bbox.y0 < oy + oh && w.bbox.y1 > oy
  );
}

interface MergedRect {
  key: string;
  x: number; y: number; width: number; height: number;
  color: HighlightColor;
}

// Group highlighted words by line, sort left-to-right within each line,
// then merge consecutive words into single rects.
// Adjacent words are merged when the gap between them is smaller than
// half the average word height (a typical inter-word space is ~0.25× height).
function buildMergedRects(
  highlightedWordIds: Set<string>,
  colorOf: Map<string, HighlightColor>,
  words: TextWord[],
  scale: number
): MergedRect[] {
  // Group highlighted words by lineId
  const byLine = new Map<string, TextWord[]>();
  for (const w of words) {
    if (!highlightedWordIds.has(w.id)) continue;
    if (!byLine.has(w.lineId)) byLine.set(w.lineId, []);
    byLine.get(w.lineId)!.push(w);
  }

  const rects: MergedRect[] = [];

  for (const [lineId, lineWords] of byLine) {
    lineWords.sort((a, b) => a.bbox.x0 - b.bbox.x0);

    const avgH = lineWords.reduce((s, w) => s + (w.bbox.y1 - w.bbox.y0), 0) / lineWords.length;
    const GAP = avgH * 0.8; // merge if inter-word gap < 80% of text height (covers normal spaces)

    let i = 0;
    while (i < lineWords.length) {
      let j = i;
      while (j + 1 < lineWords.length && lineWords[j + 1].bbox.x0 - lineWords[j].bbox.x1 < GAP) {
        j++;
      }
      const run = lineWords.slice(i, j + 1);
      rects.push({
        key: `${lineId}-${i}`,
        x: (run[0].bbox.x0 - 1) * scale,
        y: (Math.min(...run.map((w) => w.bbox.y0)) - 1) * scale,
        width: (run[j].bbox.x1 - run[0].bbox.x0 + 2) * scale,
        height: (Math.max(...run.map((w) => w.bbox.y1)) - Math.min(...run.map((w) => w.bbox.y0)) + 2) * scale,
        color: colorOf.get(run[0].id) ?? 'yellow',
      });
      i = j + 1;
    }
  }

  return rects;
}

interface Props {
  imageDataURL: string;
  origW: number;
  origH: number;
}

export default function EditorCanvas({ imageDataURL, origW, origH }: Props) {
  const scale = computeScale({ origW, origH, displayW: MAX_W, displayH: MAX_H });
  const displayW = Math.round(origW * scale);
  const displayH = Math.round(origH * scale);

  const stageRef = useRef<Konva.Stage | null>(null);
  const [htmlImage, setHtmlImage] = useState<HTMLImageElement | null>(null);
  const [hoverWord, setHoverWord] = useState<TextWord | null>(null);

  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const { words, status, progress, recognize } = useOCR();
  const { highlights, activeColor, setActiveColor, toggleWord, highlightWords, undo, clear, canUndo } = useHighlights();
  const { exportPNG, exported } = useCanvasExport();

  useEffect(() => {
    const img = new Image();
    img.onload = () => setHtmlImage(img);
    img.src = imageDataURL;
    recognize(imageDataURL);
  }, [imageDataURL, recognize]);

  const onMouseDown = useCallback((_e: KonvaEventObject<MouseEvent>) => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    isDragging.current = true;
    dragStart.current = pos;
    setDragRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  }, []);

  const [cursorStyle, setCursorStyle] = useState<'text' | 'default' | 'crosshair'>('default');

  const onMouseMove = useCallback((_e: KonvaEventObject<MouseEvent>) => {
    const pos = stageRef.current?.getPointerPosition();
    if (!pos) return;
    if (!isDragging.current || !dragStart.current) {
      const w = wordAtPoint(words, pos.x, pos.y, scale);
      setHoverWord(w ?? null);
      setCursorStyle(w ? 'text' : 'default');
      return;
    }
    const { x: sx, y: sy } = dragStart.current;
    setDragRect({
      x: Math.min(sx, pos.x), y: Math.min(sy, pos.y),
      width: Math.abs(pos.x - sx), height: Math.abs(pos.y - sy),
    });
    setHoverWord(null);
    setCursorStyle('crosshair');
  }, [words, scale]);

  const onMouseUp = useCallback((_e: KonvaEventObject<MouseEvent>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const pos = stageRef.current?.getPointerPosition();
    const wasDrag = dragRect && (dragRect.width > 6 || dragRect.height > 6);

    if (wasDrag && dragRect) {
      const hit = wordsInRect(words, dragRect.x, dragRect.y, dragRect.width, dragRect.height, scale);
      if (hit.length) highlightWords(hit, activeColor);
    } else if (pos) {
      const hit = wordAtPoint(words, pos.x, pos.y, scale);
      if (hit) toggleWord(hit, activeColor);
    }
    dragStart.current = null;
    setDragRect(null);
    setCursorStyle('default');
  }, [dragRect, words, scale, highlightWords, toggleWord, activeColor]);

  // Build render data
  const highlightedIds = new Set(highlights.map((h) => h.wordId));
  const colorOf = new Map(highlights.map((h) => [h.wordId, h.color]));
  const mergedRects = buildMergedRects(highlightedIds, colorOf, words, scale);

  // Ghost words during drag
  const ghostWords = dragRect
    ? wordsInRect(words, dragRect.x, dragRect.y, dragRect.width, dragRect.height, scale)
    : hoverWord ? [hoverWord] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        activeColor={activeColor}
        onColorChange={setActiveColor}
        onUndo={undo}
        onClear={clear}
        onExport={() => exportPNG(stageRef, origW, displayW)}
        canUndo={canUndo}
        ocrDone={status === 'done'}
      />

      {status === 'loading' && <OCRLoader progress={progress} />}

      {status === 'error' && (
        <div style={{ textAlign: 'center', padding: '10px 16px', fontSize: 13, color: '#e5484d', borderBottom: '1px solid #e8e8e5' }}>
          Couldn&apos;t detect text. Try a clearer screenshot with a light background.
        </div>
      )}

      {status === 'done' && (
        <div style={{ textAlign: 'center', padding: '7px 16px', fontSize: 12, color: '#9b9b9b', borderBottom: '1px solid #e8e8e5' }}>
          Click a word to highlight · drag to select a range · click again to remove
        </div>
      )}

      <div className="flex-1 overflow-auto flex items-center justify-center p-6" style={{ backgroundColor: '#f7f7f5' }}>
        <Stage
          ref={stageRef}
          width={displayW}
          height={displayH}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          style={{
            cursor: status === 'done' ? cursorStyle : 'default',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
          }}
        >
          {/* Image + confirmed highlights in same layer so multiply blends against image pixels */}
          <Layer>
            {htmlImage && (
              <KonvaImage image={htmlImage} width={displayW} height={displayH} listening={false} />
            )}
            {mergedRects.map((r) => (
              <Rect
                key={r.key}
                x={r.x} y={r.y} width={r.width} height={r.height}
                fill={HIGHLIGHT_COLORS[r.color]}
                globalCompositeOperation="multiply"
                cornerRadius={2}
                listening={false}
              />
            ))}
          </Layer>

          {/* Ghost highlights — hover word or drag preview */}
          <Layer listening={false}>
            {ghostWords
              .filter((w) => !highlightedIds.has(w.id))
              .map((w) => (
                <Rect
                  key={`ghost-${w.id}`}
                  x={(w.bbox.x0 - 1) * scale}
                  y={(w.bbox.y0 - 1) * scale}
                  width={(w.bbox.x1 - w.bbox.x0 + 2) * scale}
                  height={(w.bbox.y1 - w.bbox.y0 + 2) * scale}
                  fill="rgba(255,229,0,0.35)"
                  stroke="#FFD700"
                  strokeWidth={1}
                  cornerRadius={2}
                />
              ))}
            {dragRect && (dragRect.width > 6 || dragRect.height > 6) && (
              <Rect
                x={dragRect.x} y={dragRect.y} width={dragRect.width} height={dragRect.height}
                fill="rgba(88,204,2,0.07)"
                stroke="#58CC02"
                strokeWidth={1}
                dash={[5, 3]}
                cornerRadius={2}
              />
            )}
          </Layer>
        </Stage>
      </div>

      <Toast visible={exported} />
    </div>
  );
}

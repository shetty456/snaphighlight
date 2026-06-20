'use client';

import { motion } from 'framer-motion';
import UploadZone from '@/components/UploadZone';
import { Highlighter } from 'lucide-react';

const PILLS = [
  '100% in-browser',
  'No uploads to server',
  'OCR-powered snap',
  'Export as PNG',
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-20" style={{ backgroundColor: '#F7F7F7' }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-xl flex flex-col items-center gap-8"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: '#58CC02', boxShadow: '0 6px 0 0 #4CAD02' }}
          >
            <Highlighter className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black leading-none" style={{ color: '#1A1A1A' }}>
              SnapHighlight
            </h1>
            <p className="text-sm font-semibold mt-0.5" style={{ color: '#777777' }}>
              Highlight what matters. Export instantly.
            </p>
          </div>
        </div>

        <div className="w-full">
          <p className="text-center text-base font-bold mb-5" style={{ color: '#1A1A1A' }}>
            Upload a screenshot. Click the lines you want to highlight. Done.
          </p>
          <UploadZone />
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {PILLS.map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 text-xs font-bold rounded-full border"
              style={{ backgroundColor: 'white', borderColor: '#E5E5E5', color: '#777777' }}
            >
              {f}
            </span>
          ))}
        </div>
      </motion.div>
    </main>
  );
}

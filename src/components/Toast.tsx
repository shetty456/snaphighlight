'use client';

import { CheckCircle } from 'lucide-react';

export default function Toast({ visible, message = 'PNG exported! Ready to post.' }: { visible: boolean; message?: string }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#58CC02] text-white font-extrabold shadow-xl animate-toast pointer-events-none">
      <CheckCircle className="w-5 h-5" />
      {message}
    </div>
  );
}

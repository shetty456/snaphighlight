'use client';

export default function OCRLoader({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center gap-3 py-5">
      <div className="relative w-52 h-3 bg-[#E5E5E5] rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-[#58CC02] rounded-full transition-all duration-200"
          style={{ width: `${Math.max(progress, 4)}%` }}
        />
      </div>
      <p className="text-sm font-bold text-[#777777]">
        Reading text… {progress}%
      </p>
    </div>
  );
}

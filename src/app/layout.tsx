import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { ImageProvider } from '@/context/ImageContext';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SnapHighlight — Precision text highlighter for screenshots',
  description: 'Upload a screenshot, snap-highlight lines with OCR precision, export as PNG.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.className} h-full`}>
      <body className="min-h-full flex flex-col">
        <ImageProvider>{children}</ImageProvider>
      </body>
    </html>
  );
}

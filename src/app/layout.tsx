import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { Toaster } from 'sonner';
import { TopLoader } from '@/components/top-loader';
import { ScrollToTop } from '@/components/scroll-to-top';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MangaKu - Baca Manga Online',
  description: 'Tempat baca manga online bahasa Indonesia gratis',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <Providers>
          <Suspense fallback={null}>
            <TopLoader />
            <ScrollToTop />
          </Suspense>
          {children}
        </Providers>
        <Toaster 
          theme="dark" 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(222 47% 7%)',
              border: '1px solid hsl(217 33% 15%)',
              color: 'white',
            },
          }}
        />
      </body>
    </html>
  );
}

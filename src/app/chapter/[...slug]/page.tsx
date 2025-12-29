'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useCallback } from 'react';
import { getChapter } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const slugParts = params.slug as string[];
  const slug = slugParts?.join('/') || '';

  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ['chapter', slug],
    queryFn: () => getChapter(slug),
    enabled: !!slug,
  });

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!chapter) return;

      if (e.key === 'ArrowLeft' && chapter.prevChapter) {
        router.push(`/chapter/${chapter.prevChapter}`);
      } else if (e.key === 'ArrowRight' && chapter.nextChapter) {
        router.push(`/chapter/${chapter.nextChapter}`);
      }
    },
    [chapter, router]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container max-w-4xl py-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full aspect-[2/3]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">😕</p>
          <h1 className="text-xl font-semibold mb-2">Chapter Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-4">
            Chapter yang kamu cari tidak ada.
          </p>
          <Link href="/">
            <Button>Kembali ke Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/40">
        <div className="container flex items-center justify-between h-14 gap-4">
          <Link href="/" className="text-xl font-bold shrink-0">
            🎌
          </Link>

          <h1 className="text-sm font-medium truncate flex-1 text-center">
            {chapter.title}
          </h1>

          <div className="flex items-center gap-2 shrink-0">
            {chapter.prevChapter && (
              <Link href={`/chapter/${chapter.prevChapter}`}>
                <Button variant="outline" size="sm">
                  ← Prev
                </Button>
              </Link>
            )}
            {chapter.nextChapter && (
              <Link href={`/chapter/${chapter.nextChapter}`}>
                <Button variant="outline" size="sm">
                  Next →
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Images */}
      <main className="container max-w-4xl py-4">
        {chapter.images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Tidak ada gambar tersedia untuk chapter ini.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {chapter.images.map((src, index) => (
              <div key={index} className="relative w-full">
                <Image
                  src={src}
                  alt={`Page ${index + 1}`}
                  width={800}
                  height={1200}
                  className="w-full h-auto"
                  loading={index < 3 ? 'eager' : 'lazy'}
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border/40">
        <div className="container flex items-center justify-center gap-4 h-14">
          {chapter.prevChapter ? (
            <Link href={`/chapter/${chapter.prevChapter}`}>
              <Button variant="outline">
                ← Chapter Sebelumnya
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled>
              ← Chapter Sebelumnya
            </Button>
          )}

          {chapter.nextChapter ? (
            <Link href={`/chapter/${chapter.nextChapter}`}>
              <Button>
                Chapter Selanjutnya →
              </Button>
            </Link>
          ) : (
            <Button disabled>
              Chapter Selanjutnya →
            </Button>
          )}
        </div>
      </footer>

      {/* Keyboard hint */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
        Gunakan ← → untuk navigasi
      </div>
    </div>
  );
}

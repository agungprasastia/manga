'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useCallback, useState } from 'react';
import { getChapter } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, ChevronLeft, ChevronRight, BookOpen, Loader2, FileQuestion } from 'lucide-react';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source') as 'komiku' | 'kiryuu' | undefined;
  const coverParam = searchParams.get('cover'); // Get cover param

  const slugParts = params.slug as string[];
  const slug = slugParts?.join('/') || '';
  const [showUI, setShowUI] = useState(true);
  const [progress, setProgress] = useState(0);

  const { data: chapterData, isLoading: isChapterLoading, error: chapterError } = useQuery({
    queryKey: ['chapter', slug, source],
    queryFn: () => getChapter(slug, source),
    enabled: !!slug,
  });

  // Fetch manga details to get full chapter list for fallback navigation (future enhancement)
  // const { data: manga } = useQuery({ ... });

  const chapter = chapterData;
  const isLoading = isChapterLoading;
  const error = chapterError;

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setProgress(Math.min(100, Math.max(0, progress)));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!chapter) return;
      if (e.key === 'ArrowLeft' && chapter.prevChapter) {
        router.push(`/chapter/${chapter.prevChapter}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`);
      }
      else if (e.key === 'ArrowRight' && chapter.nextChapter) {
        router.push(`/chapter/${chapter.nextChapter}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`);
      }
    },
    [chapter, router, source, coverParam]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-center space-y-6">
          <div className="p-6 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full 
            w-24 h-24 mx-auto flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <div>
            <p className="text-white font-medium text-lg mb-2">Memuat Chapter</p>
            <p className="text-muted-foreground text-sm">Tunggu sebentar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="p-6 bg-red-500/10 rounded-full w-24 h-24 mx-auto 
            flex items-center justify-center">
            <FileQuestion className="w-12 h-12 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white mb-2">Chapter Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-6">Chapter mungkin sudah dihapus atau tidak tersedia.</p>
          </div>
          <Link href="/">
            <Button className="rounded-full px-8 bg-gradient-to-r from-primary to-blue-500 
              hover:shadow-lg hover:shadow-primary/30">
              <Home className="w-4 h-4 mr-2" /> Kembali ke Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      
      {/* Progress Bar - Gradient */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-white/5">
        <div 
          className="h-full bg-gradient-to-r from-primary via-blue-500 to-primary 
            transition-all duration-150 ease-out shadow-[0_0_15px_theme(colors.primary.DEFAULT)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top Navigation - Glassmorphism */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out 
        ${showUI ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="bg-black/70 backdrop-blur-2xl border-b border-white/10">
          <div className="container flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (chapter?.mangaSlug) {
                    router.push(`/manga/${chapter.mangaSlug}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`);
                  } else {
                    router.back();
                  }
                }}
                className="gap-2 rounded-full text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
            </div>

            <div className="flex-1 text-center min-w-0">
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h1 className="text-sm font-medium truncate text-white/90">
                  {chapter.title}
                </h1>
              </div>
              <p className="text-xs text-white/40 truncate hidden sm:block mt-0.5">
                {progress < 100 ? `${Math.round(progress)}% Selesai` : '✓ Selesai'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" 
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                  <Home className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (Images) */}
      <main 
        className="container max-w-3xl py-0 pb-32 min-h-screen cursor-pointer"
        onClick={() => setShowUI(!showUI)}
      >
        {chapter.images.length === 0 ? (
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <FileQuestion className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada gambar tersedia.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0.5 md:space-y-1 shadow-2xl bg-black">
            {chapter.images.map((src, index) => (
              <div key={index} className="relative w-full">
                <Image
                  src={src}
                  alt={`Page ${index + 1}`}
                  width={800}
                  height={1200}
                  className="w-full h-auto block"
                  loading={index < 3 ? 'eager' : 'lazy'}
                  unoptimized
                  quality={90}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation - Enhanced */}
      <footer className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out 
        ${showUI ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="bg-black/70 backdrop-blur-2xl border-t border-white/10 pb-6 pt-4">
          <div className="container max-w-2xl flex items-center justify-between gap-3">
            
            <Button 
              variant="outline" 
              disabled={!chapter.prevChapter}
              onClick={(e) => {
                e.stopPropagation();
                if(chapter.prevChapter) router.push(`/chapter/${chapter.prevChapter}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`);
              }}
              className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 text-white 
                hover:bg-white/10 hover:border-white/20
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Prev Chapter</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            <div className="text-[10px] text-center text-white/30 px-2 hidden md:block w-48">
              Tap tengah layar untuk toggle menu<br/>
              Gunakan ← → untuk navigasi
            </div>

            <Button 
              disabled={!chapter.nextChapter}
              onClick={(e) => {
                e.stopPropagation();
                if(chapter.nextChapter) router.push(`/chapter/${chapter.nextChapter}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`);
              }}
              className="flex-1 h-12 rounded-xl
                bg-gradient-to-r from-primary to-blue-500 
                hover:from-primary/90 hover:to-blue-400
                shadow-lg shadow-primary/20
                disabled:opacity-30 disabled:cursor-not-allowed
                disabled:from-gray-500 disabled:to-gray-600"
            >
              <span className="hidden sm:inline">Next Chapter</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>

          </div>
        </div>
      </footer>

    </div>
  );
}

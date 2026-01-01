'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useCallback, useState, useRef } from 'react';
import { getChapter, getMangaDetail } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, ChevronLeft, ChevronRight, BookOpen, Loader2, FileQuestion, ChevronDown, X } from 'lucide-react';
import { saveReadingProgress, type ReadingProgress } from '@/hooks/use-reading-progress';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source') as 'komiku' | 'softkomik' | undefined;
  const coverParam = searchParams.get('cover'); // Get cover param

  const slugParts = params.slug as string[];
  const slug = slugParts?.join('/') || '';
  const [showUI, setShowUI] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesContainerRef = useRef<HTMLDivElement>(null);

  const { data: chapterData, isLoading: isChapterLoading, error: chapterError } = useQuery({
    queryKey: ['chapter', slug, source],
    queryFn: () => getChapter(slug, source),
    enabled: !!slug,
  });

  // Fetch manga details to get full chapter list for fallback navigation
  const { data: manga } = useQuery({
    queryKey: ['manga', chapterData?.mangaSlug, source],
    queryFn: () => getMangaDetail(chapterData!.mangaSlug!, source),
    enabled: !!chapterData?.mangaSlug,
  });

  const chapter = chapterData;
  const isLoading = isChapterLoading;
  const error = chapterError;

  // Calculate navigation from full chapter list (more reliable)
  let prevChapterSlug = chapter?.prevChapter;
  let nextChapterSlug = chapter?.nextChapter;



  if (manga && manga.chapters.length > 0) {
    // Try exact match first
    let currentIndex = manga.chapters.findIndex(c => c.slug === slug);
    
    // If not found, try partial match (slug might have different prefix/suffix)
    if (currentIndex === -1) {
      currentIndex = manga.chapters.findIndex(c => 
        slug.includes(c.slug) || c.slug.includes(slug) ||
        slug.endsWith(c.slug.split('/').pop() || '') || 
        c.slug.endsWith(slug.split('/').pop() || '')
      );
    }
    


    if (currentIndex !== -1) {
      // Chapters are usually listed newest first (index 0) to oldest
      // So Next (newer) is index - 1, Prev (older) is index + 1
      const nextIndex = currentIndex - 1;
      const prevIndex = currentIndex + 1;

      if (nextIndex >= 0) {
        nextChapterSlug = manga.chapters[nextIndex].slug;
      }
      // Keep API value if at newest chapter (don't set to undefined)
      
      if (prevIndex < manga.chapters.length) {
        prevChapterSlug = manga.chapters[prevIndex].slug;
      }
      // Keep API value if at oldest chapter (don't set to undefined)
      

    }
  }
  


  // Helper function to build chapter URL with proper query string
  const buildChapterUrl = useCallback((chapterSlug: string) => {
    const params = new URLSearchParams();
    if (source) params.set('source', source);
    if (coverParam) params.set('cover', coverParam);
    const queryString = params.toString();
    return `/chapter/${chapterSlug}${queryString ? `?${queryString}` : ''}`;
  }, [source, coverParam]);

  // Handle scroll progress and current page tracking
  useEffect(() => {
    let saveTimeout: NodeJS.Timeout;
    
    const calculateCurrentPage = () => {
      if (!imagesContainerRef.current || !chapter?.images?.length) return 1;
      
      const images = imagesContainerRef.current.querySelectorAll('[data-page-index]');
      const viewportMiddle = window.scrollY + window.innerHeight / 2;
      
      let currentPageIndex = 0;
      images.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        const imgTop = window.scrollY + rect.top;
        const imgBottom = imgTop + rect.height;
        
        if (viewportMiddle >= imgTop && viewportMiddle <= imgBottom) {
          currentPageIndex = index;
        }
      });
      
      return currentPageIndex + 1;
    };

    const saveProgress = () => {
      if (!chapter || !manga) return;
      
      const progressData: ReadingProgress = {
        mangaSlug: chapterData?.mangaSlug || slug.split('/')[1] || '',
        mangaTitle: manga.title,
        mangaCover: coverParam || manga.cover || '',
        chapterSlug: slug,
        chapterTitle: chapter.title,
        currentPage: currentPage,
        totalPages: chapter.images?.length || 0,
        timestamp: Date.now(),
        source: source || undefined,
      };
      
      saveReadingProgress(progressData);
    };
    
    const handleScroll = () => {
      // Calculate progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progressPercent = (window.scrollY / totalHeight) * 100;
      setProgress(Math.min(100, Math.max(0, progressPercent)));
      
      // Calculate current page
      const page = calculateCurrentPage();
      setCurrentPage(page);
      
      // Debounced save to localStorage
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveProgress, 1000);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Save on page unload
    const handleBeforeUnload = () => {
      saveProgress();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(saveTimeout);
    };
  }, [chapter, manga, slug, source, coverParam, currentPage]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!chapter) return;
      if (e.key === 'ArrowLeft' && prevChapterSlug) {
        router.push(buildChapterUrl(prevChapterSlug));
      }
      else if (e.key === 'ArrowRight' && nextChapterSlug) {
        router.push(buildChapterUrl(nextChapterSlug));
      }
    },
    [chapter, router, source, coverParam, prevChapterSlug, nextChapterSlug]
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
          <div className="container flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 px-3 sm:px-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  router.back();
                }}
                className="gap-1 sm:gap-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 h-8 sm:h-9 px-2 sm:px-3"
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Kembali</span>
              </Button>
            </div>

            <div className="flex-1 text-center min-w-0 px-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChapterList(!showChapterList);
                }}
                className="flex items-center justify-center gap-1.5 sm:gap-2 mx-auto hover:bg-white/10 rounded-lg px-2 py-1 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <h1 className="text-xs sm:text-sm font-medium truncate text-white/90 max-w-[120px] sm:max-w-[200px]">
                  {chapter.title}
                </h1>
                <ChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${showChapterList ? 'rotate-180' : ''}`} />
              </button>
              <p className="text-[10px] sm:text-xs text-white/60 mt-0.5">
                Hal {currentPage}/{chapter.images?.length || 0} • {progress < 100 ? `${Math.round(progress)}%` : '✓'}
              </p>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" 
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 sm:h-9 sm:w-9">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Chapter List Dropdown */}
      {showChapterList && manga && (
        <div 
          className={`fixed top-14 sm:top-16 left-0 right-0 z-40 transition-all duration-300
            ${showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl max-h-[50vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="text-sm font-medium text-white">Daftar Chapter ({manga.chapters.length})</span>
              <button 
                onClick={() => setShowChapterList(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {manga.chapters.map((ch, index) => {
                const isCurrentChapter = ch.slug === slug || slug.includes(ch.slug) || ch.slug.includes(slug);
                return (
                  <button
                    key={ch.slug}
                    onClick={() => {
                      setShowChapterList(false);
                      router.push(buildChapterUrl(ch.slug));
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-white/5
                      ${isCurrentChapter ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-white/70 hover:text-white'}`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                      ${isCurrentChapter ? 'bg-primary text-white' : 'bg-white/10 text-white/50'}`}>
                      {manga.chapters.length - index}
                    </span>
                    <span className="text-sm truncate">{ch.title}</span>
                    {isCurrentChapter && (
                      <span className="ml-auto text-[10px] bg-primary/30 text-primary px-2 py-0.5 rounded-full shrink-0">
                        Sedang dibaca
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content (Images) */}
      <main 
        className="container max-w-3xl py-0 pb-24 sm:pb-28 md:pb-32 min-h-screen px-0"
        onClick={() => setShowUI(!showUI)}
      >
        {chapter.images.length === 0 ? (
          <div className="flex h-screen items-center justify-center px-4">
            <div className="text-center">
              <FileQuestion className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">Tidak ada gambar tersedia.</p>
            </div>
          </div>
        ) : (
          <div ref={imagesContainerRef} className="space-y-0 sm:space-y-0.5 md:space-y-1 shadow-2xl bg-black">
            {chapter.images.map((src, index) => (
              <div key={index} className="relative w-full" data-page-index={index}>
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
        <div className="bg-black/70 backdrop-blur-2xl border-t border-white/10 pb-4 sm:pb-6 pt-3 sm:pt-4">
          <div className="container max-w-2xl flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4">
            
            <Button 
              variant="outline" 
              disabled={!prevChapterSlug}
              onClick={(e) => {
                e.stopPropagation();
                if(prevChapterSlug) router.push(buildChapterUrl(prevChapterSlug));
              }}
              className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-white/5 border-white/10 text-white 
                hover:bg-white/10 hover:border-white/20 cursor-pointer
                disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Prev Chapter</span>
              <span className="sm:hidden">Prev</span>
            </Button>

            <div className="text-[9px] sm:text-[10px] text-center text-white/30 px-1 sm:px-2 hidden md:block w-32 sm:w-48">
              Gunakan ← → untuk navigasi<br className="hidden lg:block"/>
              <span className="lg:hidden">Tap untuk toggle</span>
            </div>

            <Button 
              disabled={!nextChapterSlug}
              onClick={(e) => {
                e.stopPropagation();
                if(nextChapterSlug) router.push(buildChapterUrl(nextChapterSlug));
              }}
              className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl cursor-pointer
                bg-gradient-to-r from-primary to-blue-500 
                hover:from-primary/90 hover:to-blue-400
                shadow-lg shadow-primary/20
                disabled:opacity-30 disabled:cursor-not-allowed
                disabled:from-gray-500 disabled:to-gray-600 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Next Chapter</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 sm:ml-1" />
            </Button>

          </div>
        </div>
      </footer>

    </div>
  );
}

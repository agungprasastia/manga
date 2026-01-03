'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMangaDetail } from '@/lib/api';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Pen, MapPin, Star, BookOpen, Zap, Library, FileQuestion, Clock, Eye, Bookmark, BookmarkCheck, AlertTriangle } from 'lucide-react';
import { useFadeIn } from '@/hooks/use-anime';
import { useBookmarks, type BookmarkedManga } from '@/hooks/use-bookmarks';
import { Breadcrumb } from '@/components/breadcrumb';
import { toast } from 'sonner';

// 18+ content genres to check for
const ADULT_GENRES = ['adult', 'mature', 'ecchi', 'smut', 'hentai', '18+', 'gore', 'erotica'];

export default function MangaDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const searchParams = useSearchParams();
  const source = searchParams.get('source') as 'komikcast' | 'komiku' | undefined;

  const { data: mangaData, isLoading, error } = useQuery({
    queryKey: ['manga', slug, source],
    queryFn: () => getMangaDetail(slug, source),
    enabled: !!slug,
  });

  // Always use cover from API response to match the selected source
  const manga = mangaData;

  // Anime.js fade-in animation for cover (must be called before conditional returns)
  const coverRef = useFadeIn<HTMLDivElement>([mangaData], { from: 'scale', duration: 600 });

  // Bookmark functionality
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();
  const bookmarked = manga ? isBookmarked(slug) : false;

  // 18+ content warning state
  const [showAdultWarning, setShowAdultWarning] = useState(false);
  const router = useRouter();

  // Check if user already accepted warning for this manga (persists during session)
  const sessionKey = `adult-accepted-${slug}`;
  const [adultWarningAccepted, setAdultWarningAccepted] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(sessionKey) === 'true';
    }
    return false;
  });

  // Check if manga contains adult content
  const isAdultContent = manga?.genres?.some(genre => 
    ADULT_GENRES.includes(genre.toLowerCase())
  ) ?? false;

  // Show warning on first load if adult content detected and not yet accepted
  useEffect(() => {
    if (manga && isAdultContent && !adultWarningAccepted) {
      setShowAdultWarning(true);
    }
  }, [manga, isAdultContent, adultWarningAccepted]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Background Skeleton */}
        <div className="h-[60px] md:h-[80px] bg-muted/20" />
        
        <main className="container max-w-6xl -mt-6 sm:-mt-8 md:-mt-12 relative z-10 pb-12 sm:pb-16 px-3 sm:px-4 md:px-6">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 py-4 mb-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 mb-8 sm:mb-10">
            {/* Cover Skeleton */}
            <div className="w-40 sm:w-48 md:w-72 shrink-0 mx-auto md:mx-0 space-y-4">
              <Skeleton className="w-full aspect-[2/3] rounded-xl" />
              <Skeleton className="w-full h-12 rounded-xl" />
              <Skeleton className="w-full h-12 rounded-xl" />
              <Skeleton className="w-full h-12 rounded-xl" />
            </div>
            
            {/* Info Skeleton */}
            <div className="flex-1 space-y-4">
              {/* Type Badge */}
              <Skeleton className="h-6 w-20 rounded-full" />
              
              {/* Title */}
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              
              {/* Meta Info */}
              <div className="flex gap-3">
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              
              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
              
              {/* Synopsis */}
              <div className="bg-white/5 rounded-2xl p-6 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
          
          {/* Chapter List Skeleton */}
          <div className="bg-card border border-white/10 rounded-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20 ml-auto rounded-full" />
              </div>
            </div>
            <div className="space-y-0 divide-y divide-white/5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-32 sm:w-48" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-6xl py-8">
          <div className="text-center py-24 flex flex-col items-center">
            <div className="p-6 bg-muted/30 rounded-full mb-6">
              <FileQuestion className="w-16 h-16 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Manga Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              Manga yang kamu cari tidak ada atau sudah dihapus dari database.
            </p>
            <Link href="/">
              <Button size="lg" className="rounded-full px-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const firstChapter = manga.chapters[manga.chapters.length - 1];
  const lastChapter = manga.chapters[0];

  // Helper function to build chapter URL with proper query string
  const buildChapterUrl = (chapterSlug: string) => {
    const params = new URLSearchParams();
    if (manga?.source) params.set('source', manga.source);
    if (manga?.cover) params.set('cover', manga.cover);
    const queryString = params.toString();
    return `/chapter/${chapterSlug}${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* 18+ Content Warning Modal */}
      {showAdultWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-red-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-red-500/20 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              {/* Warning Icon */}
              <div className="p-4 bg-red-500/20 rounded-full mb-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              
              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-2">
                Konten Dewasa (18+)
              </h2>
              
              {/* Message */}
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                Manga ini mengandung konten dewasa yang tidak sesuai untuk anak di bawah umur. 
                Dengan melanjutkan, Anda menyatakan bahwa Anda berusia <span className="text-white font-semibold">18 tahun atau lebih</span>.
              </p>
              
              {/* Content warning badges */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {manga?.genres?.filter(g => ADULT_GENRES.includes(g.toLowerCase())).map(genre => (
                  <Badge key={genre} className="bg-red-500/20 text-red-400 border-red-500/30">
                    {genre}
                  </Badge>
                ))}
              </div>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  variant="outline"
                  className="flex-1 border-white/20 hover:bg-white/10"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => {
                    sessionStorage.setItem(sessionKey, 'true');
                    setAdultWarningAccepted(true);
                    setShowAdultWarning(false);
                  }}
                >
                  Saya 18+ Tahun
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Background - Minimal */}
      <div className="relative h-[60px] md:h-[80px] overflow-hidden">
        <Image
          src={manga.cover || '/placeholder.jpg'}
          alt={manga.title}
          fill
          className="object-cover blur-2xl opacity-20 scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/50" />
      </div>

      <main className="container max-w-6xl -mt-6 sm:-mt-8 md:-mt-12 relative z-10 pb-12 sm:pb-16 px-3 sm:px-4 md:px-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={[{ label: manga.title }]} />

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Cover with Glow */}
          <div ref={coverRef} className="w-40 sm:w-48 md:w-72 shrink-0 mx-auto md:mx-0">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary via-purple-500 to-primary 
                rounded-2xl opacity-75 blur-lg group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={manga.cover || '/placeholder.jpg'}
                  alt={manga.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              {firstChapter && (
                <Link href={buildChapterUrl(firstChapter.slug)} className="block">
                  <Button className="w-full h-10 sm:h-12 rounded-xl text-sm sm:text-base font-semibold
                    bg-gradient-to-r from-primary to-blue-500 
                    hover:shadow-lg hover:shadow-primary/30
                    transition-all hover:-translate-y-0.5" size="lg">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Mulai Baca
                  </Button>
                </Link>
              )}
              {lastChapter && lastChapter !== firstChapter && (
                <Link href={buildChapterUrl(lastChapter.slug)} className="block">
                  <Button variant="outline" className="w-full h-10 sm:h-12 rounded-xl text-sm sm:text-base font-semibold
                    border-white/20 bg-white/5 backdrop-blur-sm
                    hover:bg-white/10 hover:border-white/30
                    transition-all" size="lg">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Chapter Terbaru
                  </Button>
                </Link>
              )}
              
              {/* Bookmark Button */}
              <Button 
                variant="outline" 
                className={`w-full h-10 sm:h-12 rounded-xl text-sm sm:text-base font-semibold
                  border-white/20 backdrop-blur-sm transition-all ${
                    bookmarked 
                      ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30' 
                      : 'bg-white/5 hover:bg-white/10 hover:border-white/30'
                  }`}
                size="lg"
                onClick={() => {
                  if (!manga) return;
                  const bookmarkData: BookmarkedManga = {
                    slug: slug,
                    title: manga.title,
                    cover: manga.cover,
                    type: manga.type,
                    rating: manga.rating,
                    latestChapter: lastChapter?.title,
                    source: manga.source,
                    addedAt: Date.now(),
                  };
                  toggleBookmark(bookmarkData);
                  if (bookmarked) {
                    toast.success('Dihapus dari bookmark', { duration: 2000 });
                  } else {
                    toast.success('Ditambahkan ke bookmark', { duration: 2000 });
                  }
                }}
              >
                {bookmarked ? (
                  <><BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Tersimpan</>
                ) : (
                  <><Bookmark className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Bookmark</>
                )}
              </Button>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1">
            {/* Type Badge */}
            {manga.type && (
              <Badge className={`mb-3 sm:mb-4 text-[10px] sm:text-xs font-bold uppercase px-2.5 sm:px-3 py-0.5 sm:py-1 ${
                manga.type.toLowerCase() === 'manhwa' 
                  ? 'bg-orange-500/20 text-orange-400' 
                  : manga.type.toLowerCase() === 'manhua' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-blue-500/20 text-blue-400'
              }`}>
                {manga.type}
              </Badge>
            )}
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 
              bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent leading-tight">
              {manga.title}
            </h1>

            {manga.alternativeTitle && (
              <p className="text-muted-foreground mb-4 sm:mb-5 text-sm sm:text-base md:text-lg line-clamp-2">{manga.alternativeTitle}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              {manga.author && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-white/5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <Pen className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span className="line-clamp-1">{manga.author}</span>
                </div>
              )}
              {manga.status && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-white/5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  <span>{manga.status}</span>
                </div>
              )}
              {manga.rating && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-yellow-500/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{manga.rating}</span>
                </div>
              )}
            </div>

            {/* Genres - Clickable to search */}
            {manga.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                {manga.genres.map((genre) => (
                  <Link key={genre} href={`/search?q=${encodeURIComponent(genre)}`}>
                    <Badge
                      className="bg-white/5 hover:bg-primary/20 text-white/70 hover:text-white
                        border-white/10 cursor-pointer transition-all text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1"
                    >
                      {genre}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Sinopsis
              </h3>
              <p className="text-white/70 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {manga.synopsis || 'Tidak ada sinopsis tersedia untuk manga ini.'}
              </p>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <Card className="bg-card border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/10 px-3 sm:px-6">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl flex-wrap">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary to-blue-500 rounded-lg">
                <Library className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span>Daftar Chapter</span>
              <Badge className="ml-auto bg-primary/20 text-primary text-xs sm:text-sm">
                {manga.chapters.length} Chapter
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] sm:h-[500px]">
              <div className="divide-y divide-white/5">
                {manga.chapters.map((chapter, index) => (
                  <Link
                    key={chapter.slug}
                    href={buildChapterUrl(chapter.slug)}
                    className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/5 
                      transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center
                        text-[10px] sm:text-xs font-bold text-muted-foreground group-hover:bg-primary/20 
                        group-hover:text-primary transition-colors shrink-0">
                        {manga.chapters.length - index}
                      </div>
                      <span className="font-medium group-hover:text-primary transition-colors text-sm sm:text-base truncate">
                        {chapter.title}
                      </span>
                    </div>
                    {chapter.date && (
                      <span className="text-[10px] sm:text-xs text-muted-foreground bg-white/5 px-2 sm:px-3 py-1 rounded-full shrink-0 ml-2">
                        {chapter.date}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

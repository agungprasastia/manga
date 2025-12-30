'use client';

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
import { ArrowLeft, Pen, MapPin, Star, BookOpen, Zap, Library, FileQuestion, Clock, Eye } from 'lucide-react';
import { useFadeIn } from '@/hooks/use-anime';

export default function MangaDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const searchParams = useSearchParams();
  const source = searchParams.get('source') as 'komiku' | 'kiryuu' | undefined;
  const coverParam = searchParams.get('cover');

  const { data: mangaData, isLoading, error } = useQuery({
    queryKey: ['manga', slug, source],
    queryFn: () => getMangaDetail(slug, source),
    enabled: !!slug,
  });

  // Use cover from params if available (for consistency with list view), otherwise use API
  const manga = mangaData ? {
    ...mangaData,
    cover: coverParam || mangaData.cover
  } : undefined;

  // Anime.js fade-in animation for cover (must be called before conditional returns)
  const coverRef = useFadeIn<HTMLDivElement>([mangaData], { from: 'scale', duration: 600 });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-6xl py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-72 aspect-[2/3] rounded-2xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-32 w-full" />
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
        {/* Back Button */}
        <Link href="/">
          <Button 
            variant="ghost" 
            className="mb-4 sm:mb-6 text-white/70 hover:text-white hover:bg-white/10 rounded-full text-sm sm:text-base h-9 sm:h-10"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> <span className="hidden sm:inline">Kembali</span>
          </Button>
        </Link>

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
                <Link href={`/chapter/${firstChapter.slug}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`} className="block">
                  <Button className="w-full h-10 sm:h-12 rounded-xl text-sm sm:text-base font-semibold
                    bg-gradient-to-r from-primary to-blue-500 
                    hover:shadow-lg hover:shadow-primary/30
                    transition-all hover:-translate-y-0.5" size="lg">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Mulai Baca
                  </Button>
                </Link>
              )}
              {lastChapter && lastChapter !== firstChapter && (
                <Link href={`/chapter/${lastChapter.slug}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`} className="block">
                  <Button variant="outline" className="w-full h-10 sm:h-12 rounded-xl text-sm sm:text-base font-semibold
                    border-white/20 bg-white/5 backdrop-blur-sm
                    hover:bg-white/10 hover:border-white/30
                    transition-all" size="lg">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Chapter Terbaru
                  </Button>
                </Link>
              )}
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

            {/* Genres */}
            {manga.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                {manga.genres.map((genre) => (
                  <Badge key={genre} 
                    className="bg-white/5 hover:bg-primary/20 text-white/70 hover:text-white
                      border-white/10 cursor-pointer transition-all text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Sinopsis
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
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
                    href={`/chapter/${chapter.slug}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`}
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

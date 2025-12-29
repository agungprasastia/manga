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

export default function MangaDetailPage() {
  const params = useParams();
  const router = useRouter();
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

      <main className="container max-w-6xl -mt-8 md:-mt-12 relative z-10 pb-16">
        {/* Back Button */}
        <Link href="/">
          <Button 
            variant="ghost" 
            className="mb-6 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
          </Button>
        </Link>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* Cover with Glow */}
          <div className="w-full md:w-72 shrink-0">
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
            <div className="mt-6 space-y-3">
              {firstChapter && (
                <Link href={`/chapter/${firstChapter.slug}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`} className="block">
                  <Button className="w-full h-12 rounded-xl text-base font-semibold
                    bg-gradient-to-r from-primary to-blue-500 
                    hover:shadow-lg hover:shadow-primary/30
                    transition-all hover:-translate-y-0.5" size="lg">
                    <BookOpen className="w-5 h-5 mr-2" /> Mulai Baca
                  </Button>
                </Link>
              )}
              {lastChapter && lastChapter !== firstChapter && (
                <Link href={`/chapter/${lastChapter.slug}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`} className="block">
                  <Button variant="outline" className="w-full h-12 rounded-xl text-base font-semibold
                    border-white/20 bg-white/5 backdrop-blur-sm
                    hover:bg-white/10 hover:border-white/30
                    transition-all" size="lg">
                    <Zap className="w-5 h-5 mr-2" /> Chapter Terbaru
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1">
            {/* Type Badge */}
            {manga.type && (
              <Badge className={`mb-4 text-xs font-bold uppercase px-3 py-1 ${
                manga.type.toLowerCase() === 'manhwa' 
                  ? 'bg-orange-500/20 text-orange-400' 
                  : manga.type.toLowerCase() === 'manhua' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-blue-500/20 text-blue-400'
              }`}>
                {manga.type}
              </Badge>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold mb-3 
              bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              {manga.title}
            </h1>

            {manga.alternativeTitle && (
              <p className="text-muted-foreground mb-5 text-lg">{manga.alternativeTitle}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6">
              {manga.author && (
                <div className="flex items-center gap-2 text-sm bg-white/5 rounded-full px-4 py-2">
                  <Pen className="w-4 h-4 text-primary" />
                  <span>{manga.author}</span>
                </div>
              )}
              {manga.status && (
                <div className="flex items-center gap-2 text-sm bg-white/5 rounded-full px-4 py-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span>{manga.status}</span>
                </div>
              )}
              {manga.rating && (
                <div className="flex items-center gap-2 text-sm bg-yellow-500/10 rounded-full px-4 py-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{manga.rating}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {manga.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {manga.genres.map((genre) => (
                  <Badge key={genre} 
                    className="bg-white/5 hover:bg-primary/20 text-white/70 hover:text-white
                      border-white/10 cursor-pointer transition-all">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Sinopsis
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {manga.synopsis || 'Tidak ada sinopsis tersedia untuk manga ini.'}
              </p>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <Card className="bg-card border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-primary to-blue-500 rounded-lg">
                <Library className="w-5 h-5 text-white" />
              </div>
              <span>Daftar Chapter</span>
              <Badge className="ml-auto bg-primary/20 text-primary">
                {manga.chapters.length} Chapter
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-white/5">
                {manga.chapters.map((chapter, index) => (
                  <Link
                    key={chapter.slug}
                    href={`/chapter/${chapter.slug}${source ? `?source=${source}` : ''}${coverParam ? `&cover=${encodeURIComponent(coverParam)}` : ''}`}
                    className="flex items-center justify-between p-4 hover:bg-white/5 
                      transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center
                        text-xs font-bold text-muted-foreground group-hover:bg-primary/20 
                        group-hover:text-primary transition-colors">
                        {manga.chapters.length - index}
                      </div>
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {chapter.title}
                      </span>
                    </div>
                    {chapter.date && (
                      <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
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

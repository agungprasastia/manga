'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMangaDetail } from '@/lib/api';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function MangaDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: manga, isLoading, error } = useQuery({
    queryKey: ['manga', slug],
    queryFn: () => getMangaDetail(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-64 aspect-[3/4] rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container py-8">
          <div className="text-center py-16">
            <p className="text-2xl mb-4">😕</p>
            <h1 className="text-xl font-semibold mb-2">Manga Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-4">
              Manga yang kamu cari tidak ada atau sudah dihapus.
            </p>
            <Link href="/">
              <Button>Kembali ke Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const firstChapter = manga.chapters[manga.chapters.length - 1];
  const lastChapter = manga.chapters[0];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Cover */}
          <div className="w-full md:w-64 shrink-0">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={manga.cover || '/placeholder.jpg'}
                alt={manga.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Quick Actions */}
            <div className="mt-4 space-y-2">
              {firstChapter && (
                <Link href={`/chapter/${firstChapter.slug}`} className="block">
                  <Button className="w-full" size="lg">
                    📖 Mulai Baca
                  </Button>
                </Link>
              )}
              {lastChapter && lastChapter !== firstChapter && (
                <Link href={`/chapter/${lastChapter.slug}`} className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    ⚡ Chapter Terbaru
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{manga.title}</h1>

            {manga.alternativeTitle && (
              <p className="text-muted-foreground mb-4">{manga.alternativeTitle}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              {manga.author && (
                <div className="flex items-center gap-1">
                  <span>✍️</span>
                  <span>{manga.author}</span>
                </div>
              )}
              {manga.status && (
                <div className="flex items-center gap-1">
                  <span>📌</span>
                  <span>{manga.status}</span>
                </div>
              )}
              {manga.rating && (
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>{manga.rating}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {manga.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {manga.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-2">Sinopsis</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {manga.synopsis || 'Tidak ada sinopsis tersedia.'}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Chapter List */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📚</span>
              <span>Daftar Chapter ({manga.chapters.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-1">
                {manga.chapters.map((chapter, index) => (
                  <Link
                    key={chapter.slug}
                    href={`/chapter/${chapter.slug}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <span className="group-hover:text-primary transition-colors">
                      {chapter.title}
                    </span>
                    {chapter.date && (
                      <span className="text-xs text-muted-foreground">
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

'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { MangaCard } from '@/components/manga-card';
import { Bookmark, Home, Trash2, BookmarkX } from 'lucide-react';
import Link from 'next/link';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookmarksPage() {
  const { bookmarks, isLoaded, remove } = useBookmarks();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl py-6 sm:py-8 md:py-10 px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg sm:rounded-xl
              backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
              <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold 
                bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Bookmark
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {isLoaded ? `${bookmarks.length} manga tersimpan` : 'Memuat...'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {!isLoaded ? (
          // Loading Skeleton
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4.5] rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 text-center">
            <div className="p-5 sm:p-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-full mb-6">
              <BookmarkX className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Belum Ada Bookmark</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-6 px-4">
              Kamu belum menyimpan manga apapun. Mulai jelajahi dan bookmark manga favoritmu!
            </p>
            <Link href="/">
              <Button size="lg" className="rounded-full shadow-lg shadow-primary/20">
                <Home className="w-4 h-4 mr-2" /> Jelajahi Manga
              </Button>
            </Link>
          </div>
        ) : (
          // Bookmarks Grid
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {bookmarks.map((manga) => (
              <div key={manga.slug} className="relative group">
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    remove(manga.slug);
                  }}
                  className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm
                    flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
                    hover:bg-red-500/80 text-white/70 hover:text-white"
                  title="Hapus dari bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <MangaCard 
                  manga={{
                    title: manga.title,
                    slug: manga.slug,
                    cover: manga.cover,
                    type: manga.type,
                    rating: manga.rating,
                    chapter: manga.latestChapter,
                    source: manga.source,
                  }} 
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { searchManga } from '@/lib/api';
import { Header } from '@/components/header';
import { MangaCard } from '@/components/manga-card';
import { MangaGridSkeleton } from '@/components/manga-skeleton';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchManga(query),
    enabled: query.length > 0,
  });

  if (!query) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-semibold mb-2">Cari Manga</h2>
        <p className="text-muted-foreground">
          Ketik judul manga yang ingin kamu cari di kolom pencarian.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <MangaGridSkeleton count={10} />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">😕</p>
        <h2 className="text-xl font-semibold mb-2">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground">
          Gagal melakukan pencarian. Silakan coba lagi.
        </p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">📭</p>
        <h2 className="text-xl font-semibold mb-2">Tidak Ada Hasil</h2>
        <p className="text-muted-foreground">
          Tidak ditemukan manga dengan kata kunci &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground mb-6">
        Ditemukan {results.length} hasil untuk &quot;{query}&quot;
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((manga) => (
          <MangaCard key={manga.slug} manga={manga} />
        ))}
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🔍</span>
          <h1 className="text-2xl font-bold">Hasil Pencarian</h1>
        </div>

        <Suspense fallback={<MangaGridSkeleton count={10} />}>
          <SearchResults />
        </Suspense>
      </main>
    </div>
  );
}

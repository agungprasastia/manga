'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { searchManga } from '@/lib/api';
import { Header } from '@/components/header';
import { MangaCard } from '@/components/manga-card';
import { MangaGridSkeleton } from '@/components/manga-skeleton';
import { Breadcrumb } from '@/components/breadcrumb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import { useStaggerAnimation } from '@/hooks/use-anime';

function SearchBar({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  // Debounce query
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialQuery) {
      if (debouncedQuery.trim()) {
        router.replace(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
      } else {
        router.replace('/search');
      }
    }
  }, [debouncedQuery, router, initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12 group px-3 sm:px-0">
      {/* Gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-purple-500/50 to-primary/50 
        rounded-full opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
      
      <div className="relative flex items-center">
        <div className="absolute left-3 sm:left-4 md:left-5 text-muted-foreground">
          {isTyping ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary" />
          ) : (
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>
        <Input
          type="search"
          placeholder="Cari manga, manhwa, atau manhua..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/5 backdrop-blur-md border-white/10 
            focus:bg-white/10 focus:border-primary/50 
            transition-all duration-300 rounded-full pl-10 sm:pl-12 md:pl-14 pr-16 sm:pr-20 md:pr-24 h-11 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg
            placeholder:text-white/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setDebouncedQuery(''); }}
            className="absolute right-14 sm:right-16 md:right-20 p-1.5 sm:p-2 text-white/50 hover:text-white 
              rounded-full hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
        <Button 
          type="submit" 
          className="absolute right-1 sm:right-1.5 h-9 sm:h-10 md:h-11 rounded-full px-3 sm:px-4 md:px-6 text-xs sm:text-sm
            bg-gradient-to-r from-primary to-blue-500 
            hover:from-primary/90 hover:to-blue-400
            shadow-lg shadow-primary/30 
            transition-all duration-300 hover:scale-105"
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Cari</span>
        </Button>
      </div>
    </form>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchManga(query),
    enabled: query.length > 0,
  });

  // Anime.js stagger animation for search results - MUST be called unconditionally
  const resultsRef = useStaggerAnimation<HTMLDivElement>(
    '.search-result-item',
    [isLoading, results?.length],
    { staggerDelay: 40, delay: 100 }
  );

  if (!query) {
    return (
      <div className="text-center py-12 sm:py-16 md:py-20 px-4">
        <div className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full 
          w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 flex items-center justify-center">
          <Search className="w-12 h-12 sm:w-16 sm:h-16 text-primary/50" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-white/60 
          bg-clip-text text-transparent">
          Mulai Pencarian
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base md:text-lg">
          Temukan ribuan manga, manhwa, dan manhua favoritmu. 
          Ketik judul di kolom pencarian di atas.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <MangaGridSkeleton count={10} />;
  }

  if (error) {
    return (
      <div className="text-center py-12 sm:py-16 md:py-20 px-4">
        <div className="p-4 sm:p-6 bg-red-500/10 rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 
          flex items-center justify-center">
          <X className="w-12 h-12 sm:w-16 sm:h-16 text-red-500/50" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-red-400">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Gagal melakukan pencarian. Silakan coba lagi.
        </p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 md:py-20 px-4">
        <div className="p-4 sm:p-6 bg-muted/30 rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 
          flex items-center justify-center">
          <Search className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Tidak Ada Hasil</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Tidak ditemukan manga dengan kata kunci &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-3 sm:px-0">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
        <p className="text-sm sm:text-base md:text-lg">
          Ditemukan <span className="text-primary font-bold">{results.length}</span> hasil 
          untuk &quot;<span className="text-white font-medium">{query}</span>&quot;
        </p>
      </div>
      <div ref={resultsRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 px-3 sm:px-0">
        {results.map((manga) => (
          <div key={manga.slug} className="search-result-item">
            <MangaCard manga={manga} />
          </div>
        ))}
      </div>
    </>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  return (
    <main className="container max-w-7xl py-8 sm:py-10 md:py-12 px-3 sm:px-4 md:px-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: 'Pencarian', href: '/search' },
        ...(query ? [{ label: query }] : [])
      ]} />

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 md:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 
          bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
          Pencarian Manga
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
          Cari manga, manhwa, atau manhua favoritmu.
        </p>
      </div>
      
      <SearchBar initialQuery={query} />
      <SearchResults />
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={
        <div className="container max-w-7xl py-8 sm:py-10 md:py-12 px-3 sm:px-4 md:px-6">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="h-8 sm:h-10 md:h-12 w-48 sm:w-56 md:w-64 bg-muted/30 rounded-lg mx-auto mb-3 sm:mb-4 animate-pulse" />
            <div className="h-5 sm:h-6 w-40 sm:w-48 bg-muted/20 rounded mx-auto animate-pulse" />
          </div>
          <MangaGridSkeleton count={10} />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}

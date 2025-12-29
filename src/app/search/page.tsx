'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { searchManga } from '@/lib/api';
import { Header } from '@/components/header';
import { MangaCard } from '@/components/manga-card';
import { MangaGridSkeleton } from '@/components/manga-skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12 group">
      {/* Gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-purple-500/50 to-primary/50 
        rounded-full opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
      
      <div className="relative flex items-center">
        <div className="absolute left-5 text-muted-foreground">
          {isTyping ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        <Input
          type="search"
          placeholder="Cari manga, manhwa, atau manhua..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/5 backdrop-blur-md border-white/10 
            focus:bg-white/10 focus:border-primary/50 
            transition-all duration-300 rounded-full pl-14 pr-24 h-14 text-lg
            placeholder:text-white/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setDebouncedQuery(''); }}
            className="absolute right-20 p-2 text-white/50 hover:text-white 
              rounded-full hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <Button 
          type="submit" 
          className="absolute right-1.5 h-11 rounded-full px-6
            bg-gradient-to-r from-primary to-blue-500 
            hover:from-primary/90 hover:to-blue-400
            shadow-lg shadow-primary/30 
            transition-all duration-300 hover:scale-105"
        >
          <Search className="w-4 h-4 mr-2" />
          Cari
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

  if (!query) {
    return (
      <div className="text-center py-20">
        <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full 
          w-32 h-32 mx-auto mb-8 flex items-center justify-center">
          <Search className="w-16 h-16 text-primary/50" />
        </div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 
          bg-clip-text text-transparent">
          Mulai Pencarian
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-lg">
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
      <div className="text-center py-20">
        <div className="p-6 bg-red-500/10 rounded-full w-32 h-32 mx-auto mb-8 
          flex items-center justify-center">
          <X className="w-16 h-16 text-red-500/50" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-red-400">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground">
          Gagal melakukan pencarian. Silakan coba lagi.
        </p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="p-6 bg-muted/30 rounded-full w-32 h-32 mx-auto mb-8 
          flex items-center justify-center">
          <Search className="w-16 h-16 text-muted-foreground/30" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Tidak Ada Hasil</h2>
        <p className="text-muted-foreground">
          Tidak ditemukan manga dengan kata kunci &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="w-5 h-5 text-primary" />
        <p className="text-lg">
          Ditemukan <span className="text-primary font-bold">{results.length}</span> hasil 
          untuk &quot;<span className="text-white font-medium">{query}</span>&quot;
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {results.map((manga) => (
          <MangaCard key={manga.slug} manga={manga} />
        ))}
      </div>
    </>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  return (
    <main className="container max-w-7xl py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 
          bg-gradient-to-r from-white via-white to-primary bg-clip-text text-transparent">
          Pencarian Manga
        </h1>
        <p className="text-muted-foreground text-lg">
          Cari manga dari Komiku dan Kiryuu
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
        <div className="container max-w-7xl py-12">
          <div className="text-center mb-10">
            <div className="h-12 w-64 bg-muted/30 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-48 bg-muted/20 rounded mx-auto animate-pulse" />
          </div>
          <MangaGridSkeleton count={10} />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}

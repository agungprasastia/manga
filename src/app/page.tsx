'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Sparkles, Flame, Star, Loader2 } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { getHome, getLatest } from '@/lib/api';
import { Header } from '@/components/header';
import { MangaCard } from '@/components/manga-card';
import { MangaGridSkeleton } from '@/components/manga-skeleton';
import { HeroCarousel } from '@/components/hero-carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useStaggerAnimation } from '@/hooks/use-anime';

function HomeContent() {
  // Fetch Home Data (Carousel + Popular + Latest Page 1)
  const homeQuery = useQuery({
    queryKey: ['home'],
    queryFn: getHome,
  });

  // Infinite Query for Latest Updates
  const latestInfiniteQuery = useInfiniteQuery({
    queryKey: ['latest-infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      // Page 1 data comes from homeQuery, so start fetching from page 2
      if (pageParam === 1) {
        // Return empty for page 1, we'll use homeQuery data
        return { data: [], page: 1 };
      }
      const data = await getLatest(pageParam);
      return { data, page: pageParam };
    },
    getNextPageParam: (lastPage) => {
      // Always allow next page (infinite scroll)
      return lastPage.page + 1;
    },
    initialPageParam: 1,
  });

  // Determine what data to show
  const popularManga = homeQuery.data?.popular;
  
  // Combine home page data + infinite query pages, then deduplicate
  const allLatestManga = useMemo(() => {
    const seen = new Set<string>();
    const result: any[] = [];
    
    // First, add page 1 data from homeQuery
    if (homeQuery.data?.latest) {
      homeQuery.data.latest.forEach((manga: any) => {
        if (!seen.has(manga.slug)) {
          seen.add(manga.slug);
          result.push(manga);
        }
      });
    }
    
    // Then add data from infinite query pages
    if (latestInfiniteQuery.data?.pages) {
      latestInfiniteQuery.data.pages.forEach((page) => {
        page.data.forEach((manga: any) => {
          if (!seen.has(manga.slug)) {
            seen.add(manga.slug);
            result.push(manga);
          }
        });
      });
    }
    
    return result;
  }, [homeQuery.data?.latest, latestInfiniteQuery.data?.pages]);

  const isInitialLoading = homeQuery.isLoading;
  const isError = homeQuery.isError;

  // Anime.js stagger animation for manga cards
  const cardsRef = useStaggerAnimation<HTMLDivElement>(
    '.manga-card-item',
    [isInitialLoading, allLatestManga.length],
    { staggerDelay: 40, delay: 100 }
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />

      <main className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 md:space-y-8 lg:space-y-10">
        
        {/* Hero Section */}
        <section className="-mx-3 sm:mx-0">
          {!homeQuery.isLoading && !homeQuery.error && popularManga && (
            <HeroCarousel mangaList={popularManga} />
          )}
          {homeQuery.isLoading && <Skeleton className="w-full aspect-[5/6] md:aspect-[21/9] lg:aspect-[28/9] xl:aspect-[32/9] rounded-xl" />}
        </section>

        <Separator className="my-2 bg-white/10" />

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          
          {/* Main Content: Latest Updates with Infinite Scroll */}
          <div className="flex-1 min-w-0 order-2 lg:order-1" id="latest-updates">
             {/* Section Header - Enhanced */}
             <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                   <div className="p-2 sm:p-3 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg sm:rounded-xl
                     backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10">
                     <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
                   </div>
                   <div>
                     <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight
                       bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                       Update Terbaru
                     </h2>
                     <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">Manga terbaru yang baru diupdate</p>
                   </div>
                </div>
             </div>

             {isInitialLoading ? (
               <MangaGridSkeleton count={12} />
             ) : isError ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Gagal memuat data.</p>
                </div>
             ) : (
                <>
                  <div ref={cardsRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                    {allLatestManga.map((manga, index) => (
                      <div key={`${manga.slug}-${index}`} className="manga-card-item">
                        <MangaCard manga={manga} />
                      </div>
                    ))}
                  </div>

                  {/* Load More Button - Gradient Style */}
                  <div className="flex justify-center mt-10 sm:mt-12 md:mt-16">
                    <Button 
                      size="lg"
                      onClick={() => latestInfiniteQuery.fetchNextPage()}
                      disabled={latestInfiniteQuery.isFetchingNextPage}
                      className="min-w-[200px] sm:min-w-[240px] h-12 sm:h-14 rounded-full
                        bg-gradient-to-r from-primary via-blue-500 to-primary
                        bg-[length:200%_100%] animate-gradient
                        hover:shadow-lg hover:shadow-primary/30
                        hover:-translate-y-1
                        transition-all duration-300
                        text-white font-semibold text-sm sm:text-base
                        border-none px-6 sm:px-8"
                    >
                      {latestInfiniteQuery.isFetchingNextPage ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                          <span className="hidden sm:inline">Memuat...</span>
                          <span className="sm:hidden">Memuat</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          <span className="hidden sm:inline">Muat Lebih Banyak</span>
                          <span className="sm:hidden">Muat Lagi</span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
             )}
          </div>

          {/* Sidebar - Enhanced */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6 lg:space-y-8 order-1 lg:order-2">
             {/* Mobile/Tablet: Horizontal Popular Section */}
             <div className="lg:hidden">
               <Card className="bg-card/50 border-white/10 overflow-hidden backdrop-blur-sm">
                 <CardHeader className="pb-3 border-b border-white/10">
                   <CardTitle className="text-base sm:text-lg flex items-center gap-2 sm:gap-3 font-bold">
                     <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-lg shadow-orange-500/30">
                       <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                     </div>
                     <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                       Populer
                     </span>
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-4 px-3">
                   {homeQuery.isLoading ? (
                     <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className="shrink-0 w-28">
                           <Skeleton className="w-28 h-40 rounded-lg" />
                           <Skeleton className="h-3 w-full mt-2" />
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                       {popularManga?.slice(0, 8).map((manga: any, index: number) => (
                         <Link 
                           href={`/manga/${manga.slug}?${new URLSearchParams({
                             ...(manga.source && { source: manga.source }),
                             ...(manga.cover && { cover: manga.cover })
                           }).toString()}`} 
                           key={manga.slug}
                           className="shrink-0 w-28 group"
                         >
                           <div className="relative w-28 aspect-[2/3] rounded-lg overflow-hidden 
                             shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 
                             transition-all duration-300 group-hover:-translate-y-1">
                             {/* Rank Badge */}
                             <div className={`absolute top-1.5 left-1.5 z-10 w-5 h-5 flex items-center justify-center 
                               text-[10px] font-bold text-white rounded-md shadow-lg ${
                                 index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                 index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                                 index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                                 'bg-white/20 backdrop-blur-md'
                               }`}>
                               {index + 1}
                             </div>
                             <img 
                               src={manga.cover} 
                               alt={manga.title} 
                               className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                           </div>
                           <h4 className="font-medium text-xs line-clamp-2 mt-2 text-white/80 group-hover:text-primary transition-colors">
                             {manga.title}
                           </h4>
                         </Link>
                       ))}
                     </div>
                   )}
                 </CardContent>
               </Card>
             </div>

             {/* Desktop: Vertical Popular List */}
             <Card className="bg-card border-white/10 overflow-hidden hidden lg:block">
               <CardHeader className="pb-4 border-b border-white/10">
                 <CardTitle className="text-lg flex items-center gap-3 font-bold">
                   <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-lg shadow-orange-500/30">
                      <Flame className="w-4 h-4 text-white" />
                   </div>
                   <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                     Populer
                   </span>
                 </CardTitle>
               </CardHeader>
               <CardContent className="pt-0 px-0">
                 {homeQuery.isLoading ? (
                    <div className="p-4 space-y-4">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className="flex gap-3">
                            <Skeleton className="w-16 h-24 rounded-md" />
                            <div className="flex-1 space-y-2 py-1">
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-3 w-1/2" />
                            </div>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="divide-y divide-white/5">
                       {popularManga?.slice(0, 5).map((manga: any, index: number) => (
                         <Link 
                           href={`/manga/${manga.slug}?${new URLSearchParams({
                             ...(manga.source && { source: manga.source }),
                             ...(manga.cover && { cover: manga.cover })
                           }).toString()}`} 
                           key={manga.slug}
                           className="flex gap-4 p-4 hover:bg-white/5 transition-all duration-300 group relative"
                         >
                            {/* Rank Number - Modern Style */}
                            <div className={`absolute top-4 left-4 z-10 w-7 h-7 flex items-center justify-center 
                              text-xs font-bold text-white rounded-lg shadow-lg ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-500/40' :
                                index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-400/30' :
                                index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 shadow-amber-600/30' :
                                'bg-white/10 backdrop-blur-md'
                              }`}>
                                {index + 1}
                              </div>

                            <div className="relative w-16 aspect-[2/3] shrink-0 rounded-lg overflow-hidden 
                              shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 transition-all">
                               <img 
                                 src={manga.cover} 
                                 alt={manga.title} 
                                 className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                               />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                               <h4 className="font-semibold text-sm line-clamp-2 leading-snug 
                                 text-white/90 group-hover:text-primary transition-colors">
                                 {manga.title}
                               </h4>
                               <div className="flex items-center gap-2 text-xs">
                                 {manga.type && (
                                    <Badge className={`h-5 px-2 text-[10px] font-medium border-none ${
                                      manga.type.toLowerCase() === 'manhwa' 
                                        ? 'bg-orange-500/20 text-orange-400' 
                                        : manga.type.toLowerCase() === 'manhua' 
                                          ? 'bg-purple-500/20 text-purple-400' 
                                          : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                       {manga.type}
                                    </Badge>
                                 )}
                                 <div className="flex items-center gap-1 text-yellow-400 font-medium">
                                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                                    <span>{manga.rating || 'N/A'}</span>
                                 </div>
                               </div>
                            </div>
                         </Link>
                       ))}
                    </div>
                 )}
               </CardContent>
             </Card>

             {/* Genres Cloud - Enhanced (Desktop Only) */}
             <Card className="bg-gradient-to-b from-card/60 to-transparent backdrop-blur-xl 
               border-white/10 overflow-hidden hidden lg:block">
               <CardHeader className="pb-3 border-b border-white/10">
                 <CardTitle className="text-lg font-bold bg-gradient-to-r from-white to-white/60 
                   bg-clip-text text-transparent">Genre</CardTitle>
               </CardHeader>
               <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                     {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Harem', 'Romance', 'Seinen', 'Shounen', 'Slice of Life'].map(g => (
                        <Badge key={g} variant="secondary" 
                          className="bg-white/5 hover:bg-gradient-to-r hover:from-primary hover:to-blue-500 
                            border-white/10 hover:border-transparent
                            text-white/70 hover:text-white 
                            cursor-pointer transition-all duration-300 hover:-translate-y-0.5">
                           {g}
                        </Badge>
                     ))}
                  </div>
               </CardContent>
             </Card>
          </aside>

        </div>
      </main>

      {/* Footer - Premium Design */}
      <footer className="relative border-t border-white/10 py-10 sm:py-12 md:py-16 mt-10 sm:mt-12 md:mt-16 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-card to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-10 md:mb-12 text-center sm:text-left">
            <div className="space-y-4 sm:space-y-6 md:col-span-2">
               <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                 <span className="text-white">Manga</span>
                 <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Ku</span>
               </h1>
               <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-md mx-auto md:mx-0">
                 Platform baca manga favoritmu dengan tampilan modern, cepat, dan nyaman. 
                 Nikmati ribuan judul manga, manhwa, dan manhua secara gratis.
               </p>
               <div className="flex gap-3 justify-center md:justify-start">
                 {/* Social Icons Placeholder */}
               </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
               <h3 className="font-bold text-white text-base sm:text-lg">Navigasi</h3>
               <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                 <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                 <li><Link href="/popular" className="text-muted-foreground hover:text-primary transition-colors">Populer</Link></li>
                 <li><Link href="/bookmarks" className="text-muted-foreground hover:text-primary transition-colors">Bookmark</Link></li>
               </ul>
            </div>

            <div className="space-y-3 sm:space-y-4">
               <h3 className="font-bold text-white text-base sm:text-lg">Legal</h3>
               <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                 <li><Link href="/dmca" className="text-muted-foreground hover:text-primary transition-colors">DMCA</Link></li>
                 <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                 <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
               </ul>
            </div>
          </div>
          
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6 sm:my-8" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground/60 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} MangaKu. All rights reserved.</p>
            <p className="text-[10px] sm:text-xs">Disclaimer: This site does not store any files on its server.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  );
}

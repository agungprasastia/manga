'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getHome } from '@/lib/api';
import { Header } from '@/components/header';
import { MangaCard } from '@/components/manga-card';
import { MangaGridSkeleton } from '@/components/manga-skeleton';
import { HeroCarousel } from '@/components/hero-carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['home'],
    queryFn: getHome,
  });

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        
        {/* Hero Section */}
        <section>
          {!isLoading && !error && data?.popular && (
            <HeroCarousel mangaList={data.popular} />
          )}
          {isLoading && <Skeleton className="w-full aspect-[21/9] md:aspect-[30/9] rounded-xl" />}
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content: Latest Updates */}
          <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-purple-600 rounded-full"></div>
                   <h2 className="text-2xl font-bold tracking-tight">Update Terbaru</h2>
                </div>
                <Link href="/latest" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Lihat Semua →
                </Link>
             </div>

             {isLoading ? (
               <MangaGridSkeleton count={12} />
             ) : error ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">Gagal memuat data.</p>
                </div>
             ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {data?.latest.map((manga) => (
                    <MangaCard key={manga.slug} manga={manga} />
                  ))}
                </div>
             )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-8">
             {/* Popular List in Sidebar */}
             <Card className="bg-card/50 border-border/50">
               <CardHeader className="pb-3 border-b border-border/50">
                 <CardTitle className="text-lg flex items-center gap-2">
                   <span className="text-orange-500">🔥</span>
                   Konsep Populer
                 </CardTitle>
               </CardHeader>
               <CardContent className="pt-4 px-0">
                 {isLoading ? (
                    <div className="px-4 space-y-4">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className="flex gap-3">
                            <Skeleton className="w-16 h-24 rounded" />
                            <div className="flex-1 space-y-2 py-1">
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-3 w-1/2" />
                            </div>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="divide-y divide-border/30">
                       {data?.popular.slice(0, 8).map((manga, index) => (
                         <Link 
                           href={`/manga/${manga.slug}`} 
                           key={manga.slug}
                           className="flex gap-4 p-4 hover:bg-muted/40 transition-colors group"
                         >
                            <div className="relative w-16 aspect-[2/3] shrink-0 rounded overflow-hidden shadow-sm">
                              <span className={`absolute top-0 left-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white z-10 ${
                                index < 3 ? 'bg-orange-500' : 'bg-gray-600'
                              }`}>
                                {index + 1}
                              </span>
                               {/* Using pure HTML img for sidebar for simplicty or Image component */}
                               <img 
                                 src={manga.cover} 
                                 alt={manga.title} 
                                 className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                               />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                               <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                 {manga.title}
                               </h4>
                               <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                 {manga.type && (
                                    <span className="uppercase">{manga.type}</span>
                                 )}
                                 <span>•</span>
                                 {manga.rating ? (
                                   <span className="flex items-center gap-0.5 text-yellow-500">
                                      ★ {manga.rating}
                                   </span>
                                 ) : (
                                   <span>{manga.chapter?.replace('Chapter ', 'Ch. ')}</span>
                                 )}
                               </div>
                            </div>
                         </Link>
                       ))}
                    </div>
                 )}
                 <div className="p-4 pt-2">
                    <Button variant="outline" className="w-full text-xs h-8">
                       Lihat Semua Populer
                    </Button>
                 </div>
               </CardContent>
             </Card>

             {/* Genres Cloud Check (Static for now) */}
             <Card className="bg-card/50 border-border/50">
               <CardHeader className="pb-3 border-b border-border/50">
                 <CardTitle className="text-lg">Genre</CardTitle>
               </CardHeader>
               <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                     {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Harem', 'Romance', 'Seinen', 'Shounen', 'Slice of Life'].map(g => (
                        <Badge key={g} variant="secondary" className="hover:bg-primary hover:text-white cursor-pointer transition-colors">
                           {g}
                        </Badge>
                     ))}
                  </div>
               </CardContent>
             </Card>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 mt-12 bg-card/30 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
            <div className="space-y-4 md:col-span-2">
               <h1 className="text-3xl font-extrabold tracking-tight">
                 <span className="text-white">Manga</span>
                 <span className="text-primary">Ku</span>
               </h1>
               <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
                 Platform baca manga favoritmu dengan tampilan modern, cepat, dan nyaman. Nikmati ribuan judul komik secara gratis.
               </p>
            </div>
            
            <div className="space-y-4 off">
               <h3 className="font-semibold text-white">Navigasi</h3>
               <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                 <li><Link href="/popular" className="hover:text-primary transition-colors">Populer</Link></li>
                 <li><Link href="/bookmarks" className="hover:text-primary transition-colors">Bookmark</Link></li>
               </ul>
            </div>

            <div className="space-y-4">
               <h3 className="font-semibold text-white">Legal</h3>
               <ul className="space-y-2 text-sm text-muted-foreground">
                 <li><Link href="/dmca" className="hover:text-primary transition-colors">DMCA</Link></li>
                 <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                 <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
               </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-border/40" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} MangaKu. All rights reserved.</p>
            <p>Disclaimer: This site does not store any files on its server. All contents are provided by non-affiliated third parties.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

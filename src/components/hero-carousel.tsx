'use client';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BookOpen, Star } from 'lucide-react';
import type { Manga } from '@/lib/api';

export function HeroCarousel({ mangaList }: { mangaList: Manga[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  // Use top 5 popular manga for carousel
  const carouselItems = mangaList.slice(0, 5);

  return (
    <div className="relative overflow-hidden rounded-xl md:rounded-2xl 
      border border-white/10 
      shadow-2xl shadow-black/50
      bg-gradient-to-br from-card/50 to-card">
      
      {/* Decorative corner glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {carouselItems.map((manga, index) => (
            <div key={manga.slug} className="relative flex-[0_0_100%] min-w-0">
              {/* Aspect Ratio Container */}
              <div className="relative aspect-[4/5] md:aspect-[21/9] lg:aspect-[28/9] xl:aspect-[32/9] w-full overflow-hidden">
                
                {/* Mobile Background - Full bleed blur - More subtle */}
                <div className="absolute inset-0 overflow-hidden md:hidden">
                  <Image
                    src={manga.cover}
                    alt="background"
                    fill
                    className="object-cover scale-[400%] blur-3xl saturate-100 opacity-60"
                  />
                  <div className="absolute inset-0 bg-black/70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </div>

                {/* Desktop Background */}
                <div className="hidden md:block absolute inset-0">
                  <Image
                    src={manga.cover}
                    alt={manga.title}
                    fill
                    className="object-cover blur-2xl opacity-40 scale-125"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 flex flex-col justify-center items-center md:items-start p-4 md:p-0 md:container md:px-8 lg:px-12">
                  
                  {/* Mobile Layout */}
                  <div className="flex flex-col items-center gap-4 md:hidden z-10 w-full text-center">
                    
                    {/* Poster Image - Larger */}
                    <div className="relative w-44 sm:w-48 aspect-[3/4] rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden border-2 border-white/20 ring-2 ring-primary/30">
                      <Image
                        src={manga.cover}
                        alt={manga.title}
                        fill
                        className="object-cover"
                      />
                      {/* Glow effect */}
                      <div className="absolute inset-0 ring-4 ring-primary/20 rounded-xl" />
                    </div>
                    
                    {/* Badge */}
                    <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                      Top Popular #{index + 1}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight line-clamp-2 px-2 drop-shadow-md">
                      {manga.title}
                    </h2>

                    {/* Button */}
                    <Link href={`/manga/${manga.slug}?${new URLSearchParams({
                          ...(manga.source && { source: manga.source }),
                          ...(manga.cover && { cover: manga.cover })
                        }).toString()}`} className="w-full max-w-xs">
                       <Button className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-400 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/30 text-sm transition-all hover:-translate-y-0.5">
                         <BookOpen className="w-4 h-4 mr-2" />
                         Baca Sekarang
                       </Button>
                    </Link>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex flex-row gap-6 lg:gap-8 xl:gap-10 items-center w-full">
                     {/* Desktop Cover Image */}
                    <div className="relative w-32 lg:w-40 xl:w-52 aspect-[2/3] shrink-0 group">
                      <div className="absolute -inset-1 bg-gradient-to-br from-primary via-purple-500 to-primary 
                        rounded-xl opacity-75 blur group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl">
                        <Image
                          src={manga.cover}
                          alt={manga.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -top-3 -left-3 w-10 h-10 
                        bg-gradient-to-br from-yellow-400 to-orange-500 
                        rounded-full flex items-center justify-center 
                        text-black font-bold text-lg shadow-lg border-2 border-white/20">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Desktop Text Content */}
                    <div className="flex-1 space-y-2 lg:space-y-4 relative z-10 w-full text-left">
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge className="bg-primary/90 hover:bg-primary text-white border-none text-xs px-2 py-0.5">
                          <TrendingUp className="w-3 h-3 mr-1" /> Trending
                        </Badge>
                        {manga.type && (
                          <Badge variant="outline" className="text-white/90 border-white/20 bg-black/20 backdrop-blur-md text-xs">
                            {manga.type}
                          </Badge>
                        )}
                        {manga.rating && (
                          <div className="flex items-center text-yellow-400 text-xs font-bold gap-1 bg-yellow-400/10 px-2 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-yellow-400" /> {manga.rating}
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl lg:text-4xl xl:text-5xl font-black leading-tight
                        text-white drop-shadow-lg line-clamp-2">
                        {manga.title}
                      </h2>

                      {/* Chapter Info */}
                      {manga.chapter && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                           Latest: {manga.chapter}
                        </div>
                      )}
                      
                      {/* CTA Button */}
                      <div className="pt-4">
                        <Link href={`/manga/${manga.slug}?${new URLSearchParams({
                          ...(manga.source && { source: manga.source }),
                          ...(manga.cover && { cover: manga.cover })
                        }).toString()}`} className="w-auto">
                          <Button size="lg" className="h-12 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-400 text-white font-bold border-none px-8 rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Baca Sekarang
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-3 md:bottom-4 lg:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-2.5 z-10
        bg-black/30 backdrop-blur-sm rounded-full px-3 md:px-4 py-1.5 md:py-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out ${
              index === selectedIndex 
                ? 'w-6 md:w-8 bg-gradient-to-r from-primary to-blue-400 shadow-lg shadow-primary/50' 
                : 'w-1.5 md:w-2 bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

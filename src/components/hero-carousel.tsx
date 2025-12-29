'use client';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Play, Star } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-2xl 
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
              <div className="relative aspect-[21/9] md:aspect-[30/9] w-full">
                
                {/* Background Image (Blurred) */}
                <div className="absolute inset-0 block">
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

                {/* Content */}
                <div className="absolute inset-0 flex items-center container px-6 md:px-12">
                  <div className="flex gap-6 md:gap-10 items-end md:items-center w-full">
                    
                    {/* Cover Image with Ring Effect */}
                    <div className="relative w-36 md:w-52 aspect-[2/3] shrink-0 hidden sm:block group">
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
                      
                      {/* Rank Badge */}
                      <div className="absolute -top-3 -left-3 w-10 h-10 
                        bg-gradient-to-br from-yellow-400 to-orange-500 
                        rounded-full flex items-center justify-center 
                        text-black font-bold text-lg shadow-lg shadow-orange-500/50
                        border-2 border-white/20">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 space-y-3 md:space-y-5 py-6">
                      {/* Badges Row */}
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-gradient-to-r from-primary to-blue-400 text-white border-none
                          flex items-center gap-1.5 px-3 py-1 shadow-lg shadow-primary/30">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Trending
                        </Badge>
                        {manga.type && (
                          <Badge variant="outline" className="text-white/80 border-white/30 backdrop-blur-sm">
                            {manga.type}
                          </Badge>
                        )}
                        {manga.rating && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 
                            flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400" />
                            {manga.rating}
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight
                        text-white drop-shadow-2xl line-clamp-2
                        bg-gradient-to-r from-white via-white to-white/70 bg-clip-text">
                        {manga.title}
                      </h2>

                      {manga.chapter && (
                        <p className="text-base md:text-lg text-gray-300/80 font-medium">
                          Latest: {manga.chapter}
                        </p>
                      )}
                      
                      {/* CTA Button */}
                      <div className="pt-2">
                        <Link href={`/manga/${manga.slug}?${new URLSearchParams({
                          ...(manga.source && { source: manga.source }),
                          ...(manga.cover && { cover: manga.cover })
                        }).toString()}`}>
                          <Button size="lg" className="
                            bg-gradient-to-r from-primary to-blue-500 
                            hover:from-primary/90 hover:to-blue-400
                            text-white font-bold text-lg px-8
                            shadow-xl shadow-primary/40
                            hover:shadow-primary/60
                            transition-all duration-300
                            hover:-translate-y-0.5
                            group">
                            <Play className="w-5 h-5 mr-2 fill-white group-hover:scale-110 transition-transform" />
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

      {/* Dots Navigation - Enhanced */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-10
        bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all duration-500 ease-out ${
              index === selectedIndex 
                ? 'w-8 bg-gradient-to-r from-primary to-blue-400 shadow-lg shadow-primary/50' 
                : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

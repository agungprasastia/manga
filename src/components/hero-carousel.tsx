'use client';

import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="relative overflow-hidden rounded-xl border border-border/50 shadow-2xl">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {carouselItems.map((manga) => (
            <div key={manga.slug} className="relative flex-[0_0_100%] min-w-0">
              <div className="relative aspect-[21/9] md:aspect-[30/9] w-full">
                {/* Background Image (Blurred) */}
                <div className="absolute inset-0 block">
                  <Image
                    src={manga.cover}
                    alt={manga.title}
                    fill
                    className="object-cover blur-3xl opacity-50 scale-110"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center container px-6 md:px-12">
                  <div className="flex gap-6 md:gap-8 items-end md:items-center w-full">
                    {/* Cover Image */}
                    <div className="relative w-32 md:w-48 aspect-[2/3] shrink-0 rounded-lg overflow-hidden shadow-2xl border border-border/50 hidden sm:block transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                      <Image
                        src={manga.cover}
                        alt={manga.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 space-y-2 md:space-y-4 py-8">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20">
                          Trending
                        </Badge>
                        {manga.type && (
                          <Badge variant="outline" className="text-muted-foreground border-white/20">
                            {manga.type}
                          </Badge>
                        )}
                      </div>

                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold line-clamp-2 text-white drop-shadow-lg">
                        {manga.title}
                      </h2>

                      {manga.chapter && (
                         <p className="text-lg text-gray-300">
                           {manga.chapter}
                         </p>
                      )}

                      <div className="pt-2">
                         <Link href={`/manga/${manga.slug}`}>
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex ? 'w-8 bg-primary' : 'bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

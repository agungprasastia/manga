import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Manga } from '@/lib/api';

interface MangaCardProps {
  manga: Manga;
  priority?: boolean;
}

export function MangaCard({ manga, priority = false }: MangaCardProps) {
  return (
    <Link href={`/manga/${manga.slug}`} className="block group">
      <div className="relative aspect-[3/4.5] overflow-hidden rounded-lg bg-muted shadow-sm group-hover:shadow-md transition-all duration-300">
        {/* Image */}
        <Image
          src={manga.cover || '/placeholder.jpg'}
          alt={manga.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          priority={priority}
        />

        {/* Gradient Overlay (always visible to make text readable) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Floating Type Badge */}
        {manga.type && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white border-none"
          >
            {manga.type}
          </Badge>
        )}

        {/* Content positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
          {/* Rating or Info Badge */}
           {manga.rating ? (
             <div className="flex items-center gap-1 text-yellow-400 text-xs font-semibold mb-1">
               <span>⭐</span>
               <span>{manga.rating}</span>
             </div>
           ) : null}
           
          <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors text-shadow-sm">
            {manga.title}
          </h3>
          
          {manga.chapter && (
            <p className="text-[11px] text-gray-300 font-medium truncate pt-1">
              {manga.chapter}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

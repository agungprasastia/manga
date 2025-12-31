import { Star, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Manga } from '@/lib/api';

interface MangaCardProps {
  manga: Manga;
  priority?: boolean;
}

export function MangaCard({ manga, priority = false }: MangaCardProps) {
  // Build URL with source and cover params for consistency
  const params = new URLSearchParams();
  if (manga.source) params.set('source', manga.source);
  if (manga.cover) params.set('cover', manga.cover);
  const queryString = params.toString();
  const href = `/manga/${manga.slug}${queryString ? `?${queryString}` : ''}`;

  return (
    <Link 
      href={href} 
      className="block group"
    >
      <div className="relative aspect-[3/4.5] overflow-hidden rounded-lg sm:rounded-xl bg-muted/50 
        shadow-lg shadow-black/20
        transition-all duration-500 ease-out
        group-hover:shadow-2xl group-hover:shadow-primary/20
        group-hover:-translate-y-1 sm:group-hover:-translate-y-2
        group-hover:ring-2 group-hover:ring-primary/30
        ">
        
        {/* Image */}
        <Image
          src={manga.cover || '/placeholder.jpg'}
          alt={manga.title}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          priority={priority}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.jpg';
          }}
        />

        {/* Gradient Overlay - Enhanced */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent 
          opacity-70 group-hover:opacity-90 transition-all duration-300" />
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
          bg-gradient-to-r from-transparent via-white/10 to-transparent
          -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

        {/* Type Badge - Glowing */}
        {manga.type && (
          <Badge
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-[9px] sm:text-[10px] h-5 sm:h-6 px-1.5 sm:px-2 font-bold uppercase tracking-wider 
              border-none text-white shadow-lg backdrop-blur-md
              ${
                manga.type.toLowerCase() === 'manhwa' 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30' 
                  : manga.type.toLowerCase() === 'manhua' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/30' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/30'
              }`}
          >
            {manga.type}
          </Badge>
        )}

        {/* Content positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 md:p-4 space-y-1 sm:space-y-1.5 md:space-y-2
          transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          
          {/* Rating Badge */}
          {manga.rating && (
            <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-black/50 backdrop-blur-sm 
              rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-yellow-400 text-[10px] sm:text-xs font-bold">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400" />
              <span>{manga.rating}</span>
            </div>
          )}
           
          {/* Title */}
          <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug 
            drop-shadow-lg
            group-hover:text-transparent group-hover:bg-clip-text 
            group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200
            transition-all duration-300">
            {manga.title}
          </h3>
          
          {/* Chapter Badge */}
          {manga.chapter && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-300 font-medium
              opacity-80 group-hover:opacity-100 transition-opacity">
              <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="truncate">{manga.chapter}</span>
              {manga.updatedAt && (
                <span className="text-gray-400 ml-1">• {manga.updatedAt}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Corner Accent */}
        <div className="absolute top-0 left-0 w-16 h-16 
          bg-gradient-to-br from-primary/20 to-transparent 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Link>
  );
}

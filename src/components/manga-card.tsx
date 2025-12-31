import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getRelativeTime } from '@/lib/utils';
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

  // Check if recently updated (within last hour)
  const isNew = manga.updatedAt?.toLowerCase().includes('menit');

  // Calculate realtime relative time from timestamp
  const displayTime = manga.updatedTimestamp 
    ? getRelativeTime(manga.updatedTimestamp) 
    : manga.updatedAt;

  return (
    <Link 
      href={href} 
      className="block group tap-transparent touch-manipulation active:scale-[0.98] transition-transform"
      title={manga.title}
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

        {/* Top badges row */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5">
          {/* NEW Badge */}
          {isNew && (
            <span className="h-4 sm:h-5 px-1.5 bg-green-500 text-white text-[8px] sm:text-[9px] font-bold rounded flex items-center shadow-md">
              NEW
            </span>
          )}
          
          {/* Type Badge */}
          {manga.type && (
            <Badge
              className={`text-[8px] sm:text-[9px] h-4 sm:h-5 px-1.5 font-bold uppercase tracking-wider 
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
        </div>

        {/* Content positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 md:p-4 space-y-1 sm:space-y-1.5 md:space-y-2
          transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
           
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
              <span>{manga.chapter}</span>
              {displayTime && (
                <span className="text-gray-400 ml-1">• {displayTime}</span>
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

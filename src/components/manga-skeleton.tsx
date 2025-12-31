import { Skeleton } from '@/components/ui/skeleton';

export function MangaCardSkeleton() {
  return (
    <div className="relative aspect-[3/4.5] overflow-hidden rounded-lg sm:rounded-xl bg-muted/50">
      {/* Main skeleton with shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      {/* Type badge skeleton */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
        <Skeleton className="h-5 sm:h-6 w-12 sm:w-14 rounded-full" />
      </div>
      
      {/* Bottom content skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 sm:h-5 w-full" />
        <Skeleton className="h-3 sm:h-4 w-3/4" />
      </div>
    </div>
  );
}

export function MangaGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  );
}

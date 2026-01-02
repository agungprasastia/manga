'use client';

import { useState, useEffect } from 'react';
import { getEnhancedCover } from '@/lib/api';

interface CoverCache {
    [key: string]: string;
}

// Global cache to avoid refetching
const coverCache: CoverCache = {};

/**
 * Hook for lazy loading enhanced covers
 * Returns the enhanced cover URL once loaded, or the original thumbnail
 */
export function useEnhancedCover(
    slug: string,
    source: string | undefined,
    originalCover: string
): string {
    const [cover, setCover] = useState(originalCover);

    useEffect(() => {
        // Skip if no slug
        if (!slug) return;

        const cacheKey = `${slug}_${source || 'auto'}`;

        // Check cache first
        if (coverCache[cacheKey]) {
            setCover(coverCache[cacheKey]);
            return;
        }

        // Skip enhancement for already good covers (from detail cache)
        // Good covers typically have higher resolution patterns
        const isLikelyGoodCover = originalCover.includes('/ims/') ||
            originalCover.includes('cover.softdevices') ||
            originalCover.includes('i0.wp.com');
        if (isLikelyGoodCover) {
            coverCache[cacheKey] = originalCover;
            return;
        }

        // Fetch enhanced cover in background
        const controller = new AbortController();

        getEnhancedCover(slug, source)
            .then((enhancedCover) => {
                if (enhancedCover && !controller.signal.aborted) {
                    coverCache[cacheKey] = enhancedCover;
                    setCover(enhancedCover);
                }
            })
            .catch(() => {
                // Silent fail - keep using original cover
            });

        return () => {
            controller.abort();
        };
    }, [slug, source, originalCover]);

    return cover;
}

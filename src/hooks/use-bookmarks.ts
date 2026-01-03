'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BookmarkedManga {
    slug: string;
    title: string;
    cover: string;
    type?: string;
    rating?: string;
    latestChapter?: string;
    source?: 'kiryuu' | 'komiku' | 'softkomik';
    addedAt: number;
}

const STORAGE_KEY = 'manga-bookmarks';

/**
 * Get all bookmarks from localStorage
 */
export function getBookmarks(): BookmarkedManga[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

/**
 * Add a manga to bookmarks
 */
export function addBookmark(manga: BookmarkedManga): void {
    if (typeof window === 'undefined') return;

    try {
        const bookmarks = getBookmarks();

        // Check if already bookmarked
        if (bookmarks.some(b => b.slug === manga.slug)) {
            return;
        }

        // Add to beginning
        const updated = [manga, ...bookmarks];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to add bookmark:', error);
    }
}

/**
 * Remove a manga from bookmarks
 */
export function removeBookmark(slug: string): void {
    if (typeof window === 'undefined') return;

    try {
        const bookmarks = getBookmarks();
        const filtered = bookmarks.filter(b => b.slug !== slug);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to remove bookmark:', error);
    }
}

/**
 * Check if a manga is bookmarked
 */
export function isBookmarked(slug: string): boolean {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.slug === slug);
}

/**
 * Toggle bookmark status
 */
export function toggleBookmark(manga: BookmarkedManga): boolean {
    if (isBookmarked(manga.slug)) {
        removeBookmark(manga.slug);
        return false;
    } else {
        addBookmark(manga);
        return true;
    }
}

/**
 * Hook to use bookmarks with reactivity
 */
export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState<BookmarkedManga[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load bookmarks on mount
    useEffect(() => {
        setBookmarks(getBookmarks());
        setIsLoaded(true);
    }, []);

    // Add bookmark and update state
    const add = useCallback((manga: BookmarkedManga) => {
        addBookmark(manga);
        setBookmarks(getBookmarks());
    }, []);

    // Remove bookmark and update state
    const remove = useCallback((slug: string) => {
        removeBookmark(slug);
        setBookmarks(getBookmarks());
    }, []);

    // Toggle bookmark and update state
    const toggle = useCallback((manga: BookmarkedManga): boolean => {
        const result = toggleBookmark(manga);
        setBookmarks(getBookmarks());
        return result;
    }, []);

    // Check if bookmarked
    const check = useCallback((slug: string): boolean => {
        return bookmarks.some(b => b.slug === slug);
    }, [bookmarks]);

    return {
        bookmarks,
        isLoaded,
        add,
        remove,
        toggle,
        isBookmarked: check,
    };
}

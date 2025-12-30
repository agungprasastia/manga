'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ReadingProgress {
    mangaSlug: string;
    mangaTitle: string;
    mangaCover: string;
    chapterSlug: string;
    chapterTitle: string;
    currentPage: number;
    totalPages: number;
    timestamp: number;
    source?: string;
}

const STORAGE_KEY = 'manga-reading-history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Get reading history from localStorage
 */
export function getReadingHistory(): ReadingProgress[] {
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
 * Save reading progress to localStorage
 */
export function saveReadingProgress(progress: ReadingProgress): void {
    if (typeof window === 'undefined') return;

    try {
        const history = getReadingHistory();

        // Remove existing entry for same manga
        const filtered = history.filter(item => item.mangaSlug !== progress.mangaSlug);

        // Add new progress at the beginning
        const updated = [progress, ...filtered].slice(0, MAX_HISTORY_ITEMS);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save reading progress:', error);
    }
}

/**
 * Remove a manga from reading history
 */
export function removeFromHistory(mangaSlug: string): void {
    if (typeof window === 'undefined') return;

    try {
        const history = getReadingHistory();
        const filtered = history.filter(item => item.mangaSlug !== mangaSlug);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to remove from history:', error);
    }
}

/**
 * Clear all reading history
 */
export function clearReadingHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get progress for a specific manga
 */
export function getMangaProgress(mangaSlug: string): ReadingProgress | null {
    const history = getReadingHistory();
    return history.find(item => item.mangaSlug === mangaSlug) || null;
}

/**
 * Hook to use reading history with reactivity
 */
export function useReadingHistory() {
    const [history, setHistory] = useState<ReadingProgress[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load history on mount
    useEffect(() => {
        setHistory(getReadingHistory());
        setIsLoaded(true);
    }, []);

    // Save progress and update state
    const saveProgress = useCallback((progress: ReadingProgress) => {
        saveReadingProgress(progress);
        setHistory(getReadingHistory());
    }, []);

    // Remove from history and update state
    const removeProgress = useCallback((mangaSlug: string) => {
        removeFromHistory(mangaSlug);
        setHistory(getReadingHistory());
    }, []);

    // Clear all history
    const clearHistory = useCallback(() => {
        clearReadingHistory();
        setHistory([]);
    }, []);

    return {
        history,
        isLoaded,
        saveProgress,
        removeProgress,
        clearHistory,
    };
}

/**
 * Format relative time for display
 */
export function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;

    return new Date(timestamp).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    });
}

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
});

export interface Manga {
    title: string;
    slug: string;
    cover: string;
    type?: string;
    chapter?: string;
    rating?: string;
    source?: 'komikcast' | 'komiku';
    updatedAt?: string;  // Relative time like "5 menit lalu", "2 jam lalu"
    updatedTimestamp?: string; // ISO timestamp for realtime calculation
}

export interface Chapter {
    title: string;
    slug: string;
    date?: string;
}

export interface MangaDetail {
    title: string;
    alternativeTitle?: string;
    cover: string;
    synopsis: string;
    status?: string;
    author?: string;
    type?: string;
    genres: string[];
    rating?: string;
    chapters: Chapter[];
    source?: 'komikcast' | 'komiku';
}

export interface ChapterImages {
    title: string;
    images: string[];
    prevChapter?: string;
    nextChapter?: string;
    mangaSlug?: string;
    source?: string;
}

export interface HomeData {
    latest: Manga[];
    popular: Manga[];
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export async function getHome(): Promise<HomeData> {
    const res = await api.get<ApiResponse<HomeData>>('/home');
    if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error || 'Failed to fetch home data');
    }
    return res.data.data;
}

export async function getLatest(page: number = 1): Promise<Manga[]> {
    const res = await api.get<ApiResponse<Manga[]>>('/latest', {
        params: { page },
    });
    if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error || 'Failed to fetch latest updates');
    }
    return res.data.data;
}

export async function searchManga(query: string): Promise<Manga[]> {
    const res = await api.get<ApiResponse<Manga[]>>('/search', {
        params: { q: query },
    });
    if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error || 'Failed to search manga');
    }
    return res.data.data;
}

export async function getMangaDetail(slug: string, source?: 'kiryuu' | 'komiku' | 'softkomik'): Promise<MangaDetail> {
    const res = await api.get<ApiResponse<MangaDetail>>(`/manga/${slug}`, {
        params: { source },
    });
    if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error || 'Manga not found');
    }
    return res.data.data;
}

export async function getChapter(slug: string, source?: 'kiryuu' | 'komiku' | 'softkomik'): Promise<ChapterImages> {
    const res = await api.get<ApiResponse<ChapterImages>>(`/chapter/${slug}`, {
        params: { source },
    });
    if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error || 'Chapter not found');
    }
    return res.data.data;
}

// Get enhanced cover for lazy loading
export async function getEnhancedCover(slug: string, source?: string): Promise<string | null> {
    try {
        const res = await api.get<ApiResponse<{ cover: string; source: string }>>(`/cover/${slug}`, {
            params: { source },
            timeout: 10000, // Shorter timeout for cover enhancement
        });
        if (res.data.success && res.data.data?.cover) {
            return res.data.data.cover;
        }
        return null;
    } catch {
        return null;
    }
}

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
    genres: string[];
    rating?: string;
    chapters: Chapter[];
}

export interface ChapterImages {
    title: string;
    images: string[];
    prevChapter?: string;
    nextChapter?: string;
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

export async function searchManga(query: string): Promise<Manga[]> {
    const res = await api.get<ApiResponse<Manga[]>>('/search', {
        params: { q: query },
    });
    if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error || 'Failed to search manga');
    }
    return res.data.data;
}

export async function getMangaDetail(slug: string): Promise<MangaDetail> {
    const res = await api.get<ApiResponse<MangaDetail>>(`/manga/${slug}`);
    if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error || 'Manga not found');
    }
    return res.data.data;
}

export async function getChapter(slug: string): Promise<ChapterImages> {
    const res = await api.get<ApiResponse<ChapterImages>>(`/chapter/${slug}`);
    if (!res.data.success || !res.data.data) {
        throw new Error(res.data.error || 'Chapter not found');
    }
    return res.data.data;
}

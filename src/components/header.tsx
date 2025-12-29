'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md border-border/40 shadow-sm' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="container max-w-7xl h-16 flex items-center justify-between gap-6">
        {/* Logo Text Only - Stylized */}
        <Link href="/" className="shrink-0 group">
          <h1 className="text-3xl font-extrabold tracking-tight relative">
            <span className="text-white group-hover:text-primary transition-colors">Manga</span>
            <span className="text-primary group-hover:text-white transition-colors">Ku</span>
            {/* Dot accent */}
            <span className="absolute -bottom-1 right-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></span>
          </h1>
        </Link>

        {/* Search Bar - Wider and Cleaner */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
           <form onSubmit={handleSearch} className="relative group">
            <Input
              type="search"
              placeholder="Cari komik favoritmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/30 border-border/30 focus:bg-background focus:border-primary/50 transition-all rounded-full pl-6 pr-12 h-11 text-sm shadow-inner focus:shadow-lg focus:shadow-primary/5 placeholder:text-muted-foreground/50"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full hover:bg-primary hover:text-white transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>
          </form>
        </div>

        {/* Navigation - Minimalist */}
        <nav className="flex items-center gap-1 shrink-0">
          <Link href="/">
             <Button variant="ghost" className="text-sm font-medium hover:text-primary hover:bg-transparent">Home</Button>
          </Link>
          <Link href="/bookmarks">
             <Button variant="ghost" className="text-sm font-medium hover:text-primary hover:bg-transparent">Bookmark</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </Button>
        </nav>
      </div>
    </header>
  );
}

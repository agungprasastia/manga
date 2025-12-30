'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Menu, X, Loader2, Sparkles, Home, Bookmark, ChevronRight } from 'lucide-react';
import { searchManga } from '@/lib/api';
import { animate, stagger } from 'animejs';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // Mobile search state
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search Query
  const { data: results, isLoading } = useQuery({
    queryKey: ['search-header', debouncedQuery],
    queryFn: () => searchManga(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  // Show/Hide results based on input
  useEffect(() => {
    if (debouncedQuery.length > 2) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [debouncedQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setShowResults(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Lock Body Scroll when Menu is Open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      
      // Animate drawer panel
      if (drawerRef.current) {
        animate(drawerRef.current, {
          translateX: ['100%', '0%'],
          opacity: [0, 1],
          duration: 400,
          ease: 'outExpo'
        });
      }
      
      // Animate menu items with stagger
      if (menuItemsRef.current) {
        const menuItems = menuItemsRef.current.querySelectorAll('.menu-item');
        animate(menuItems, {
          translateX: [50, 0],
          opacity: [0, 1],
          delay: stagger(80, { start: 200 }),
          duration: 500,
          ease: 'outExpo'
        });
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isMobileMenuOpen 
          ? 'bg-transparent border-transparent' // Let the overlay handle the background
          : isScrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' 
            : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container max-w-7xl h-18 py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
        {/* Logo - Enhanced with Glow */}
        <Link href="/" className="shrink-0 group relative z-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-purple-500/20 
            rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h1 className="relative text-2xl sm:text-3xl font-black tracking-tight">
            <span className="text-white group-hover:text-transparent group-hover:bg-clip-text 
              group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 
              transition-all duration-300">Manga</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400
              group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">Ku</span>
          </h1>
        </Link>

        {/* Search Bar - Glassmorphism Style (Desktop) */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative group">
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50 
              rounded-full opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
            
            <div className="relative flex items-center">
              <Input
                type="search"
                placeholder="Cari komik favoritmu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (debouncedQuery.length > 2) setShowResults(true); }}
                className="w-full bg-white/5 backdrop-blur-md border-white/10 
                  focus:bg-white/10 focus:border-primary/50 
                  transition-all duration-300 rounded-full pl-4 sm:pl-6 pr-16 sm:pr-20 h-10 sm:h-12 text-xs sm:text-sm
                  placeholder:text-white/40"
              />
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setDebouncedQuery(''); }}
                  className="absolute right-12 sm:right-14 p-1.5 text-white/50 hover:text-white 
                    rounded-full hover:bg-white/10 transition-all"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
              
              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full 
                  bg-gradient-to-r from-primary to-blue-500 
                  hover:from-primary/90 hover:to-blue-400
                  shadow-lg shadow-primary/30 
                  transition-all duration-300 hover:scale-105"
              >
                {isLoading && searchQuery.length > 2 ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-white" />
                ) : (
                  <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                )}
              </Button>
            </div>

            {/* Live Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full mt-3 left-0 right-0 
                bg-card/95 backdrop-blur-xl border border-white/10 
                rounded-2xl shadow-2xl shadow-black/50 overflow-hidden 
                animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[400px] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-6 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                      <span className="text-muted-foreground text-sm">Mencari...</span>
                    </div>
                  ) : results && results.length > 0 ? (
                    <>
                      {results.slice(0, 5).map((manga, index) => (
                        <Link 
                          key={manga.slug} 
                          href={`/manga/${manga.slug}`}
                          className="flex gap-4 p-4 hover:bg-white/5 transition-all duration-200
                            border-b border-white/5 last:border-none group/item"
                          onClick={() => setShowResults(false)}
                        >
                          <div className="relative w-14 h-20 shrink-0 rounded-lg overflow-hidden 
                            bg-muted shadow-lg group-hover/item:shadow-primary/20 transition-shadow">
                            <Image 
                              src={manga.cover} 
                              alt={manga.title}
                              fill
                              className="object-cover group-hover/item:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-semibold text-sm line-clamp-1 text-white 
                              group-hover/item:text-primary transition-colors">
                              {manga.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              {manga.rating && (
                                <span className="text-xs text-yellow-400 font-medium 
                                  flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                                  ★ {manga.rating}
                                </span>
                              )}
                              {manga.type && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  manga.type.toLowerCase() === 'manhwa' 
                                    ? 'bg-orange-500/20 text-orange-400' 
                                    : manga.type.toLowerCase() === 'manhua' 
                                      ? 'bg-purple-500/20 text-purple-400' 
                                      : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {manga.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                      <div className="p-3 bg-white/5">
                        <Button 
                          variant="ghost" 
                          className="w-full text-sm h-10 text-white/70 hover:text-primary 
                            hover:bg-primary/10 rounded-xl font-medium"
                          onClick={(e) => handleSearch(e)}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Lihat semua hasil
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="w-8 h-8 text-white/20 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Tidak ada hasil ditemukan</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 shrink-0">
          <Link href="/">
            <Button variant="ghost" className="text-sm font-medium text-white/80 
              hover:text-white hover:bg-white/10 rounded-full px-5 transition-all">
              Home
            </Button>
          </Link>
          <Link href="/bookmarks">
            <Button variant="ghost" className="text-sm font-medium text-white/80 
              hover:text-white hover:bg-white/10 rounded-full px-5 transition-all">
              Bookmark
            </Button>
          </Link>
        </nav>

        {/* Mobile Actions: Search & Menu */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white/80 hover:text-white"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          >
            <Search className="h-6 w-6" />
          </Button>

          {/* Mobile Menu Toggle */}
          {!isMobileMenuOpen && (
            <Button
              variant="ghost" 
              size="icon" 
              className="text-white/80 hover:text-white relative z-[110] transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Mobile Search Bar Overlay */}
        {isMobileSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 animate-in slide-in-from-top-2 duration-200 shadow-2xl z-40">
             <form onSubmit={(e) => { handleSearch(e); setIsMobileSearchOpen(false); }} className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
               <Input
                 type="search"
                 autoFocus
                 placeholder="Cari manga..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white/5 border-white/10 h-12 pl-12 pr-12 rounded-xl
                   focus:border-primary/50 text-base placeholder:text-white/30 text-white"
               />
               {searchQuery && (
                 <button
                   type="button"
                   onClick={() => { setSearchQuery(''); setDebouncedQuery(''); }}
                   className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-white 
                     rounded-full hover:bg-white/10 transition-all"
                 >
                   <X className="w-4 h-4" />
                 </button>
               )}
             </form>

             {/* Mobile Live Search Results */}
             {showResults && (
               <div className="mt-3 bg-card/95 backdrop-blur-xl border border-white/10 
                 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                 <div className="max-h-[50vh] overflow-y-auto">
                   {isLoading ? (
                     <div className="p-6 text-center">
                       <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                       <span className="text-muted-foreground text-sm">Mencari...</span>
                     </div>
                   ) : results && results.length > 0 ? (
                     <>
                       {results.slice(0, 5).map((manga) => (
                         <Link 
                           key={manga.slug} 
                           href={`/manga/${manga.slug}`}
                           className="flex gap-3 p-3 hover:bg-white/5 transition-all duration-200
                             border-b border-white/5 last:border-none group/item"
                           onClick={() => { setShowResults(false); setIsMobileSearchOpen(false); }}
                         >
                           <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden 
                             bg-muted shadow-lg group-hover/item:shadow-primary/20 transition-shadow">
                             <Image 
                               src={manga.cover} 
                               alt={manga.title}
                               fill
                               className="object-cover group-hover/item:scale-105 transition-transform duration-300"
                             />
                           </div>
                           <div className="flex-1 min-w-0 flex flex-col justify-center">
                             <h4 className="font-semibold text-sm line-clamp-1 text-white 
                               group-hover/item:text-primary transition-colors">
                               {manga.title}
                             </h4>
                             <div className="flex items-center gap-2 mt-1">
                               {manga.rating && (
                                 <span className="text-xs text-yellow-400 font-medium 
                                   flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                                   ★ {manga.rating}
                                 </span>
                               )}
                               {manga.type && (
                                 <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                   manga.type.toLowerCase() === 'manhwa' 
                                     ? 'bg-orange-500/20 text-orange-400' 
                                     : manga.type.toLowerCase() === 'manhua' 
                                       ? 'bg-purple-500/20 text-purple-400' 
                                       : 'bg-blue-500/20 text-blue-400'
                                 }`}>
                                   {manga.type}
                                 </span>
                               )}
                             </div>
                           </div>
                         </Link>
                       ))}
                       <div className="p-3 bg-white/5">
                         <Button 
                           variant="ghost" 
                           className="w-full text-sm h-10 text-white/70 hover:text-primary 
                             hover:bg-primary/10 rounded-xl font-medium"
                           onClick={(e) => { handleSearch(e); setIsMobileSearchOpen(false); }}
                         >
                           <Sparkles className="w-4 h-4 mr-2" />
                           Lihat semua hasil
                         </Button>
                       </div>
                     </>
                   ) : (
                     <div className="p-6 text-center">
                       <Search className="w-8 h-8 text-white/20 mx-auto mb-3" />
                       <p className="text-muted-foreground text-sm">Tidak ada hasil ditemukan</p>
                     </div>
                   )}
                 </div>
               </div>
             )}
          </div>
        )}

        {/* Mobile Menu Sidebar (Drawer) */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Drawer Panel */}
            <div 
              ref={drawerRef}
              className="fixed inset-y-0 right-0 z-[101] w-[80%] sm:w-[350px] 
              bg-[#0a0a0a] border-l border-white/10 shadow-2xl shadow-black
              flex flex-col p-6"
              style={{ transform: 'translateX(100%)', opacity: 0 }}
            >
              
              <div className="flex items-center justify-end mb-8">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/50 hover:text-white bg-transparent hover:bg-transparent active:bg-transparent rounded-full transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* No Search Here as requested */}

              <nav ref={menuItemsRef} className="flex flex-col gap-2">
                {[
                  { href: "/", label: "Home", icon: Home },
                  { href: "/bookmarks", label: "Bookmark", icon: Bookmark },
                ].map((item) => (
                  <Link key={item.href} href={item?.href || '#'} onClick={() => setIsMobileMenuOpen(false)} className="menu-item" style={{ opacity: 0, transform: 'translateX(50px)' }}>
                    <Button variant="ghost" className="w-full justify-start text-base h-14 rounded-xl mb-2
                      text-white/70 hover:text-white hover:bg-white/5 group relative overflow-hidden"
                    >
                       <div className="w-10 h-10 rounded-lg bg-white/5 group-hover:bg-primary/20 
                         flex items-center justify-center mr-4 transition-colors duration-300">
                         <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                       </div>
                       <span className="font-medium">{item.label}</span>
                       <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Button>
                  </Link>
                ))}
              </nav>

              {/* Footer / Copyright in Menu */}
              <div className="mt-auto pt-8 border-t border-white/5 animate-in fade-in delay-500 duration-700">
                 <p className="text-white/30 text-xs text-center">
                   &copy; 2025 MangaKu App. <br/> Made with ❤️
                 </p>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

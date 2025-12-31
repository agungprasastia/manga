'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bookmark, Menu } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Home', matchPaths: ['/'] },
  { href: '/search', icon: Search, label: 'Cari', matchPaths: ['/search'] },
  { href: '/bookmarks', icon: Bookmark, label: 'Bookmark', matchPaths: ['/bookmarks'] },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Don't show on chapter reader
  if (pathname.startsWith('/chapter/')) {
    return null;
  }

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
    }
    return pathname === item.href;
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Background with blur */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/10" />
        
        {/* Safe area padding for notched devices */}
        <div className="relative flex items-center justify-around h-16 pb-safe">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl 
                  transition-all duration-200 active:scale-95
                  ${active 
                    ? 'text-primary' 
                    : 'text-white/50 hover:text-white/80'
                  }`}
              >
                <div className={`relative ${active ? 'scale-110' : ''} transition-transform`}>
                  <item.icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : ''}`} />
                  {active && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 
                      bg-primary rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

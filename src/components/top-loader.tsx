'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setProgress(0);
    
    // Clear any existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Animate progress
    let currentProgress = 0;
    intervalRef.current = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 90) {
        currentProgress = 90;
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setProgress(currentProgress);
    }, 100);
  }, []);

  const completeLoading = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    
    // Hide after animation completes
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 300);
  }, []);

  // Listen for navigation start via click events
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor?.href) {
        const url = new URL(anchor.href, window.location.origin);
        // Only trigger for internal navigation
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          startLoading();
        }
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [pathname, startLoading]);

  // Complete loading when pathname/searchParams change
  useEffect(() => {
    if (loading) {
      completeLoading();
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname, searchParams, completeLoading]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary via-blue-500 to-primary 
          shadow-[0_0_15px_theme(colors.primary.DEFAULT)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: loading ? 1 : 0,
        }}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled 500px
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-6 right-4 sm:right-6 z-40 w-10 h-10 sm:w-12 sm:h-12 rounded-full 
        bg-primary/90 hover:bg-primary shadow-lg shadow-primary/30
        transition-all duration-300 hover:scale-110
        animate-fade-in-up"
      aria-label="Back to top"
    >
      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
    </Button>
  );
}

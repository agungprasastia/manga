'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Component that scrolls to top when route changes
 * Should be placed in layout to work globally
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Smooth scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

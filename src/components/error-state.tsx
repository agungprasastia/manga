'use client';

import { AlertTriangle, WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: 'error' | 'network' | 'notfound';
  onRetry?: () => void;
  showHomeButton?: boolean;
}

/**
 * Reusable error state component for better mobile UX
 */
export function ErrorState({
  title,
  message,
  type = 'error',
  onRetry,
  showHomeButton = true,
}: ErrorStateProps) {
  const configs = {
    error: {
      icon: AlertTriangle,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      defaultTitle: 'Terjadi Kesalahan',
      defaultMessage: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
    },
    network: {
      icon: WifiOff,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      defaultTitle: 'Tidak Ada Koneksi',
      defaultMessage: 'Periksa koneksi internet kamu dan coba lagi.',
    },
    notfound: {
      icon: AlertTriangle,
      iconBg: 'bg-muted/30',
      iconColor: 'text-muted-foreground',
      defaultTitle: 'Tidak Ditemukan',
      defaultMessage: 'Konten yang kamu cari tidak tersedia.',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className={`p-5 ${config.iconBg} rounded-full mb-5`}>
        <Icon className={`w-10 h-10 sm:w-12 sm:h-12 ${config.iconColor}`} />
      </div>
      
      {/* Title */}
      <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
        {title || config.defaultTitle}
      </h2>
      
      {/* Message */}
      <p className="text-sm sm:text-base text-muted-foreground max-w-sm mb-6">
        {message || config.defaultMessage}
      </p>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="rounded-full px-6 bg-gradient-to-r from-primary to-blue-500 
              hover:from-primary/90 hover:to-blue-400 shadow-lg shadow-primary/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        )}
        
        {showHomeButton && (
          <Link href="/">
            <Button variant="outline" className="rounded-full px-6 border-white/20">
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Home
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Bookmark, Home } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-7xl py-16 sm:py-20 md:py-24 px-4 sm:px-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-5 md:space-y-6">
          <div className="p-4 sm:p-5 md:p-6 bg-primary/10 rounded-full">
            <Bookmark className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Bookmark
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-lg mx-auto px-4">
            Fitur bookmark sedang dalam pengembangan. Segera hadir untuk menyimpan manga favoritmu!
          </p>
          <Link href="/">
            <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 h-10 sm:h-11 md:h-12 text-sm sm:text-base px-6 sm:px-8">
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> Kembali ke Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

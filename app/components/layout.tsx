'use client';

import React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-white ${inter.className}`}>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-[20px] font-bold text-[rgba(0,0,0,0.8)]"
          >
            LegalFlow
          </Link>

          {/* Navigation Links */}
          <div className="ml-12 flex space-x-8">
            <Link
              href="/dashboard"
              className={`relative h-16 inline-flex items-center px-1 text-[16px] font-normal ${
                pathname === '/dashboard'
                  ? 'text-[rgba(0,0,0,0.8)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0000FF]'
                  : 'text-[rgba(0,0,0,0.54)]'
              }`}
            >
              Lawyer Dashboard
            </Link>
            <Link
              href="/documents"
              className={`relative h-16 inline-flex items-center px-1 text-[16px] font-normal ${
                pathname === '/documents'
                  ? 'text-[rgba(0,0,0,0.8)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0000FF]'
                  : 'text-[rgba(0,0,0,0.54)]'
              }`}
            >
              Documents
            </Link>
            <Link
              href="/cases"
              className={`relative h-16 inline-flex items-center px-1 text-[16px] font-normal ${
                pathname === '/cases'
                  ? 'text-[rgba(0,0,0,0.8)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0000FF]'
                  : 'text-[rgba(0,0,0,0.54)]'
              }`}
            >
              Cases
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MainNav } from './MainNav';
import { Search, Bell } from 'lucide-react'; // Removed Menu, X as they are now handled in MainNav
import { useState } from 'react';
// import { UserNav } from './UserNav'; // Uncomment if you have a UserNav component

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  // --- State for mobile menu remains here ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    // Style matches "ideal" header
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 md:pl-16">
      <div>
        {/* Mobile Logo (matches "ideal" header) */}
        <div className="md:hidden mr-4 flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Atlas
            </span>
          </Link>
        </div>

        {/* MainNav component directly in header */}
        <MainNav
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

      </div>

      {/* Search Panel (matches "ideal" header) */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 z-50 md:ml-16 shadow-md">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties, locations, or features..." // Updated placeholder
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              autoFocus
              // Add onChange, onKeyDown etc. for search functionality
            />
          </div>
        </div>
      )}
    </header>
  );
}

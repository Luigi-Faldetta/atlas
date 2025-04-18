'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MainNav } from './MainNav'; // This component holds the main navigation links
import { Search, Bell } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 md:pl-16">
      <div className="flex h-16 items-center px-4">
        {/* Logo/Brand for mobile */}
        <div className="md:hidden mr-4 flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Atlas
            </span>
          </Link>
        </div>

        {/* Right side content */}
        <div className="flex-1 flex items-center justify-between md:justify-end">
          {/* Main Navigation (likely includes Dashboard, Properties, etc.) */}
          {/* This is where the "About" link should be added (inside MainNav.tsx) */}
          <MainNav />

          {/* Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              aria-label="View notifications"
            >
              <Bell className="h-5 w-5" />
              {/* Example notification indicator */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </Button>

            {/* User Menu would go here if needed */}
            {/* <UserNav /> */}
          </div>
        </div>
      </div>

      {/* Search Panel */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 z-50 md:ml-16 shadow-md">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties, locations, or features..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              autoFocus
            />
            {/* You could add suggestions or results here */}
          </div>
        </div>
      )}
    </header>
  );
}

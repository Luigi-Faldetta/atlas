'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  LayoutDashboard,
  Building2,
  Wallet,
  LineChart,
  Calculator,
  Info,
  Menu, // Keep icons
  X,
  Settings, // Keep icons
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Define Props interface (accepts state from Header)
interface MainNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// --- Use the FULL list of nav items ---
const navItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Properties',
    href: '/properties',
    icon: Building2,
  },
  {
    name: 'Portfolio',
    href: '/portfolio',
    icon: Wallet,
  },
  {
    name: 'Market',
    href: '/market',
    icon: LineChart,
  },
  {
    name: 'Tools',
    href: '/tools',
    icon: Calculator,
  },
  {
    name: 'About',
    href: '/about',
    icon: Info,
  },
  // Example: Add a settings link
  // {
  //   name: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  // },
];

// Accept props: mobileMenuOpen and setMobileMenuOpen
export function MainNav({ mobileMenuOpen, setMobileMenuOpen }: MainNavProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false); // State for desktop expand/collapse
  // Removed internal mobileMenuOpen state
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  // Handle window resize (matches "ideal" logic + closes mobile menu)
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWindowWidth(currentWidth);
      // Collapse expanded sidebar if window becomes too small
      if (currentWidth < 768 && expanded) {
        setExpanded(false);
      }
      // Close mobile menu if window becomes large enough for desktop view
      if (currentWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
    // Depend on props and expanded state
  }, [expanded, mobileMenuOpen, setMobileMenuOpen]);

  const isMobile = windowWidth < 768;

  return (
    <>
      {/* Desktop Vertical Nav */}
      <nav
        className={cn(
          'hidden md:flex fixed left-0 top-0 h-full flex-col bg-slate-900 dark:bg-slate-950 transition-all duration-300 z-40 overflow-x-hidden',
          'border-r border-slate-800 dark:border-slate-700'
        )}
        style={{ width: expanded ? '16rem' : '4rem' }}
      >
        {/* Logo at the top */}
        <div className="flex items-center justify-center h-16 border-b border-slate-800 flex-shrink-0">
          <Link href="/" className="flex items-center justify-center">
            {expanded ? (
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Atlas
              </span>
            ) : (
              <div className="w-8 h-8">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-blue-500"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="50 12"
                    strokeDashoffset="10"
                    fill="none"
                  />
                </svg>
              </div>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center py-3 px-3 my-1 mx-2 rounded-lg transition-colors relative group',
                  expanded ? 'justify-start' : 'justify-center',
                  isActive
                    ? 'text-white bg-blue-600 dark:bg-blue-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
                title={!expanded ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {expanded && (
                  <span className="ml-3 whitespace-nowrap">{item.name}</span>
                )}
                {!expanded && (
                  <span className="fixed left-16 ml-2 p-2 min-w-max rounded bg-slate-800 text-white text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Toggle expand/collapse button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Button - REMOVED */}
      {/*
      <button
        className="md:hidden flex items-center p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
      */}

      {/* Mobile Menu - REMOVED */}
      {/*
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="h-full w-3/4 max-w-xs bg-white dark:bg-slate-900 p-4 shadow-xl overflow-y-auto overflow-x-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Atlas
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-lg py-3 px-4 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-white bg-blue-600 dark:bg-blue-700'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      */}
    </>
  );
}

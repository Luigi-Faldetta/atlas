'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  LayoutDashboard, // Added for Dashboard
  Building2, // Keep for Properties
  Wallet, // Keep for Portfolio
  LineChart, // Keep for Market
  Calculator, // Keep for Tools
  Info, // Keep for About
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Combined Navigation Items
const navItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Dashboard',
    href: '/dashboard', // Assuming this is the correct path
    icon: LayoutDashboard,
  },
  {
    name: 'Properties',
    href: '/properties', // Assuming this is the correct path
    icon: Building2,
  },
  {
    name: 'Portfolio',
    href: '/portfolio', // Assuming this is the correct path
    icon: Wallet,
  },
  {
    name: 'Market',
    href: '/market', // Assuming this is the correct path
    icon: LineChart,
  },
  {
    name: 'Tools',
    href: '/tools', // Assuming this is the correct path
    icon: Calculator,
  },
  {
    name: 'About',
    href: '/about',
    icon: Info,
  },
];

export function MainNav() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWindowWidth(currentWidth);
      // Close the expanded menu if resizing to mobile width
      if (currentWidth < 768 && expanded) {
        setExpanded(false);
      }
      // Close mobile menu on resize if it was open
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      // Initial check in case it starts in mobile view
      handleResize();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [expanded, mobileMenuOpen]); // Add mobileMenuOpen dependency

  // Determine if on mobile based on state
  const isMobile = windowWidth < 768;

  return (
    <>
      {/* Desktop Vertical Nav */}
      <div
        className={cn(
          'hidden md:flex fixed left-0 top-0 h-full flex-col bg-slate-900 dark:bg-slate-950 transition-all duration-300 z-40 overflow-x-hidden',
          // Add border to the right
          'border-r border-slate-800 dark:border-slate-700'
        )}
        style={{ width: expanded ? '16rem' : '4rem' }}
        onMouseEnter={() => !isMobile && setExpanded(true)} // Expand on hover (desktop only)
        onMouseLeave={() => !isMobile && setExpanded(false)} // Collapse on leave (desktop only)
      >
        {/* Logo at the top */}
        <div className="flex items-center justify-center h-16 border-b border-slate-800 dark:border-slate-700 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center justify-center w-full h-full"
          >
            {expanded ? (
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Atlas
              </span>
            ) : (
              <div className="w-8 h-8">
                {/* Simple Atlas Icon Placeholder */}
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
                    strokeDasharray="50 12" // Creates a dashed circle effect
                    strokeDashoffset="10"
                    fill="none"
                  />
                </svg>
              </div>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          {navItems.map((item) => {
            // Ensure consistent active state check (handle base path '/')
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
                  'flex items-center py-3 px-3 my-1 mx-2 rounded-lg transition-colors relative group whitespace-nowrap', // Added whitespace-nowrap
                  expanded ? 'justify-start' : 'justify-center',
                  isActive
                    ? 'text-white bg-blue-600 dark:bg-blue-700' // Slightly darker active bg in dark mode
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-700'
                )}
                title={!expanded ? item.name : undefined} // Add title for tooltip when collapsed
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {expanded && <span className="ml-3">{item.name}</span>}
                {/* Tooltip logic removed as title attribute is simpler */}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section (Optional - Add if needed) */}
        {/* <div className="p-3 border-t border-slate-800 dark:border-slate-700"> ... </div> */}
      </div>

      {/* Mobile Menu Button (Rendered within Header.tsx, but logic kept here for context) */}
      {/* This button is actually rendered in Header.tsx, but the state logic is here */}
      {/* <button
        className="md:hidden flex items-center p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button> */}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setMobileMenuOpen(false)} // Close on overlay click
        >
          <div
            className="h-full w-3/4 max-w-xs bg-white dark:bg-slate-900 p-4 shadow-xl overflow-y-auto overflow-x-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside menu
          >
            {/* Mobile Menu Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Atlas
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Mobile Nav items */}
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
                    onClick={() => setMobileMenuOpen(false)} // Close menu on link click
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Profile Section (Optional - Add if needed) */}
            {/* <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"> ... </div> */}
          </div>
        </div>
      )}
    </>
  );
}

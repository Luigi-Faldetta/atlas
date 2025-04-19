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
  Menu, // Keep icons if needed for other purposes
  X,
  Settings, // Example: Added Settings icon
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Define Props interface
interface MainNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Combined Navigation Items
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
  const [expanded, setExpanded] = useState(false);
  // Removed internal mobileMenuOpen state
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  // Handle window resize
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
      <div
        className={cn(
          'hidden md:flex fixed left-0 top-0 h-full flex-col bg-slate-900 dark:bg-slate-950 transition-all duration-300 z-40 overflow-x-hidden',
          'border-r border-slate-800 dark:border-slate-700'
        )}
        style={{ width: expanded ? '16rem' : '4rem' }}
        onMouseEnter={() => !isMobile && setExpanded(true)}
        onMouseLeave={() => !isMobile && setExpanded(false)}
      >
        {/* Desktop Logo */}
        <div className="flex items-center justify-center h-16 border-b border-slate-800 dark:border-slate-700 flex-shrink-0">
          <Link href="/" className="flex items-center justify-center">
            {/* Example Logo - replace with your actual logo */}
            <svg
              className={cn(
                'h-8 w-8 text-blue-500 transition-opacity duration-300',
                expanded ? 'opacity-100' : 'opacity-100'
              )}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span
              className={cn(
                'ml-2 text-xl font-bold text-white transition-opacity duration-200 whitespace-nowrap',
                expanded ? 'opacity-100 delay-100' : 'opacity-0'
              )}
            >
              Atlas
            </span>
          </Link>
        </div>

        {/* Desktop Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
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
                  'flex items-center h-12 mx-2 rounded-lg text-sm font-medium transition-colors overflow-hidden whitespace-nowrap',
                  isActive
                    ? 'text-white bg-blue-600 dark:bg-blue-700'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
                title={item.name} // Tooltip when collapsed
              >
                <div className="w-16 h-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    'transition-opacity duration-200',
                    expanded ? 'opacity-100 delay-100' : 'opacity-0'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        {/* Optional Footer in Sidebar */}
        {/* <div className="mt-auto p-4 border-t border-slate-800"> ... </div> */}
      </div>

      {/* Mobile Menu Overlay (uses props now) */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" // Ensure high z-index
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
                className="p-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
              >
                <X className="w-6 h-6" />
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
                        ? 'text-white bg-blue-600 dark:bg-blue-700' // Active mobile style
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white' // Inactive mobile style
                    )}
                    onClick={() => setMobileMenuOpen(false)} // Close menu on link click
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
    </>
  );
}

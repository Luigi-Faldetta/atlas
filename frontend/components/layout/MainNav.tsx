'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  LineChart,
  Wallet,
  BarChart3,
  Search,
  Calculator,
  Info,
  Menu,
  X,
  Building2,
  LayoutDashboard,
  Settings,
  Star,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserButton, SignedIn } from '@clerk/nextjs';

// Full list of nav items
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
    name: 'Watchlist',
    href: '/watchlist',
    icon: Star,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
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
];

export function MainNav() {
  const pathname = usePathname();
  // Desktop nav no longer supports expansion; fixed width only
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  // Handle window resize: update width & close mobile menu if needed
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWindowWidth(currentWidth);
      if (currentWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // initial check

    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Determine if on mobile
  const isMobile = windowWidth < 768;

  return (
    <>
      {/* Desktop Vertical Nav (always collapsed with fixed width) */}
      <nav
        className={cn(
          'hidden md:flex fixed left-0 top-0 h-full flex-col bg-slate-900 dark:bg-slate-950 transition-all duration-300 z-40 overflow-x-hidden',
          'border-r border-slate-800 dark:border-slate-700'
        )}
        style={{ width: '4rem' }}
      >
        {/* Logo at the top */}
        <div className="flex items-center justify-center h-16 border-b border-slate-800 flex-shrink-0">
          <Link href="/" className="flex items-center justify-center">
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
                  'justify-center',
                  isActive
                    ? 'text-white bg-blue-600 dark:bg-blue-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
                title={item.name}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="fixed left-16 ml-2 p-2 min-w-max rounded bg-slate-800 text-white text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Desktop User Button at the bottom */}
        <div className="p-3 border-t border-slate-800 flex justify-center">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10',
              },
            }}
            afterSignOutUrl="/login"
          />
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 flex items-center p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="h-full w-3/4 max-w-xs bg-white dark:bg-slate-900 p-4 shadow-xl overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Atlas
                </span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <nav className="flex flex-col space-y-2">
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
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'text-white bg-blue-600 dark:bg-blue-700'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile User Button: Only rendered if user is signed in */}
            <SignedIn>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10',
                    },
                  }}
                  afterSignOutUrl="/login"
                />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </>
  );
}

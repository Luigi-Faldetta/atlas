'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Home,
  LayoutDashboard,
  Star,
  TrendingUp,
  Calculator,
  Info,
  Menu,
  X,
} from 'lucide-react';
import { SignedIn, SignedOut, useAuth, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

// Define a custom React component for the new properties icon
function PropertiesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-building2"
      {...props}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
      <path d="M10 6h4"></path>
      <path d="M10 10h4"></path>
      <path d="M10 14h4"></path>
      <path d="M10 18h4"></path>
    </svg>
  );
}

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  // Use the custom PropertiesIcon here
  { name: 'Properties', href: '/properties', icon: PropertiesIcon },
  { name: 'Watchlist', href: '/watchlist', icon: Star },
  { name: 'Market Analysis', href: '/market-analysis', icon: TrendingUp },
  { name: 'Tools', href: '/tools', icon: Calculator },
  { name: 'About', href: '/about', icon: Info },
];

export function MainNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const { isSignedIn } = useAuth();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWindowWidth(currentWidth);
      if (currentWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on path change
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Desktop Vertical Nav (collapsed sidebar) */}
      <nav
        className={cn(
          'hidden md:flex fixed left-0 top-0 h-full flex-col bg-slate-900 dark:bg-slate-950 z-40 overflow-x-hidden',
          'border-r border-slate-800 dark:border-slate-700 transition-all duration-300'
        )}
        style={{ width: '4rem' }}
      >
        {/* Logo */}
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
                  'flex items-center py-3 px-3 my-1 mx-2 rounded-lg transition-colors relative group justify-center',
                  isActive
                    ? 'bg-blue-600 text-white dark:bg-blue-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
                title={item.name}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {/* Tooltip on hover */}
                <span className="fixed left-16 ml-2 p-2 min-w-max rounded bg-slate-800 text-white text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 whitespace-nowrap">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Desktop User Button */}
        <div className="p-3 border-t border-slate-800 flex justify-center">
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
              afterSignOutUrl="/login"
            />
          </SignedIn>
          <SignedOut>
            <Button asChild variant="ghost" size="icon">
              <Link href="/login" title="Login">
                Login
              </Link>
            </Button>
          </SignedOut>
        </div>
      </nav>

      {/* Mobile Menu Button (Hamburger) */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 right-4 z-50 bg-background/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </Button>

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full flex flex-col overflow-y-auto p-4">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 mr-2">
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
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 bg-clip-text text-transparent">
                Atlas
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 flex flex-col space-y-2">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-base',
                    isActive
                      ? 'bg-blue-600 text-white dark:bg-blue-700 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile User Button / Auth */}
          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                  },
                }}
                afterSignOutUrl="/login"
                showName
              />
            </SignedIn>
            <SignedOut>
              <div className="space-y-2 mt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

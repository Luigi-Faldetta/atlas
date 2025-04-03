"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  LineChart, 
  Wallet, 
  BarChart3, 
  Search, 
  Calculator,
  Menu,
  X,
  Building2
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home
  },
  {
    name: "Properties",
    href: "/properties",
    icon: Building2
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3
  },
  {
    name: "Wallet",
    href: "/wallet",
    icon: Wallet
  },
  {
    name: "Tools",
    href: "/tools",
    icon: Calculator
  }
];

export function MainNav() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Close the expanded menu if resizing to mobile
      if (window.innerWidth < 768 && expanded) {
        setExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [expanded]);

  // Determine if on mobile
  const isMobile = windowWidth < 768;

  return (
    <>
      {/* Desktop Vertical Nav */}
      <div 
        className="hidden md:flex fixed left-0 top-0 h-full flex-col bg-slate-900 dark:bg-slate-950 transition-all duration-300 z-40 overflow-x-hidden"
        style={{ width: expanded ? '16rem' : '4rem' }}
      >
        {/* Logo at the top */}
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <Link href="/" className="flex items-center justify-center">
            {expanded ? (
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Atlas
              </span>
            ) : (
              <div className="w-8 h-8">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center py-3 px-3 my-1 mx-2 rounded-lg transition-colors relative group",
                  expanded ? "justify-start" : "justify-center",
                  isActive
                    ? "text-white bg-blue-600"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {expanded && <span className="ml-3">{item.name}</span>}
                {!expanded && (
                  // Tooltip for collapsed state
                  <span className="fixed left-16 ml-2 p-2 min-w-max rounded bg-slate-800 text-white text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle expand/collapse button */}
        <div className="p-3 border-t border-slate-800">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {expanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
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
          <div className="h-full w-3/4 max-w-xs bg-white dark:bg-slate-900 p-4 shadow-xl overflow-y-auto overflow-x-hidden">
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
            
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg py-3 px-4 text-sm font-medium transition-colors",
                      isActive
                        ? "text-white bg-blue-600"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Link 
                href="/profile"
                className="flex items-center rounded-lg py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 mr-3"></div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">View profile</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
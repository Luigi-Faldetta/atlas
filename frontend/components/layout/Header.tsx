"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "./MainNav";
import { User, LogOut, Settings } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Atlas
            </span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-between">
          <MainNav />
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Button 
                variant="ghost"
                size="icon"
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User className="h-5 w-5" />
              </Button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-3 text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    <div className="font-medium">John Doe</div>
                    <div className="text-slate-500 dark:text-slate-400 truncate">john@example.com</div>
                  </div>
                  
                  <Link 
                    href="/profile"
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </div>
                  </Link>
                  
                  <Link 
                    href="/settings"
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </div>
                  </Link>
                  
                  <Link 
                    href="/login"
                    className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 
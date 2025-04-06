"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "./MainNav";
import { User, LogOut, Settings, Search, Bell } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 md:pl-16">
      <div className="flex h-16 items-center px-4">
        <div className="md:hidden mr-4 flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Atlas
            </span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-between md:justify-end">
          <MainNav />
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <Button 
              variant="ghost"
              size="icon"
              className="relative text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Notifications */}
            <Button 
              variant="ghost"
              size="icon"
              className="relative text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </Button>
            
            {/* User Menu */}
            <div className="relative">
              <Button 
                variant="ghost"
                size="icon"
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
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
      
      {/* Search Panel */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 z-50 md:ml-16">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search properties, analytics, tools..." 
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </header>
  );
} 
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, LogOut, LineChart } from 'lucide-react';
import { useApi } from '@/lib/ApiContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, logout } = useApi();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleLoginClick = () => {
    if (isAuthenticated) {
      logout();
    } else {
      router.push('/dashboard');
    }
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 relative">
      {/* Login/Logout Button */}
      {mounted && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 px-4 py-2 transition-all hover:scale-105 hover:text-primary focus:text-primary active:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/10"
                >
                  <LineChart className="h-5 w-5" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-4 py-2 transition-all hover:scale-105 hover:text-primary focus:text-primary active:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/10"
                onClick={handleLoginClick}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 px-4 py-2 transition-all hover:scale-105 hover:text-primary focus:text-primary active:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/10"
              onClick={handleLoginClick}
            >
              <User className="h-5 w-5" />
              <span>Login</span>
            </Button>
          )}
        </div>
      )}
      
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Project Atlas
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-300">
          Fractional Real Estate Investment Powered by Blockchain and AI
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Fractional Ownership</h2>
            <p className="mb-4">Invest in premium real estate properties with as little as you want. Own a piece of high-value assets without the traditional barriers to entry.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">AI-Powered Analysis</h2>
            <p className="mb-4">Our proprietary Atlas AI evaluates properties on multiple factors, providing a comprehensive score to help you make informed investment decisions.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Blockchain Security</h2>
            <p className="mb-4">Your property ownership is secured as an NFT on the blockchain, providing transparent, immutable proof of your investment.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">Passive Income</h2>
            <p className="mb-4">Earn monthly rental income proportional to your ownership stake, with all property management handled by our expert team.</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link href="/landing">
            <Button 
              variant="outline" 
              className="px-10 py-6 text-lg transition-all hover:scale-105 hover:text-primary focus:text-primary active:text-primary hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/10 hover:border-primary focus:border-primary active:border-primary touch-manipulation"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

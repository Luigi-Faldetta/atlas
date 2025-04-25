// NO 'use client' directive here!

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClerkProviderWrapper from './clerk-provider-wrapper'; // Import your wrapper
import { MainNav } from '@/components/layout/MainNav'; // Import MainNav

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Atlas',
  description: 'Real Estate Investment Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProviderWrapper>
      <html lang="en">
        <body className={inter.className}>
          <MainNav /> {/* Render the MainNav component */}
          {/* Add padding-left on medium screens and up to account for the fixed sidebar */}
          <main className="md:pl-16">
            {' '}
            {/* pl-16 corresponds to width: 4rem */}
            {children}
          </main>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}

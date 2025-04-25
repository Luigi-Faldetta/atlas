// filepath: /home/luigif/Documents/Atlas/atlas/frontend/app/layout.tsx
// NO 'use client' directive here!

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClerkProviderWrapper from './clerk-provider-wrapper'; // Import your wrapper

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
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProviderWrapper>
  );
}

// NO 'use client' directive here!

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClerkProviderWrapper from './clerk-provider-wrapper'; // Import your wrapper
import { MainNav } from '@/components/layout/MainNav'; // Import MainNav
import { SecurityErrorBoundary } from '@/components/security/SecureComponent';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Atlas',
  description: 'Real Estate Investment Platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

// Initialize security measures on the server
async function initializeSecurity() {
  // Initialize taint API for sensitive data protection
  try {
    const { taintSensitiveData } = await import('@/lib/security/taint');
    taintSensitiveData();
  } catch (error) {
    // Taint API might not be available in all environments
    console.warn('Taint API not available:', error);
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize security measures
  await initializeSecurity();

  return (
    <ClerkProviderWrapper>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
        </head>
        <body className={inter.className}>
          <SecurityErrorBoundary>
            <MainNav /> {/* Render the MainNav component */}
            {/* Add padding-left on medium screens and up to account for the fixed sidebar */}
            <main className="md:pl-16">
              {' '}
              {/* pl-16 corresponds to width: 4rem */}
              {children}
            </main>
          </SecurityErrorBoundary>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}

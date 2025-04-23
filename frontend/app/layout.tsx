import './globals.css';
import { Providers } from './providers';
import { MainNav } from '@/components/layout/MainNav'; // Import MainNav directly
import { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs'; // Import ClerkProvider

export const metadata: Metadata = {
  title: 'Atlas',
  description:
    'Start owning real estate — without breaking the bank. Fractionalized property investment, the smarter way to invest in property with lower barriers and higher flexibility.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wrap the entire html content with ClerkProvider
    <ClerkProvider>
      <html lang="en" className="overflow-x-hidden">
        <body className="bg-white dark:bg-slate-950 overflow-x-hidden">
          <Providers>
            {' '}
            {/* Keep your existing Providers inside ClerkProvider */}
            <MainNav />
            <div className="md:pl-16">{children}</div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}

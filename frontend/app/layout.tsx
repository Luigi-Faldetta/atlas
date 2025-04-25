import './globals.css';
import { Providers } from './providers';
import { MainNav } from '@/components/layout/MainNav'; // Import MainNav directly
import { Metadata } from 'next';
// import { ClerkProvider } from '@clerk/nextjs'; // Import ClerkProvider - Replaced by wrapper
import ClerkProviderWrapper from './clerk-provider-wrapper'; // Import the wrapper

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
    <html lang="en" className="overflow-x-hidden">
      {/* Wrap only the body content with the client component wrapper */}
      <ClerkProviderWrapper>
        <body className="bg-white dark:bg-slate-950 overflow-x-hidden">
          <Providers>
            <MainNav />
            <div className="md:pl-16">{children}</div>
          </Providers>
        </body>
      </ClerkProviderWrapper>
    </html>
  );
}

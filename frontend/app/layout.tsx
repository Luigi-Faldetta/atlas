import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Metadata } from 'next';

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
      <body className="bg-white dark:bg-slate-950 overflow-x-hidden">
        <Providers>
          <Header />
          <div className="md:pl-16">{children}</div>
        </Providers>
      </body>
    </html>
  );
}

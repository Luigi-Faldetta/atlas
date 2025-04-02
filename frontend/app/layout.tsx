import './globals.css';
import { Providers } from './providers';
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: 'Project Atlas - Fractional Real Estate Investment',
  description: 'Invest in tokenized real estate with the trust of traditional wealth.',
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
          <div className="md:pl-16">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
} 
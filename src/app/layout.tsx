import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextUIProvider } from '@nextui-org/react';
import Title from '@/components/common/Title';
import Navigation from '@/components/common/Navigation';

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Carbonable Kalculator',
  description: 'Estimate and plan project investments',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`dark ${inter.className} min-h-screen bg-neutral-800 text-neutral-100`}>
        <div className="2xl:max-w-8xl mx-auto min-h-screen max-w-full p-8 lg:max-w-6xl xl:max-w-7xl">
          <NextUIProvider>
            <div className="text-center">
              <Title />
              <div className="mt-12">
                <Navigation />
              </div>
            </div>
            <div>{children}</div>
          </NextUIProvider>
        </div>
      </body>
    </html>
  );
}

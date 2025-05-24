import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Presentation Portfolio - YOSHIDA George',
  description: 'Portfolio website for managing and displaying presentation slides by YOSHIDA George (吉田丈治), Director & CIO at Leave a Nest Co., Ltd.',
  keywords: ['presentations', 'slides', 'portfolio', 'YOSHIDA George', '吉田丈治', 'Leave a Nest', 'リバネス'],
  authors: [{ name: 'YOSHIDA George' }],
  creator: 'YOSHIDA George',
  openGraph: {
    title: 'Presentation Portfolio - YOSHIDA George',
    description: 'Portfolio website for managing and displaying presentation slides',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Presentation Portfolio - YOSHIDA George',
    description: 'Portfolio website for managing and displaying presentation slides',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
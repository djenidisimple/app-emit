import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { NotificationProvider } from '@/components/NotificationProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--ff-sans',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
  variable: '--ff-heading',
});

export const metadata: Metadata = {
  title: 'G-Salles EMIT',
  description: 'Système de gestion du planning et des salles — EMIT, Université de Fianarantsoa',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${barlowCondensed.variable}`}>
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}

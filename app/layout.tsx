import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import 'antd/dist/reset.css';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'COEX Shipping - Global Freight, Quote & Tracking Platform',
    template: '%s | COEX Shipping',
  },
  description:
    'A premium Ant Design shipping platform for COEX global freight, quote calculation, courier booking, documents, and milestone tracking.',
  openGraph: {
    title: 'COEX Shipping - Global Freight, Quote & Tracking Platform',
    description:
      'Reliable ocean, air and inland logistics with quote, booking, documents, and shipment visibility in one polished shipping experience.',
    images: ['/hero-logistics.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COEX Shipping - Global Freight, Quote & Tracking Platform',
    description:
      'A premium shipping platform for global freight, baggage, booking, and tracking.',
    images: ['/hero-logistics.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

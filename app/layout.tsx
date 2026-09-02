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
    default: 'COEX Shipping - USA Parcel Quote & Tracking Platform',
    template: '%s | COEX Shipping',
  },
  description:
    'A premium Ant Design shipping platform for USA-only parcel, luggage, quote calculation, UPS and FedEx tracking handoff, booking, documents, and milestone visibility.',
  openGraph: {
    title: 'COEX Shipping - USA Parcel Quote & Tracking Platform',
    description:
      'Domestic USA shipping with state-by-state estimates, UPS and FedEx carrier handoff, booking, documents, and shipment visibility in one polished experience.',
    images: ['/hero-logistics.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COEX Shipping - USA Parcel Quote & Tracking Platform',
    description:
      'A premium USA shipping platform for luggage, parcels, carrier estimates, booking, and tracking.',
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

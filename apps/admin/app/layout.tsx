import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuickKart Admin',
  description: 'QuickKart Admin Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

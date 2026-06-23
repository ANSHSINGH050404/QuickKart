import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuickKart - 10 Minute Grocery Delivery',
  description: 'Get groceries delivered to your doorstep in 10 minutes.',
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

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZonaVIP - Dashboard',
  description: 'ZonaVIP Platform - B2B2C Benefit Plans Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

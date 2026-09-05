import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mota Intranet',
  description: 'Portal interno Mota & Advogados Associados'
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-app-gradient">{children}</body>
    </html>
  );
}

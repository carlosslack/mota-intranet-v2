import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOTA & Advogados — Intranet",
  description: "Intranet corporativa MOTA & Advogados",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-navy-900 text-gold-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

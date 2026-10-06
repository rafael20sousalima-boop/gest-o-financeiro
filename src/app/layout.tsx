import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gestão Financeira",
  description: "Sistema de gestão financeira para comércio",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let config = null;
  try {
    config = await prisma.configuracao.findUnique({ where: { id: 1 } });
  } catch (error) {
    // Database not configured yet
  }

  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AppShell empresa={config?.nomeEmpresa || "Gestão Financeira"}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

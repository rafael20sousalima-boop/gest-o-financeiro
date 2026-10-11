import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { prisma } from "@/lib/prisma";
import { Providers } from "@/components/Providers";
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
    icon: '/favicon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let config = null;
  try {
    // Adicionar timeout para evitar travamentos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database timeout")), 3000)
    );
    
    config = await Promise.race([
      prisma.configuracao.findUnique({ where: { id: 1 } }),
      timeoutPromise
    ]) as any;
  } catch (error) {
    // Database not configured yet or timeout
    console.error("Error fetching config:", error);
  }

  const empresa = config?.nomeEmpresa || "Gestão Financeira";

  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <Providers>
          <AppShell empresa={empresa}>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}

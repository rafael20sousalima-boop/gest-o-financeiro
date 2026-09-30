import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { ensureConfig } from "@/actions";
import { prisma } from "@/lib/prisma";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureConfig();
  const config = await prisma.configuracao.findUnique({ where: { id: 1 } });

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

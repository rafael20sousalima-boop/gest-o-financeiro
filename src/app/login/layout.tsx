import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { SessionProvider } from "next-auth/react";

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
  title: "Login - Gestão Financeira",
  description: "Faça login para acessar o sistema de gestão financeira",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Verificar se existe admin no banco
    const adminExists = await prisma.user.findFirst({
      where: { role: "admin" }
    });

    // Se não existe admin e não está na página de setup, redirecionar para setup
    if (!adminExists && path !== "/setup" && path !== "/api/setup-admin") {
      return NextResponse.redirect(new URL("/setup", req.url));
    }

    // Se existe admin e está na página de setup, redirecionar para login
    if (adminExists && path === "/setup") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Proteger rotas de admin
    if (path.startsWith("/usuarios") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Permitir acesso sem autenticação para setup e login
        if (path === "/setup" || path === "/login") {
          return true;
        }
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    "/",
    "/setup",
    "/login",
    "/clientes/:path*",
    "/fornecedores/:path*",
    "/estoque",
    "/vendas",
    "/contas-a-pagar",
    "/contas-a-receber",
    "/fluxo-de-caixa",
    "/configuracoes",
    "/usuarios/:path*"
  ]
};

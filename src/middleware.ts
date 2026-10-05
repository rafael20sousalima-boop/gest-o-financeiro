import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

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

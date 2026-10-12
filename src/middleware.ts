import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: any) {
  const { pathname } = request.nextUrl;

  // Não verificar autenticação para páginas públicas
  if (pathname === "/login" || pathname === "/setup" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Validar o token JWT da sessão
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || "dev-secret-key-change-in-production",
    });

    // Se não tiver token válido, redirecionar para login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    // Em caso de erro na validação, redirecionar para login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|_next/webpack-hmr).*)"]
};

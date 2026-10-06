import { NextResponse } from "next/server";

export function middleware(request: any) {
  const { pathname } = request.nextUrl;

  // Não verificar autenticação para páginas públicas
  if (pathname === "/login" || pathname === "/setup" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Verificar se tem cookie de sessão
  const sessionCookie = request.cookies.get("next-auth.session-token") ||
                       request.cookies.get("__Secure-next-auth.session-token");

  // Se não tiver sessão, redirecionar para login
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};

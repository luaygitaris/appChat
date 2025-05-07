// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Ganti dengan secret JWT kamu jika berbeda
const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });

  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  // Jika sudah login, dan user mencoba akses halaman login ("/")
  if (pathname === "/" && isAuth) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // Jika belum login, dan user mencoba akses halaman "/chat"
  if (pathname.startsWith("/chat") && !isAuth) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat/:path*"],
};

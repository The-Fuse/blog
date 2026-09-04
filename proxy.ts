import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const ok = token ? await verifySessionToken(token) : false;

  if (pathname === "/admin/login") {
    if (ok) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/articles") || pathname.startsWith("/api/upload") || pathname.startsWith("/api/site")) {
    if (ok) return NextResponse.next();
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/articles/:path*", "/api/articles", "/api/upload", "/api/site"],
};

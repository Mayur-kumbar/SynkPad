import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/workspace");

  // Not logged in → block protected routes only
  if (!accessToken && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/workspace/:path*",
  ],
};

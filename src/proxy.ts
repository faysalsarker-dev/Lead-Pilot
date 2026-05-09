import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/register";
  const isAuthApi = request.nextUrl.pathname.startsWith("/api/auth");
  const isDevDebugApi =
    process.env.NODE_ENV === "development" &&
    request.nextUrl.pathname.startsWith("/api/debug");

  if (!token) {
    if (isAuthPage || isAuthApi || isDevDebugApi) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
 
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

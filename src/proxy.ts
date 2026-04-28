import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // const token = await getToken({
  //   req: request,
  //   secret: process.env.NEXTAUTH_SECRET,
  // });

  // // If there's no token and the user is trying to access a protected route
  // if (!token) {
  //   // Allow access to public routes
  //   if (
  //     request.nextUrl.pathname === "/login" ||
  //     request.nextUrl.pathname.startsWith("/api/auth")
  //   ) {
  //     return NextResponse.next();
  //   }

  //   // Redirect to login for protected routes
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // // If user is authenticated and tries to access login page, redirect to home
  // if (token && request.nextUrl.pathname === "/login") {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
 
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

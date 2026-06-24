import { NextRequest, NextResponse } from "next/server";

import { auth } from "./lib/auth";

const protectedRoutes = ["/main"];
const authRoutes = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;


const user = await auth()


  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 🚫 not logged in → block protected
  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🚫 logged in → block auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/main", req.url));
  }

  return NextResponse.next();
}

// IMPORTANT: tells Next which routes trigger proxy
export const config = {
  matcher: ["/main/:path*", "/login", "/register"],
};

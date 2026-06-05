import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PAGES = new Set(["/login", "/register"]);
const PUBLIC_API_PREFIX = "/api/auth";
const DEV_DEBUG_API_PREFIX = "/api/debug";

function isPublicPage(pathname: string) {
  return PUBLIC_PAGES.has(pathname);
}

function isPublicApi(pathname: string) {
  return pathname === PUBLIC_API_PREFIX || pathname.startsWith(`${PUBLIC_API_PREFIX}/`);
}

function isDevDebugApi(pathname: string) {
  return process.env.NODE_ENV === "development" && pathname.startsWith(DEV_DEBUG_API_PREFIX);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });


  console.log("Proxy Middleware - Path:", pathname, "Token:", token ? "Present" : "Not Present");
  const isLoggedIn = Boolean(token);

  if (!isLoggedIn) {
    if (isPublicPage(pathname) || isPublicApi(pathname) || isDevDebugApi(pathname)) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPage(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the next-auth session cookie
    response.cookies.set("next-auth.session-token", "", {
      maxAge: 0,
      path: "/",
    });

    // Also clear other auth-related cookies
    response.cookies.set("next-auth.csrf-token", "", {
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

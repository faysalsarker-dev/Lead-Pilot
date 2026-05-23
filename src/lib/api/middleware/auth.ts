import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

type AuthResult =
  | {
      authenticated: true;
      userId: string;
      email?: string | null;
    }
  | {
      authenticated: false;
      error: string;
      statusCode: number;
    };

export async function requireAuth(_request?: NextRequest): Promise<AuthResult> {
  void _request;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      authenticated: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  return {
    authenticated: true,
    userId: session.user.id,
    email: session.user.email,
  };
}

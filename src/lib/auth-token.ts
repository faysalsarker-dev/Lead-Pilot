import { decode, type JWT } from "next-auth/jwt";

export const authTokenCookieNames = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

export async function decodeAuthToken(token?: string | null): Promise<JWT | null> {
  if (!token) {
    return null;
  }

  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

  if (!secret) {
    return null;
  }

  try {
    return await decode({ token, secret });
  } catch {
    return null;
  }
}

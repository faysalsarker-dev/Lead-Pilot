import { cookies } from "next/headers";

import { authTokenCookieNames, decodeAuthToken } from "@/lib/auth-token";

export default async function getUser() {
  const cookieStore = await cookies();
  const token = authTokenCookieNames
    .map((cookieName) => cookieStore.get(cookieName)?.value)
    .find(Boolean);

  return decodeAuthToken(token);
}



export type UserSessionData = {
  name: string;
  email: string;
  picture: string | null;
  sub: string;
  id: string;
  service: string;
  iat: number;
  exp: number;
  jti: string;
};
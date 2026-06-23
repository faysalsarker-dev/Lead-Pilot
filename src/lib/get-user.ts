import { cookies } from "next/headers";

import { authTokenCookieNames, decodeAuthToken } from "@/lib/auth-token";

export default async function getUser() {
  const cookieStore = await cookies();
  const token = authTokenCookieNames
    .map((cookieName) => cookieStore.get(cookieName)?.value)
    .find(Boolean);

  return decodeAuthToken(token);
}

import { NextResponse } from "next/server";

import type { UserModel as User } from "@/app/generated/prisma/models";
import { getUserByCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<
      Pick<User, "email" | "password">
    >;

    const user = await getUserByCredentials(body);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Unable to login" },
      { status: 500 },
    );
  }
}

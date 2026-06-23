import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import type { UserModel as User } from "@/app/generated/prisma/models";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  service: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  status: true,
  currentStreak: true,
  longestStreak: true,
  lastLoggedInAt: true,
  autoEnrich: true,
  defaultSendWindow: true,
  webPushEnabled: true,
  webPushSubscription: true,
} satisfies Record<keyof Omit<User, "password">, true>;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: publicUserSelect,
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

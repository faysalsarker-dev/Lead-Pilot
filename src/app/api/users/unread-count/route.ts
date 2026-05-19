import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [unreadNotifications, unreadReplies] = await Promise.all([
    prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    }),
    prisma.reply.count({
      where: {
        isRead: false,
        lead: {
          userId: user.id,
        },
      },
    }),
  ]);

  return NextResponse.json({
    data: {
      unreadNotifications,
      unreadReplies,
    },
  });
}

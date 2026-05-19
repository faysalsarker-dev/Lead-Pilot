import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const settingsSchema = z.object({
  autoEnrich: z.boolean().optional(),
  defaultSendWindow: z.string().trim().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/).optional(),
  webPushEnabled: z.boolean().optional(),
});

async function getCurrentUserEmail() {
  const session = await getServerSession(authOptions);
  return session?.user?.email;
}

export async function GET() {
  const email = await getCurrentUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      autoEnrich: true,
      defaultSendWindow: true,
      webPushEnabled: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: user });
}

export async function PUT(request: NextRequest) {
  const email = await getCurrentUserEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data = settingsSchema.parse(body);

  const user = await prisma.user.update({
    where: { email },
    data,
    select: {
      autoEnrich: true,
      defaultSendWindow: true,
      webPushEnabled: true,
    },
  });

  return NextResponse.json({ data: user });
}

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { testMailboxConnection } from "@/lib/mailer";
import prisma from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const mailbox = await prisma.mailbox.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!mailbox) {
    return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });
  }

  await prisma.mailbox.update({
    where: { id },
    data: { connectionStatus: "TESTING" },
  });

  try {
    await testMailboxConnection(mailbox);

    const updated = await prisma.mailbox.update({
      where: { id },
      data: {
        connectionStatus: "CONNECTED",
        lastTestedAt: new Date(),
        lastError: null,
      },
      select: {
        id: true,
        connectionStatus: true,
        lastTestedAt: true,
        lastError: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Connection test failed";
    const updated = await prisma.mailbox.update({
      where: { id },
      data: {
        connectionStatus: "FAILED",
        lastTestedAt: new Date(),
        lastError: message,
      },
      select: {
        id: true,
        connectionStatus: true,
        lastTestedAt: true,
        lastError: true,
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: message,
        data: updated,
      },
      { status: 422 },
    );
  }
}

import { NextResponse } from "next/server";

import { Prisma } from "@/app/generated/prisma/client";
import { auth, publicUserSelect } from "@/lib/auth";
import prisma from "@/lib/prisma";

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeUserUpdateData(
  body: Partial<Prisma.UserUncheckedUpdateInput>,
) {
  const data: Partial<Prisma.UserUncheckedUpdateInput> = {};

  if ("name" in body) data.name = optionalString(body.name) ?? "";
  if ("image" in body) data.image = optionalString(body.image);
  if ("service" in body) data.service = optionalString(body.service);
  if ("autoEnrich" in body) data.autoEnrich = Boolean(body.autoEnrich);
  if ("defaultSendWindow" in body) {
    data.defaultSendWindow = optionalString(body.defaultSendWindow) ?? "09:00-11:00";
  }
  if ("webPushEnabled" in body) data.webPushEnabled = Boolean(body.webPushEnabled);
  if ("webPushSubscription" in body) {
    data.webPushSubscription = body.webPushSubscription ?? Prisma.JsonNull;
  }

  return data;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: { id: session.user.id },
    select: publicUserSelect,
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ data: user });
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body =
      (await request.json()) as Partial<Prisma.UserUncheckedUpdateInput>;
    const data = normalizeUserUpdateData(body);

    if ("name" in data && !data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: publicUserSelect,
    });

    return NextResponse.json({ data: user });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to update user",
        message: "Unable to update user",
      },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { isActive: false },
    select: { id: true },
  });

  return NextResponse.json({ success: true });
}

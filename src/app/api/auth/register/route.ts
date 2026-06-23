import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import type { UserModel as User } from "@/app/generated/prisma/models";
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<
      Pick<User, "name" | "email" | "password" | "service">
    >;

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const service = body.service?.trim() || null;

    console.log("Registering user:", { name, email, service });

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        service,
      },
      select: publicUserSelect,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 },
    );
  }
}

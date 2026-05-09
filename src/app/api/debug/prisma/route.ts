import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { Prisma } from "@/app/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const databaseUrl = process.env.DATABASE_URL;

  try {
    const userCount = await prisma.user.count();

    return NextResponse.json({
      ok: true,
      runtime,
      userCount,
      databaseUrlPresent: Boolean(databaseUrl),
      databaseUrlHost: databaseUrl ? new URL(databaseUrl).host : null,
    });
  } catch (error) {
    console.error("Prisma debug query failed:", error);
    const prismaError = error as Prisma.PrismaClientKnownRequestError & {
      cause?: unknown;
      code?: string;
      meta?: unknown;
    };

    return NextResponse.json(
      {
        ok: false,
        runtime,
        databaseUrlPresent: Boolean(databaseUrl),
        databaseUrlHost: databaseUrl ? new URL(databaseUrl).host : null,
        code: prismaError.code,
        meta: prismaError.meta,
        cause: prismaError.cause,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

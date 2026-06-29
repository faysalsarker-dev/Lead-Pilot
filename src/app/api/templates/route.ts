import { NextResponse } from "next/server";

import { Prisma } from "@/app/generated/prisma/client";
import type { TemplateModel as Template } from "@/app/generated/prisma/models";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const templateSelect = {
  id: true,
  userId: true,
  name: true,
  type: true,
  subjectA: true,
  subjectB: true,
  body: true,
  usedVariables: true,
  createdAt: true,
  updatedAt: true,
} satisfies Record<keyof Template, true>;

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function extractUsedVariables(value: string) {
  return Array.from(value.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g))
    .map((match) => match[1])
    .filter((variable, index, variables) => variables.indexOf(variable) === index);
}

function normalizeTemplateCreateData(
  body: Partial<Prisma.TemplateUncheckedCreateInput>,
) {
  const data: Partial<Prisma.TemplateUncheckedCreateInput> = {};

  data.name = optionalString(body.name) ?? "";
  data.type = body.type;
  data.subjectA = optionalString(body.subjectA) ?? "";
  data.subjectB = optionalString(body.subjectB);
  data.body = optionalString(body.body) ?? "";
  data.usedVariables = extractUsedVariables(data.body);

  return data;
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = toPositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(toPositiveInt(searchParams.get("limit"), 10), 100);
  const skip = (page - 1) * limit;
  const search = searchParams.get("search")?.trim();
  const type = searchParams.get("type")?.trim();

  const where: Prisma.TemplateWhereInput = {
    userId: session.user.id,
    ...(type ? { type: type as Template["type"] } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { subjectA: { contains: search, mode: "insensitive" } },
            { subjectB: { contains: search, mode: "insensitive" } },
            { body: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.template.findMany({
      where,
      select: templateSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.template.count({ where }),
  ]);

  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body =
      (await request.json()) as Partial<Prisma.TemplateUncheckedCreateInput>;
    const data = normalizeTemplateCreateData(body);

    if (!data.name || !data.type || !data.subjectA || !data.body) {
      return NextResponse.json(
        { error: "Name, type, subject A, and body are required" },
        { status: 400 },
      );
    }

    const template = await prisma.template.create({
      data: {
        ...data,
        userId: session.user.id,
      } as Prisma.TemplateUncheckedCreateInput,
      select: templateSelect,
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to create template",
        message: "Unable to create template",
      },
      { status: 500 },
    );
  }
}

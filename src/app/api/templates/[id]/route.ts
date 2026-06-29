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

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function extractUsedVariables(value: string) {
  return Array.from(value.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g))
    .map((match) => match[1])
    .filter((variable, index, variables) => variables.indexOf(variable) === index);
}

function normalizeTemplateUpdateData(
  body: Partial<Prisma.TemplateUncheckedUpdateInput>,
) {
  const data: Partial<Prisma.TemplateUncheckedUpdateInput> = {};

  if ("name" in body) data.name = optionalString(body.name) ?? "";
  if ("type" in body) data.type = body.type;
  if ("subjectA" in body) data.subjectA = optionalString(body.subjectA) ?? "";
  if ("subjectB" in body) data.subjectB = optionalString(body.subjectB);
  if ("body" in body) {
    const bodyValue = optionalString(body.body) ?? "";
    data.body = bodyValue;
    data.usedVariables = extractUsedVariables(bodyValue);
  }

  return data;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const template = await prisma.template.findFirst({
    where: { id, userId: session.user.id },
    select: templateSelect,
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({ data: template });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existingTemplate = await prisma.template.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    const body =
      (await request.json()) as Partial<Prisma.TemplateUncheckedUpdateInput>;
    const data = normalizeTemplateUpdateData(body);

    if ("name" in data && !data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if ("subjectA" in data && !data.subjectA) {
      return NextResponse.json(
        { error: "Subject A is required" },
        { status: 400 },
      );
    }

    if ("body" in data && !data.body) {
      return NextResponse.json({ error: "Body is required" }, { status: 400 });
    }

    const template = await prisma.template.update({
      where: { id },
      data,
      select: templateSelect,
    });

    return NextResponse.json({ data: template });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to update template",
        message: "Unable to update template",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await prisma.template.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (!deleted.count) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";

import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const campaignSelect = {
  id: true,
  userId: true,
  name: true,
  status: true,
  category: true,
  country: true,
  city: true,
  mailboxId: true,
  initialTemplateId: true,
  followup1TemplateId: true,
  followup2TemplateId: true,
  finalTemplateId: true,
  followup1Days: true,
  followup2Days: true,
  finalDays: true,
  sendWindow: true,
  totalSent: true,
  totalBounced: true,
  autoPaused: true,
  launchedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  mailbox: {
    select: {
      id: true,
      label: true,
      type: true,
      fromEmail: true,
    },
  },
  initialTemplate: {
    select: {
      id: true,
      name: true,
      type: true,
      subjectA: true,
    },
  },
  followup1Template: {
    select: {
      id: true,
      name: true,
      type: true,
      subjectA: true,
    },
  },
  followup2Template: {
    select: {
      id: true,
      name: true,
      type: true,
      subjectA: true,
    },
  },
  finalTemplate: {
    select: {
      id: true,
      name: true,
      type: true,
      subjectA: true,
    },
  },
  _count: {
    select: {
      campaignLeads: true,
      emailQueue: true,
    },
  },
} satisfies Prisma.CampaignSelect;

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

function optionalNumber(value: unknown, fallback: number) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function validateCampaignReferences(
  data: Partial<Prisma.CampaignUncheckedCreateInput>,
  userId: string,
) {
  if (data.mailboxId) {
    const mailbox = await prisma.mailbox.findFirst({
      where: { id: data.mailboxId, userId },
      select: { id: true },
    });

    if (!mailbox) return "Mailbox not found";
  }

  const templateIds = [
    data.initialTemplateId,
    data.followup1TemplateId,
    data.followup2TemplateId,
    data.finalTemplateId,
  ].filter((id): id is string => Boolean(id));

  if (!templateIds.length) return null;

  const templatesCount = await prisma.template.count({
    where: {
      userId,
      id: { in: templateIds },
    },
  });

  return templatesCount === templateIds.length ? null : "Template not found";
}

function normalizeCampaignCreateData(
  body: Partial<Prisma.CampaignUncheckedCreateInput>,
) {
  const data: Partial<Prisma.CampaignUncheckedCreateInput> = {};

  data.name = optionalString(body.name) ?? "";
  data.category = optionalString(body.category);
  data.country = optionalString(body.country);
  data.city = optionalString(body.city);
  data.mailboxId = optionalString(body.mailboxId) ?? "";
  data.initialTemplateId = optionalString(body.initialTemplateId) ?? "";
  data.followup1TemplateId = optionalString(body.followup1TemplateId);
  data.followup2TemplateId = optionalString(body.followup2TemplateId);
  data.finalTemplateId = optionalString(body.finalTemplateId);
  data.followup1Days = optionalNumber(body.followup1Days, 3);
  data.followup2Days = optionalNumber(body.followup2Days, 5);
  data.finalDays = optionalNumber(body.finalDays, 7);
  data.sendWindow = optionalString(body.sendWindow) ?? "09:00-11:00";

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
  const status = searchParams.get("status")?.trim();

  const where: Prisma.CampaignWhereInput = {
    userId: session.user.id,
    ...(status ? { status: status as Prisma.CampaignWhereInput["status"] } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
            { country: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      select: campaignSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.campaign.count({ where }),
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
      (await request.json()) as Partial<Prisma.CampaignUncheckedCreateInput>;
    const data = normalizeCampaignCreateData(body);

    if (!data.name || !data.mailboxId || !data.initialTemplateId) {
      return NextResponse.json(
        { error: "Name, mailbox, and initial template are required" },
        { status: 400 },
      );
    }

    const referenceError = await validateCampaignReferences(data, session.user.id);

    if (referenceError) {
      return NextResponse.json({ error: referenceError }, { status: 404 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        userId: session.user.id,
      } as Prisma.CampaignUncheckedCreateInput,
      select: campaignSelect,
    });

    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to create campaign",
        message: "Unable to create campaign",
      },
      { status: 500 },
    );
  }
}

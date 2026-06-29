import { NextResponse } from "next/server";

import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { campaignSelect } from "../route";

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalNumber(value: unknown) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function validateCampaignReferences(
  data: Partial<Prisma.CampaignUncheckedUpdateInput>,
  userId: string,
) {
  if (typeof data.mailboxId === "string") {
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
  ].filter((id): id is string => typeof id === "string" && Boolean(id));

  if (!templateIds.length) return null;

  const templatesCount = await prisma.template.count({
    where: {
      userId,
      id: { in: templateIds },
    },
  });

  return templatesCount === templateIds.length ? null : "Template not found";
}

function normalizeCampaignUpdateData(
  body: Partial<Prisma.CampaignUncheckedUpdateInput>,
) {
  const data: Partial<Prisma.CampaignUncheckedUpdateInput> = {};

  if ("name" in body) data.name = optionalString(body.name) ?? "";
  if ("status" in body) data.status = body.status;
  if ("category" in body) data.category = optionalString(body.category);
  if ("country" in body) data.country = optionalString(body.country);
  if ("city" in body) data.city = optionalString(body.city);
  if ("mailboxId" in body) data.mailboxId = optionalString(body.mailboxId) ?? "";
  if ("initialTemplateId" in body) {
    data.initialTemplateId = optionalString(body.initialTemplateId) ?? "";
  }
  if ("followup1TemplateId" in body) {
    data.followup1TemplateId = optionalString(body.followup1TemplateId);
  }
  if ("followup2TemplateId" in body) {
    data.followup2TemplateId = optionalString(body.followup2TemplateId);
  }
  if ("finalTemplateId" in body) {
    data.finalTemplateId = optionalString(body.finalTemplateId);
  }
  if ("followup1Days" in body) data.followup1Days = optionalNumber(body.followup1Days) ?? 3;
  if ("followup2Days" in body) data.followup2Days = optionalNumber(body.followup2Days) ?? 5;
  if ("finalDays" in body) data.finalDays = optionalNumber(body.finalDays) ?? 7;
  if ("sendWindow" in body) data.sendWindow = optionalString(body.sendWindow) ?? "09:00-11:00";

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
  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id },
    select: campaignSelect,
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ data: campaign });
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
    const existingCampaign = await prisma.campaign.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, launchedAt: true },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 },
      );
    }

    const body =
      (await request.json()) as Partial<Prisma.CampaignUncheckedUpdateInput>;
    const data = normalizeCampaignUpdateData(body);

    if ("name" in data && !data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if ("mailboxId" in data && !data.mailboxId) {
      return NextResponse.json({ error: "Mailbox is required" }, { status: 400 });
    }

    if ("initialTemplateId" in data && !data.initialTemplateId) {
      return NextResponse.json(
        { error: "Initial template is required" },
        { status: 400 },
      );
    }

    const referenceError = await validateCampaignReferences(data, session.user.id);

    if (referenceError) {
      return NextResponse.json({ error: referenceError }, { status: 404 });
    }

    if (data.status === "RUNNING" && !existingCampaign.launchedAt) {
      data.launchedAt = new Date();
    }

    if (data.status === "COMPLETED") {
      data.completedAt = new Date();
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data,
      select: campaignSelect,
    });

    return NextResponse.json({ data: campaign });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to update campaign",
        message: "Unable to update campaign",
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
  const deleted = await prisma.campaign.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (!deleted.count) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

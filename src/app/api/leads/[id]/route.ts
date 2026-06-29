import { NextResponse } from "next/server";

import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { leadSelect } from "../route";

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeLeadUpdateData(body: Partial<Prisma.LeadUncheckedUpdateInput>) {
  const data: Partial<Prisma.LeadUncheckedUpdateInput> = {};

  if ("name" in body) data.name = optionalString(body.name) ?? "";
  if ("businessName" in body) data.businessName = optionalString(body.businessName) ?? "";
  if ("businessType" in body) data.businessType = optionalString(body.businessType);
  if ("jobTitle" in body) data.jobTitle = optionalString(body.jobTitle);
  if ("avatarUrl" in body) data.avatarUrl = optionalString(body.avatarUrl);
  if ("email" in body) data.email = optionalString(body.email);
  if ("emailVerified" in body) data.emailVerified = Boolean(body.emailVerified);
  if ("phone" in body) data.phone = optionalString(body.phone);
  if ("whatsapp" in body) data.whatsapp = optionalString(body.whatsapp);
  if ("whatsappOptedIn" in body) data.whatsappOptedIn = Boolean(body.whatsappOptedIn);
  if ("facebookUrl" in body) data.facebookUrl = optionalString(body.facebookUrl);
  if ("instagramHandle" in body) data.instagramHandle = optionalString(body.instagramHandle);
  if ("linkedinUrl" in body) data.linkedinUrl = optionalString(body.linkedinUrl);
  if ("twitterHandle" in body) data.twitterHandle = optionalString(body.twitterHandle);
  if ("youtubeUrl" in body) data.youtubeUrl = optionalString(body.youtubeUrl);
  if ("tiktokHandle" in body) data.tiktokHandle = optionalString(body.tiktokHandle);
  if ("website" in body) data.website = optionalString(body.website);
  if ("googleMapsUrl" in body) data.googleMapsUrl = optionalString(body.googleMapsUrl);
  if ("googleMapsPlaceId" in body) data.googleMapsPlaceId = optionalString(body.googleMapsPlaceId);
  if ("country" in body) data.country = optionalString(body.country);
  if ("city" in body) data.city = optionalString(body.city);
  if ("area" in body) data.area = optionalString(body.area);
  if ("timezone" in body) data.timezone = optionalString(body.timezone);
  if ("quickNote" in body) data.quickNote = optionalString(body.quickNote);
  if ("capturedFrom" in body) data.capturedFrom = optionalString(body.capturedFrom);
  if ("capturedAt" in body) data.capturedAt = body.capturedAt as Date | undefined;
  if ("observedProblems" in body) data.observedProblems = normalizeStringArray(body.observedProblems);
  if ("workType" in body) data.workType = body.workType;
  if ("budgetRange" in body) data.budgetRange = body.budgetRange;
  if ("urgency" in body) data.urgency = body.urgency;
  if ("source" in body) data.source = body.source;
  if ("tags" in body) data.tags = normalizeStringArray(body.tags);
  if ("status" in body) {
    data.status = body.status;
    data.statusUpdatedAt = new Date();
  }
  if ("isActive" in body) data.isActive = Boolean(body.isActive);
  if ("hasReplied" in body) data.hasReplied = Boolean(body.hasReplied);
  if ("isInterested" in body) data.isInterested = Boolean(body.isInterested);
  if ("unsubscribed" in body) data.unsubscribed = Boolean(body.unsubscribed);
  if ("campaignRunning" in body) data.campaignRunning = Boolean(body.campaignRunning);
  if ("lastContactedAt" in body) data.lastContactedAt = body.lastContactedAt as Date | undefined;
  if ("totalEmailsSent" in body) data.totalEmailsSent = Number(body.totalEmailsSent) || 0;
  if ("lastReplyAt" in body) data.lastReplyAt = body.lastReplyAt as Date | undefined;
  if ("priority" in body) data.priority = body.priority;
  if ("isPinned" in body) data.isPinned = Boolean(body.isPinned);
  if ("isFavorite" in body) data.isFavorite = Boolean(body.isFavorite);
  if ("enrichmentStatus" in body) data.enrichmentStatus = body.enrichmentStatus;
  if ("enrichmentError" in body) data.enrichmentError = optionalString(body.enrichmentError);
  if ("aiEnrichedAt" in body) data.aiEnrichedAt = body.aiEnrichedAt as Date | undefined;
  if ("aiScore" in body) data.aiScore = body.aiScore as number | undefined;
  if ("aiSummary" in body) data.aiSummary = optionalString(body.aiSummary);
  if ("aiPainPoints" in body) data.aiPainPoints = normalizeStringArray(body.aiPainPoints);
  if ("aiEmailOpener" in body) data.aiEmailOpener = optionalString(body.aiEmailOpener);
  if ("aiAdCopy" in body) data.aiAdCopy = optionalString(body.aiAdCopy);
  if ("notes" in body) data.notes = optionalString(body.notes);
  if ("internalLabel" in body) data.internalLabel = optionalString(body.internalLabel);
  if ("softDeleted" in body) data.softDeleted = Boolean(body.softDeleted);
  if ("deletedAt" in body) data.deletedAt = body.deletedAt as Date | undefined;

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
  const lead = await prisma.lead.findFirst({
    where: { id, userId: session.user.id, softDeleted: false },
    select: leadSelect,
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ data: lead });
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
    const existingLead = await prisma.lead.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const body = (await request.json()) as Partial<Prisma.LeadUncheckedUpdateInput>;
    const data = normalizeLeadUpdateData(body);

    if ("name" in data && !data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if ("businessName" in data && !data.businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
      select: leadSelect,
    });

    return NextResponse.json({ data: lead });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to update lead",
        message: "Unable to update lead",
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
  const deleted = await prisma.lead.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (!deleted.count) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

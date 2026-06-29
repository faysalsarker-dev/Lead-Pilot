import { NextResponse } from "next/server";

import { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const leadSelect = {
  id: true,
  userId: true,
  name: true,
  businessName: true,
  businessType: true,
  jobTitle: true,
  avatarUrl: true,
  email: true,
  emailVerified: true,
  phone: true,
  whatsapp: true,
  whatsappOptedIn: true,
  facebookUrl: true,
  instagramHandle: true,
  linkedinUrl: true,
  twitterHandle: true,
  youtubeUrl: true,
  tiktokHandle: true,
  website: true,
  googleMapsUrl: true,
  googleMapsPlaceId: true,
  country: true,
  city: true,
  area: true,
  timezone: true,
  quickNote: true,
  capturedFrom: true,
  capturedAt: true,
  observedProblems: true,
  workType: true,
  budgetRange: true,
  urgency: true,
  source: true,
  tags: true,
  status: true,
  statusUpdatedAt: true,
  isActive: true,
  hasReplied: true,
  isInterested: true,
  unsubscribed: true,
  campaignRunning: true,
  lastContactedAt: true,
  totalEmailsSent: true,
  lastReplyAt: true,
  priority: true,
  isPinned: true,
  isFavorite: true,
  enrichmentStatus: true,
  enrichmentError: true,
  aiEnrichedAt: true,
  aiScore: true,
  aiSummary: true,
  aiPainPoints: true,
  aiEmailOpener: true,
  aiAdCopy: true,
  notes: true,
  internalLabel: true,
  softDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LeadSelect;

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

function normalizeLeadCreateData(body: Partial<Prisma.LeadUncheckedCreateInput>) {
  const data: Partial<Prisma.LeadUncheckedCreateInput> = {};

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
  if ("capturedAt" in body) {
    data.capturedAt = body.capturedAt instanceof Date ? body.capturedAt : undefined;
  }
  if ("observedProblems" in body) {
    data.observedProblems = normalizeStringArray(body.observedProblems);
  }
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
  const enrichmentStatus = searchParams.get("enrichmentStatus")?.trim();

  const where: Prisma.LeadWhereInput = {
    userId: session.user.id,
    softDeleted: false,
    ...(status ? { status: status as Prisma.LeadWhereInput["status"] } : {}),
    ...(enrichmentStatus
      ? { enrichmentStatus: enrichmentStatus as Prisma.LeadWhereInput["enrichmentStatus"] }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { businessName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { city: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      select: leadSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.lead.count({ where }),
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

    const body = (await request.json()) as Partial<Prisma.LeadUncheckedCreateInput>;
    const data = normalizeLeadCreateData(body);

    if (!data.name || !data.businessName) {
      return NextResponse.json(
        { error: "Name and business name are required" },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.create({
      data: {
        ...data,
        userId: session.user.id,
      } as Prisma.LeadUncheckedCreateInput,
      select: leadSelect,
    });

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to create lead",
        message: "Unable to create lead",
      },
      { status: 500 },
    );
  }
}

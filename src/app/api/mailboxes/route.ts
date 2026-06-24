import { NextResponse } from "next/server";

import { Prisma } from "@/app/generated/prisma/client";
import type { MailboxModel as Mailbox } from "@/app/generated/prisma/models";
import { auth } from "@/lib/auth";
import { encryptSecret } from "@/lib/encryption";
import prisma from "@/lib/prisma";

const mailboxSelect = {
  id: true,
  userId: true,
  label: true,
  fromName: true,
  fromEmail: true,
  replyTo: true,
  type: true,
  isDefault: true,
  isActive: true,
  connectionStatus: true,
  lastTestedAt: true,
  lastError: true,
  gmailEmail: true,
  gmailRefreshToken: true,
  smtpHost: true,
  smtpPort: true,
  smtpUser: true,
  smtpPassEnc: true,
  smtpSsl: true,
  imapEnabled: true,
  imapHost: true,
  imapPort: true,
  imapUser: true,
  imapPassEnc: true,
  imapSsl: true,
  sendCountToday: true,
  dailySendLimit: true,
  lastSentAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Record<keyof Mailbox, true>;

function hideMailboxSecrets(mailbox: Mailbox) {
  return {
    ...mailbox,
    gmailRefreshToken: null,
    smtpPassEnc: null,
    imapPassEnc: null,
  };
}

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

function optionalNumber(value: unknown) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeMailboxData(
  body: Partial<Prisma.MailboxUncheckedCreateInput>,
) {
  const data: Partial<Prisma.MailboxUncheckedCreateInput> = {};

  data.label = optionalString(body.label) ?? "";
  data.type = body.type;
  data.fromName = optionalString(body.fromName);
  data.fromEmail = optionalString(body.fromEmail);
  data.replyTo = optionalString(body.replyTo);
  data.isDefault = Boolean(body.isDefault);
  data.isActive = typeof body.isActive === "boolean" ? body.isActive : true;
  data.gmailEmail = optionalString(body.gmailEmail);
  const gmailRefreshToken = optionalString(body.gmailRefreshToken);
  data.gmailRefreshToken = gmailRefreshToken
    ? encryptSecret(gmailRefreshToken)
    : null;
  data.smtpHost = optionalString(body.smtpHost);
  data.smtpPort = optionalNumber(body.smtpPort);
  data.smtpUser = optionalString(body.smtpUser);
  data.smtpSsl = typeof body.smtpSsl === "boolean" ? body.smtpSsl : true;
  data.imapEnabled = Boolean(body.imapEnabled);
  data.imapHost = optionalString(body.imapHost);
  data.imapPort = optionalNumber(body.imapPort);
  data.imapUser = optionalString(body.imapUser);
  data.imapSsl = typeof body.imapSsl === "boolean" ? body.imapSsl : true;
  data.dailySendLimit = optionalNumber(body.dailySendLimit) ?? 400;

  if (typeof body.smtpPassEnc === "string" && body.smtpPassEnc.trim()) {
    data.smtpPassEnc = encryptSecret(body.smtpPassEnc.trim());
  }

  if (typeof body.imapPassEnc === "string" && body.imapPassEnc.trim()) {
    data.imapPassEnc = encryptSecret(body.imapPassEnc.trim());
  }

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
  const isActive = searchParams.get("isActive");

  const where: Prisma.MailboxWhereInput = {
    userId: session.user.id,
    ...(type ? { type: type as Mailbox["type"] } : {}),
    ...(isActive === "true"
      ? { isActive: true }
      : isActive === "false"
        ? { isActive: false }
        : {}),
    ...(search
      ? {
          OR: [
            { label: { contains: search, mode: "insensitive" } },
            { fromName: { contains: search, mode: "insensitive" } },
            { replyTo: { contains: search, mode: "insensitive" } },
            { gmailEmail: { contains: search, mode: "insensitive" } },
            { smtpUser: { contains: search, mode: "insensitive" } },
            { imapUser: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.mailbox.findMany({
      where,
      select: mailboxSelect,
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.mailbox.count({ where }),
  ]);

  return NextResponse.json({
    data: data.map(hideMailboxSecrets),
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
      (await request.json()) as Partial<Prisma.MailboxUncheckedCreateInput>;
    const data = normalizeMailboxData(body);

    if (!data.label || !data.type) {
      return NextResponse.json(
        { error: "Label and type are required" },
        { status: 400 },
      );
    }

    const mailbox = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.mailbox.updateMany({
          where: { userId: session.user!.id },
          data: { isDefault: false },
        });
      }

      return tx.mailbox.create({
        data: {
          ...data,
          userId: session.user!.id,
        } as Prisma.MailboxUncheckedCreateInput,
        select: mailboxSelect,
      });
    });

    return NextResponse.json(
      { data: hideMailboxSecrets(mailbox) },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "A mailbox with this label already exists",
          message: "A mailbox with this label already exists",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Unable to create mailbox",
        message: "Unable to create mailbox",
      },
      { status: 500 },
    );
  }
}


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
} satisfies Prisma.MailboxSelect;

function hideMailboxSecrets(mailbox: Mailbox) {
  return {
    ...mailbox,
    gmailRefreshToken: null,
    smtpPassEnc: null,
    imapPassEnc: null,
  };
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalNumber(value: unknown) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeMailboxUpdateData(
  body: Partial<Prisma.MailboxUncheckedUpdateInput>,
) {
  const data: Partial<Prisma.MailboxUncheckedUpdateInput> = {};

  if ("label" in body) data.label = optionalString(body.label) ?? "";
  if ("fromName" in body) data.fromName = optionalString(body.fromName);
  if ("fromEmail" in body) data.fromEmail = optionalString(body.fromEmail);
  if ("replyTo" in body) data.replyTo = optionalString(body.replyTo);
  if ("isDefault" in body) data.isDefault = Boolean(body.isDefault);
  if ("isActive" in body) data.isActive = Boolean(body.isActive);
  if ("gmailEmail" in body) data.gmailEmail = optionalString(body.gmailEmail);
  if ("gmailRefreshToken" in body) {
    const gmailRefreshToken = optionalString(body.gmailRefreshToken);
    data.gmailRefreshToken = gmailRefreshToken
      ? encryptSecret(gmailRefreshToken)
      : null;
  }
  if ("smtpHost" in body) data.smtpHost = optionalString(body.smtpHost);
  if ("smtpPort" in body) data.smtpPort = optionalNumber(body.smtpPort);
  if ("smtpUser" in body) data.smtpUser = optionalString(body.smtpUser);
  if ("smtpSsl" in body) data.smtpSsl = Boolean(body.smtpSsl);
  if ("imapEnabled" in body) data.imapEnabled = Boolean(body.imapEnabled);
  if ("imapHost" in body) data.imapHost = optionalString(body.imapHost);
  if ("imapPort" in body) data.imapPort = optionalNumber(body.imapPort);
  if ("imapUser" in body) data.imapUser = optionalString(body.imapUser);
  if ("imapSsl" in body) data.imapSsl = Boolean(body.imapSsl);
  if ("dailySendLimit" in body) {
    data.dailySendLimit = optionalNumber(body.dailySendLimit) ?? 400;
  }

  if (typeof body.smtpPassEnc === "string" && body.smtpPassEnc.trim()) {
    data.smtpPassEnc = encryptSecret(body.smtpPassEnc.trim());
  } else {
    delete data.smtpPassEnc;
  }

  if (typeof body.imapPassEnc === "string" && body.imapPassEnc.trim()) {
    data.imapPassEnc = encryptSecret(body.imapPassEnc.trim());
  } else {
    delete data.imapPassEnc;
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
  const mailbox = await prisma.mailbox.findFirst({
    where: { id, userId: session.user.id },
    select: mailboxSelect,
  });

  if (!mailbox) {
    return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });
  }

  return NextResponse.json({ data: hideMailboxSecrets(mailbox) });
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
    const existingMailbox = await prisma.mailbox.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!existingMailbox) {
      return NextResponse.json(
        { error: "Mailbox not found" },
        { status: 404 },
      );
    }

    const body =
      (await request.json()) as Partial<Prisma.MailboxUncheckedUpdateInput>;
    const data = normalizeMailboxUpdateData(body);

    if ("label" in data && !data.label) {
      return NextResponse.json(
        { error: "Label is required" },
        { status: 400 },
      );
    }

    const mailbox = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.mailbox.updateMany({
          where: { userId: session.user!.id, id: { not: id } },
          data: { isDefault: false },
        });
      }

      return tx.mailbox.update({
        where: { id },
        data,
        select: mailboxSelect,
      });
    });

    return NextResponse.json({ data: hideMailboxSecrets(mailbox) });
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
        error: "Unable to update mailbox",
        message: "Unable to update mailbox",
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
  const deleted = await prisma.mailbox.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (!deleted.count) {
    return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

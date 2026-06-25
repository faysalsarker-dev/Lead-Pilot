import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { MailboxModel as Mailbox } from "@/app/generated/prisma/models";
import { decryptSecret } from "@/lib/encryption";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MailboxWithSecrets = Mailbox;

export interface SendMailOptions {
  from?: string;
  to: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}

// ─── Transport factory ────────────────────────────────────────────────────────

export async function createTransport(
  mailbox: MailboxWithSecrets,
): Promise<Transporter> {
  switch (mailbox.type) {
    case "CUSTOM_SMTP":
      return createSmtpTransport(mailbox);
    case "GMAIL_IMAP":
      return createGmailImapTransport(mailbox);
    case "GMAIL_OAUTH":
      return createGmailOAuthTransport(mailbox);
    default:
      throw new Error(`Unknown mailbox type: ${(mailbox as Mailbox).type}`);
  }
}

// ─── CUSTOM_SMTP ─────────────────────────────────────────────────────────────
// Works with any SMTP provider: Resend, Brevo, Mailgun, own VPS etc.
// port 465 → SSL (secure: true)
// port 587 → STARTTLS (secure: false, requireTLS: true)

function createSmtpTransport(mailbox: MailboxWithSecrets): Transporter {
  if (!mailbox.smtpHost || !mailbox.smtpPort || !mailbox.smtpUser) {
    throw new Error(
      "SMTP configuration incomplete: host, port, and user are required",
    );
  }

  const pass = mailbox.smtpPassEnc
    ? decryptSecret(mailbox.smtpPassEnc)
    : undefined;

  return nodemailer.createTransport({
    host: mailbox.smtpHost,
    port: mailbox.smtpPort,
    secure: mailbox.smtpPort === 465,
    requireTLS: mailbox.smtpPort === 587,
    auth: { user: mailbox.smtpUser, pass },
  });
}

// ─── GMAIL_IMAP ───────────────────────────────────────────────────────────────
// Personal Gmail via App Password (not OAuth).
// User must: enable 2FA → myaccount.google.com/apppasswords → generate key
// Stored in smtpPassEnc (encrypted), gmailEmail is the from address

function createGmailImapTransport(mailbox: MailboxWithSecrets): Transporter {
  if (!mailbox.gmailEmail) {
    throw new Error("Gmail email address is required");
  }
  if (!mailbox.smtpPassEnc) {
    throw new Error("Gmail App Password is required");
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: mailbox.gmailEmail,
      pass: decryptSecret(mailbox.smtpPassEnc),
    },
  });
}

// ─── GMAIL_OAUTH ──────────────────────────────────────────────────────────────
// Gmail via OAuth2 — better for production, no App Password needed.
// Requires in your app .env (not user's):
//   GOOGLE_CLIENT_ID
//   GOOGLE_CLIENT_SECRET
// User's refresh token is stored encrypted in gmailRefreshToken field.

async function createGmailOAuthTransport(
  mailbox: MailboxWithSecrets,
): Promise<Transporter> {
  if (!mailbox.gmailEmail || !mailbox.gmailRefreshToken) {
    throw new Error("Gmail OAuth: email and refresh token are required");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in env",
    );
  }

  const refreshToken = decryptSecret(mailbox.gmailRefreshToken);

  // Exchange refresh token → fresh access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!tokenRes.ok) {
    const err = (await tokenRes.json().catch(() => ({}))) as {
      error_description?: string;
    };
    throw new Error(
      `Gmail OAuth token refresh failed: ${err.error_description ?? tokenRes.statusText}`,
    );
  }

  const { access_token } = (await tokenRes.json()) as {
    access_token: string;
  };

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: mailbox.gmailEmail,
      clientId,
      clientSecret,
      refreshToken,
      accessToken: access_token,
    },
  });
}

// ─── Test connection ──────────────────────────────────────────────────────────
// Verifies credentials without sending a real email.
// Uses nodemailer's built-in verify() which opens a connection + authenticates.

export async function testMailboxConnection(
  mailbox: MailboxWithSecrets,
): Promise<void> {

  const transport = await createTransport(mailbox);
  await transport.verify();

}

// ─── Send mail ────────────────────────────────────────────────────────────────
// Main send function used by campaign send route and email queue.

export async function sendMail(
  mailbox: MailboxWithSecrets,
  options: SendMailOptions,
): Promise<{ messageId: string }> {
  const transport = await createTransport(mailbox);

  const info = await transport.sendMail({
    from: options.from ?? buildFromAddress(mailbox),
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    replyTo: options.replyTo ?? mailbox.replyTo ?? undefined,
    subject: options.subject,
    html: options.html,
    text: options.text ?? stripHtml(options.html),
    headers: options.headers,
  });
  return { messageId: info.messageId as string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Priority: fromEmail (custom domain) → gmailEmail → smtpUser → fallback
function buildFromAddress(mailbox: MailboxWithSecrets): string {
  const email =
    mailbox.fromEmail ??
    mailbox.gmailEmail ??
    mailbox.smtpUser ??
    "noreply@example.com";

  return mailbox.fromName ? `"${mailbox.fromName}" <${email}>` : email;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
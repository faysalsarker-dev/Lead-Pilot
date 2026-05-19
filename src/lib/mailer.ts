import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

/**
 * Creates a transporter for sending emails
 * Supports both Gmail OAuth and custom SMTP
 */
async function createTransporter(mailboxId: string) {
  const mailbox = await prisma.mailbox.findUnique({
    where: { id: mailboxId },
  });

  if (!mailbox) {
    throw new Error(`Mailbox not found: ${mailboxId}`);
  }

  if (mailbox.type === 'GMAIL_OAUTH') {
    if (!mailbox.gmailRefreshToken) {
      throw new Error('Gmail mailbox missing refresh token');
    }

    oauth2Client.setCredentials({
      refresh_token: mailbox.gmailRefreshToken,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    const accessToken = credentials.access_token;

    if (!accessToken) {
      throw new Error('Failed to get Gmail access token');
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: mailbox.smtpUser,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: mailbox.gmailRefreshToken,
        accessToken,
      },
    });
  } else if (mailbox.type === 'CUSTOM_SMTP') {
    if (!mailbox.smtpHost || !mailbox.smtpPort || !mailbox.smtpUser) {
      throw new Error('SMTP mailbox missing configuration');
    }

    const smtpPassword = mailbox.smtpPassEnc ? decrypt(mailbox.smtpPassEnc) : '';

    return nodemailer.createTransport({
      host: mailbox.smtpHost,
      port: mailbox.smtpPort,
      secure: mailbox.smtpPort === 465,
      auth: {
        user: mailbox.smtpUser,
        pass: smtpPassword,
      },
    });
  }

  throw new Error(`Unknown mailbox type: ${mailbox.type}`);
}

/**
 * Sends an email and returns the message ID
 * Appends pixel tracking image if pixelToken provided
 */
export async function sendEmail(
  mailboxId: string,
  to: string,
  subject: string,
  body: string,
  pixelToken?: string
) {
  try {
    const transporter = await createTransporter(mailboxId);

    // Append pixel tracking image if token provided
    let htmlBody = body;
    if (pixelToken) {
      const pixelUrl = `${process.env.NEXTAUTH_URL}/api/pixel/${pixelToken}`;
      htmlBody += `\n<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" />`;
    }

    const info = await transporter.sendMail({
      from: undefined, // Use mailbox default sender
      to,
      subject,
      html: htmlBody,
    });

    // Update lastImapSync so we don't re-scan old emails
    await prisma.mailbox.update({
      where: { id: mailboxId },
      data: { lastImapSync: new Date() },
    });

    return info.messageId || null;
  } catch (error) {
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Tests SMTP connection
 */
export async function testSmtp(mailboxId: string): Promise<boolean> {
  try {
    const transporter = await createTransporter(mailboxId);
    await transporter.verify();
    return true;
  } catch (error) {
    throw new Error(`SMTP test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

import { ImapFlow } from 'imapflow';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { extractEmail, extractText } from '@/lib/email-extractor';

/**
 * Connects to IMAP mailbox and scans for new emails
 * Stores replies and marks leads as active
 */
export async function scanMailbox(mailboxId: string) {
  const mailbox = await prisma.mailbox.findUnique({
    where: { id: mailboxId },
  });

  if (!mailbox) {
    throw new Error(`Mailbox not found: ${mailboxId}`);
  }

  if (!mailbox.imapHost || !mailbox.imapPort || !mailbox.imapUser) {
    throw new Error('IMAP mailbox missing configuration');
  }

  const imapPassword = mailbox.imapPassEnc ? decrypt(mailbox.imapPassEnc) : '';

  const client = new ImapFlow({
    host: mailbox.imapHost,
    port: mailbox.imapPort,
    secure: mailbox.imapPort === 993,
    auth: {
      user: mailbox.imapUser,
      pass: imapPassword,
    },
  });

  try {
    await client.connect();

    // Select INBOX
    const lock = await client.getMailboxLock('INBOX');

    try {
      // Find new emails since last sync
      const searchQuery = mailbox.lastImapSync
        ? `SINCE ${mailbox.lastImapSync.toISOString().split('T')[0]}`
        : 'ALL';

      const messages = await client.search({
        unseen: true,
      });

      for (const uid of messages) {
        const message = await client.fetchOne(uid, { source: true, envelope: true });

        if (!message) continue;

        try {
          const fromEmail = message.envelope?.from?.[0]?.address;
          const subject = message.envelope?.subject || '(No subject)';
          const receivedDate = message.envelope?.date || new Date();

          if (!fromEmail) continue;

          // Extract plain text from email body
          const source = message.source?.toString() || '';
          const plainText = extractText(source);

          // Find lead by email
          const lead = await prisma.lead.findFirst({
            where: {
              email: fromEmail,
              user: { mailboxes: { some: { id: mailboxId } } },
            },
          });

          if (!lead) continue;

          // Create reply record
          await prisma.reply.create({
            data: {
              leadId: lead.id,
              mailboxId,
              fromEmail,
              subject,
              body: plainText,
              threadId: message.envelope?.['message-id'] || undefined,
              receivedAt: receivedDate,
            },
          });

          // Mark lead as active (replied)
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              isActive: true,
              hasReplied: true,
              status: 'ACTIVE',
            },
          });

          // Cancel pending follow-up emails for this lead
          await prisma.emailQueue.updateMany({
            where: {
              leadId: lead.id,
              status: 'PENDING',
            },
            data: {
              status: 'CANCELLED',
            },
          });

          // Create notification
          await prisma.notification.create({
            data: {
              userId: lead.userId,
              leadId: lead.id,
              type: 'REPLY_RECEIVED',
              message: `${lead.name} replied to your email`,
            },
          });

          // Mark email as seen
          await client.messageFlagsSet(uid, ['\\Seen']);
        } catch (error) {
          // Log but continue processing other emails
          console.error(`Error processing email from ${message.envelope?.from?.[0]?.address}:`, error);
        }
      }
    } finally {
      lock.release();
    }

    // Update lastImapSync
    await prisma.mailbox.update({
      where: { id: mailboxId },
      data: { lastImapSync: new Date() },
    });
  } finally {
    await client.logout();
  }
}

/**
 * Tests IMAP connection
 */
export async function testImap(mailboxId: string): Promise<boolean> {
  const mailbox = await prisma.mailbox.findUnique({
    where: { id: mailboxId },
  });

  if (!mailbox) {
    throw new Error(`Mailbox not found: ${mailboxId}`);
  }

  if (!mailbox.imapHost || !mailbox.imapPort || !mailbox.imapUser) {
    throw new Error('IMAP mailbox missing configuration');
  }

  const imapPassword = mailbox.imapPassEnc ? decrypt(mailbox.imapPassEnc) : '';

  const client = new ImapFlow({
    host: mailbox.imapHost,
    port: mailbox.imapPort,
    secure: mailbox.imapPort === 993,
    auth: {
      user: mailbox.imapUser,
      pass: imapPassword,
    },
  });

  try {
    await client.connect();
    await client.logout();
    return true;
  } catch (error) {
    throw new Error(`IMAP test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

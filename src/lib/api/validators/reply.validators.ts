import { z } from "zod";

export const createReplySchema = z.object({
  leadId: z.string(),
  mailboxId: z.string(),
  fromEmail: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  threadId: z.string().optional(),
  receivedAt: z.string().datetime().optional(),
  isRead: z.boolean().optional(),
});

export const updateReplySchema = z.object({
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  isRead: z.boolean().optional(),
});

import { z } from "zod";

export const createNotificationSchema = z.object({
  leadId: z.string().optional(),
  campaignId: z.string().optional(),
  type: z.enum([
    "REPLY_RECEIVED",
    "FOLLOWUP_SENT",
    "CAMPAIGN_COMPLETED",
    "LEAD_BOUNCED",
    "CAMPAIGN_PAUSED",
    "AI_ENRICHMENT_DONE",
  ]),
  message: z.string().min(1),
  isRead: z.boolean().optional(),
});

export const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  message: z.string().min(1).optional(),
});

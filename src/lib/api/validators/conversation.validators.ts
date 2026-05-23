import { z } from "zod";

export const addMessageSchema = z.object({
  role: z.enum(["user", "lead"]),
  body: z.string().min(1),
  subject: z.string().optional(),
  sentAt: z.string().datetime().optional(),
});

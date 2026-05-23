import prisma from "@/lib/prisma";
import { NotFoundError } from "./middleware/errors";

function pagination(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export const conversationService = {
  async getConversationByLead(leadId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { leadId },
      include: { lead: true },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation not found");
    }

    return conversation;
  },

  async addMessageToConversation(
    leadId: string,
    message: { role: "user" | "lead"; body: string; subject?: string; sentAt?: string }
  ) {
    const existing = await prisma.conversation.findUnique({ where: { leadId } });
    const messages = Array.isArray(existing?.messages) ? existing.messages : [];
    const nextMessage = {
      ...message,
      sentAt: message.sentAt ?? new Date().toISOString(),
    };

    return prisma.conversation.upsert({
      where: { leadId },
      create: {
        leadId,
        messages: [nextMessage],
      },
      update: {
        messages: [...messages, nextMessage],
      },
    });
  },
};

export const emailQueueService = {
  async getPendingEmails(limit = 10) {
    return prisma.emailQueue.findMany({
      where: { status: "PENDING" },
      orderBy: { scheduledAt: "asc" },
      take: limit,
      include: { campaign: true, lead: true, mailbox: true, template: true },
    });
  },

  async getEmailsByCampaign(campaignId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { campaignId };
    const [data, total] = await Promise.all([
      prisma.emailQueue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: "desc" },
        include: { lead: true, mailbox: true, template: true },
      }),
      prisma.emailQueue.count({ where }),
    ]);

    return { data, ...pagination(page, limit, total) };
  },

  async getEmailById(id: string) {
    const email = await prisma.emailQueue.findUnique({
      where: { id },
      include: { campaign: true, lead: true, mailbox: true, template: true },
    });

    if (!email) {
      throw new NotFoundError("Email queue item not found");
    }

    return email;
  },

  async getQueueStats(userId: string) {
    const where = { campaign: { userId } };
    const [pending, sent, failed, cancelled] = await Promise.all([
      prisma.emailQueue.count({ where: { ...where, status: "PENDING" } }),
      prisma.emailQueue.count({ where: { ...where, status: "SENT" } }),
      prisma.emailQueue.count({ where: { ...where, status: "FAILED" } }),
      prisma.emailQueue.count({ where: { ...where, status: "CANCELLED" } }),
    ]);

    return { pending, sent, failed, cancelled, total: pending + sent + failed + cancelled };
  },

  async markAsSent(id: string) {
    return prisma.emailQueue.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date() },
    });
  },

  async markEmailAsSent(id: string) {
    return this.markAsSent(id);
  },

  async markAsFailed(id: string, failReason?: string) {
    return prisma.emailQueue.update({
      where: { id },
      data: { status: "FAILED", failedAt: new Date(), failReason },
    });
  },

  async markEmailAsFailed(id: string, failReason?: string) {
    return this.markAsFailed(id, failReason);
  },
};

export const notificationService = {
  async getNotificationsByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { userId };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { lead: true, campaign: true },
      }),
      prisma.notification.count({ where }),
    ]);

    return { data, ...pagination(page, limit, total) };
  },

  async getUnreadNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
      include: { lead: true, campaign: true },
    });
  },

  async getNotificationById(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
      include: { lead: true, campaign: true },
    });

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    return notification;
  },

  async createNotification(
    userId: string,
    data: {
      leadId?: string;
      campaignId?: string;
      type:
        | "REPLY_RECEIVED"
        | "FOLLOWUP_SENT"
        | "CAMPAIGN_COMPLETED"
        | "LEAD_BOUNCED"
        | "CAMPAIGN_PAUSED"
        | "AI_ENRICHMENT_DONE";
      message: string;
      isRead?: boolean;
    }
  ) {
    return prisma.notification.create({ data: { ...data, userId } });
  },

  async updateNotification(id: string, userId: string, data: { isRead?: boolean; message?: string }) {
    await this.getNotificationById(id, userId);
    return prisma.notification.update({ where: { id }, data });
  },

  async markAsRead(id: string, userId: string) {
    return this.updateNotification(id, userId, { isRead: true });
  },

  async markNotificationAsRead(id: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  async markAllNotificationsAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { updated: result.count };
  },

  async deleteNotification(id: string, userId?: string) {
    if (userId) {
      await this.getNotificationById(id, userId);
    } else {
      const notification = await prisma.notification.findUnique({ where: { id } });
      if (!notification) {
        throw new NotFoundError("Notification not found");
      }
    }
    await prisma.notification.delete({ where: { id } });
    return null;
  },
};

export const replyService = {
  async getRepliesByLead(leadId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { leadId };
    const [data, total] = await Promise.all([
      prisma.reply.findMany({ where, skip, take: limit, orderBy: { receivedAt: "desc" } }),
      prisma.reply.count({ where }),
    ]);

    return { data, ...pagination(page, limit, total) };
  },

  async getRepliesByMailbox(mailboxId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { mailboxId };
    const [data, total] = await Promise.all([
      prisma.reply.findMany({ where, skip, take: limit, orderBy: { receivedAt: "desc" } }),
      prisma.reply.count({ where }),
    ]);

    return { data, ...pagination(page, limit, total) };
  },

  async getReplyById(id: string) {
    const reply = await prisma.reply.findUnique({ where: { id } });
    if (!reply) {
      throw new NotFoundError("Reply not found");
    }
    return reply;
  },

  async createReply(data: {
    leadId: string;
    mailboxId: string;
    fromEmail: string;
    subject: string;
    body: string;
    threadId?: string;
    receivedAt?: string;
    isRead?: boolean;
  }) {
    return prisma.reply.create({
      data: {
        ...data,
        receivedAt: data.receivedAt ? new Date(data.receivedAt) : new Date(),
      },
    });
  },

  async updateReply(id: string, data: { subject?: string; body?: string; isRead?: boolean }) {
    await this.getReplyById(id);
    return prisma.reply.update({ where: { id }, data });
  },

  async markAsRead(id: string) {
    return this.updateReply(id, { isRead: true });
  },

  async markReplyAsRead(id: string) {
    return this.markAsRead(id);
  },

  async deleteReply(id: string) {
    await this.getReplyById(id);
    await prisma.reply.delete({ where: { id } });
    return null;
  },
};

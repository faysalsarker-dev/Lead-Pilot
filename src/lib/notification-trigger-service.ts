// Notification Trigger Service
// Creates notifications when important events occur

import prisma from "@/lib/prisma";

type NotificationType =
  | "REPLY_RECEIVED"
  | "FOLLOWUP_SENT"
  | "CAMPAIGN_COMPLETED"
  | "LEAD_BOUNCED"
  | "CAMPAIGN_PAUSED"
  | "AI_ENRICHMENT_DONE";

interface CreateNotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string; // leadId, campaignId, etc.
}

export class NotificationTriggerService {
  /**
   * Create a notification in the database
   */
  static async createNotification(
    payload: CreateNotificationPayload
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          relatedId: payload.relatedId,
          isRead: false,
        },
      });

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Trigger notification when lead replies
   */
  static async notifyLeadReply(userId: string, leadEmail: string, leadName: string) {
    return this.createNotification({
      userId,
      type: "REPLY_RECEIVED",
      title: "New Lead Reply",
      message: `${leadName} (${leadEmail}) replied to your email`,
      relatedId: leadEmail, // Can store as identifier
    });
  }

  /**
   * Trigger notification when follow-up is sent
   */
  static async notifyFollowupSent(
    userId: string,
    leadName: string,
    campaignName: string,
    sequenceNumber: number
  ) {
    return this.createNotification({
      userId,
      type: "FOLLOWUP_SENT",
      title: `Follow-up #${sequenceNumber} Sent`,
      message: `Follow-up email sent to ${leadName} in campaign "${campaignName}"`,
    });
  }

  /**
   * Trigger notification when campaign completes
   */
  static async notifyCampaignCompleted(
    userId: string,
    campaignId: string,
    campaignName: string,
    totalLeads: number,
    replies: number
  ) {
    const replyRate = totalLeads > 0 ? ((replies / totalLeads) * 100).toFixed(1) : "0";
    
    return this.createNotification({
      userId,
      type: "CAMPAIGN_COMPLETED",
      title: "Campaign Completed",
      message: `"${campaignName}" finished with ${totalLeads} leads and ${replies} replies (${replyRate}% reply rate)`,
      relatedId: campaignId,
    });
  }

  /**
   * Trigger notification when lead bounces
   */
  static async notifyLeadBounced(
    userId: string,
    leadName: string,
    leadEmail: string
  ) {
    return this.createNotification({
      userId,
      type: "LEAD_BOUNCED",
      title: "Email Bounced",
      message: `Email to ${leadName} (${leadEmail}) bounced. This address may be invalid.`,
    });
  }

  /**
   * Trigger notification when campaign is paused
   */
  static async notifyCampaignPaused(
    userId: string,
    campaignId: string,
    campaignName: string,
    reason?: string
  ) {
    const reasonText = reason ? ` - ${reason}` : "";
    
    return this.createNotification({
      userId,
      type: "CAMPAIGN_PAUSED",
      title: "Campaign Paused",
      message: `"${campaignName}" has been paused${reasonText}`,
      relatedId: campaignId,
    });
  }

  /**
   * Trigger notification when AI enrichment completes
   */
  static async notifyAiEnrichmentComplete(
    userId: string,
    leadName: string,
    score: number
  ) {
    const qualityMessage =
      score >= 8
        ? "High quality lead identified"
        : score >= 5
        ? "Medium quality lead"
        : "Low quality lead";

    return this.createNotification({
      userId,
      type: "AI_ENRICHMENT_DONE",
      title: "AI Enrichment Complete",
      message: `${leadName} enriched - Score: ${score}/10 (${qualityMessage})`,
    });
  }

  /**
   * Notify user about bulk enrichment completion
   */
  static async notifyBulkEnrichmentComplete(
    userId: string,
    totalLeads: number,
    avgScore: number
  ) {
    return this.createNotification({
      userId,
      type: "AI_ENRICHMENT_DONE",
      title: "Bulk Enrichment Complete",
      message: `Enriched ${totalLeads} leads with average score of ${avgScore.toFixed(1)}/10`,
    });
  }

  /**
   * Get user's notification preferences
   */
  static async getNotificationPreferences(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          webPushEnabled: true,
          webPushSubscription: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Error getting notification preferences:", error);
      return null;
    }
  }

  /**
   * Update user's web push subscription
   */
  static async updateWebPushSubscription(
    userId: string,
    subscription: any
  ) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          webPushEnabled: true,
          webPushSubscription: subscription,
        },
      });

      return user;
    } catch (error) {
      console.error("Error updating web push subscription:", error);
      throw error;
    }
  }
}

export default NotificationTriggerService;

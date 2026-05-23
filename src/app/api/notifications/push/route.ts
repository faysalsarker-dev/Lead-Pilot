/**
 * Socket.io Notification Push Endpoint
 * 
 * Backend API endpoint that receives notifications and broadcasts them to users
 * via Socket.io. This can be called from:
 * - Cron jobs
 * - Event handlers
 * - Scheduled tasks
 * 
 * Example usage:
 * POST /api/notifications/push
 * {
 *   "userId": "user123",
 *   "type": "REPLY_RECEIVED",
 *   "title": "New Reply",
 *   "message": "Sarah replied to your message",
 *   "relatedId": "lead123"
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// For Socket.io server communication (in production, this runs on a separate server)
// For now, we'll create the notification in DB and the Socket.io server will query it

interface NotificationPushPayload {
  userId: string;
  type: "REPLY_RECEIVED" | "FOLLOWUP_SENT" | "CAMPAIGN_COMPLETED" | "LEAD_BOUNCED" | "CAMPAIGN_PAUSED" | "AI_ENRICHMENT_DONE";
  title: string;
  message: string;
  relatedId?: string;
  broadcastViaSocket?: boolean; // Whether to broadcast via Socket.io (optional)
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get("x-api-key");
    const validApiKey = process.env.NOTIFICATIONS_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: NotificationPushPayload = await request.json();
    const { userId, type, title, message, relatedId, broadcastViaSocket = true } = body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: userId, type, title, message" },
        { status: 400 }
      );
    }

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
      },
    });

    console.log(`✅ Notification created: ${notification.id}`);

    // Broadcast via Socket.io if enabled
    if (broadcastViaSocket) {
      try {
        const socketServerUrl = process.env.SOCKET_SERVER_URL;
        if (socketServerUrl) {
          // Call Socket.io server to broadcast notification
          const response = await fetch(`${socketServerUrl}/api/broadcast`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": validApiKey,
            },
            body: JSON.stringify({
              userId,
              notification: {
                id: notification.id,
                type,
                title,
                message,
                relatedId,
                createdAt: notification.createdAt,
              },
            }),
          });

          if (!response.ok) {
            console.warn(`⚠️  Socket.io broadcast failed: ${response.statusText}`);
          } else {
            console.log(`📡 Broadcasted via Socket.io`);
          }
        }
      } catch (error) {
        console.warn("⚠️  Socket.io broadcast error:", error);
        // Continue - notification was created in DB
      }
    }

    return NextResponse.json(
      {
        success: true,
        notification,
        message: "Notification created and broadcasted",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error pushing notification:", error);
    return NextResponse.json(
      { error: "Failed to push notification" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "Notification push endpoint. Use POST to create notifications." },
    { status: 200 }
  );
}

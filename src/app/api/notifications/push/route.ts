/**
 * Notification Push Endpoint
 *
 * This endpoint creates a notification in the database.
 * It does not rely on WebSocket or Socket.io for delivery.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface NotificationPushPayload {
  userId: string;
  type: "REPLY_RECEIVED" | "FOLLOWUP_SENT" | "CAMPAIGN_COMPLETED" | "LEAD_BOUNCED" | "CAMPAIGN_PAUSED" | "AI_ENRICHMENT_DONE";
  title: string;
  message: string;
  relatedId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const validApiKey = process.env.NOTIFICATIONS_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: NotificationPushPayload = await request.json();
    const { userId, type, title, message, relatedId } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: userId, type, title, message" },
        { status: 400 }
      );
    }

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

    return NextResponse.json(
      {
        success: true,
        notification,
        message: "Notification created",
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

export async function GET() {
  return NextResponse.json(
    { message: "Notification push endpoint. Use POST to create notifications." },
    { status: 200 }
  );
}

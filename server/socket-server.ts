/**
 * Socket.io Server for Real-Time Notifications
 * 
 * This is a separate Node.js server that runs independently from the Next.js app.
 * It handles WebSocket connections and broadcasts notifications to connected clients.
 * 
 * For Vercel deployment:
 * - Deploy this server separately on Railway, Render, or similar
 * - Next.js frontend connects to this server via SOCKET_SERVER_URL env var
 * 
 * Usage:
 * - Development: npm run socket:dev
 * - Production: npm run socket:start (after deploying to external service)
 */

import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import cors from "cors";

interface NotificationPayload {
  userId: string;
  type: "REPLY_RECEIVED" | "FOLLOWUP_SENT" | "CAMPAIGN_COMPLETED" | "LEAD_BOUNCED" | "CAMPAIGN_PAUSED" | "AI_ENRICHMENT_DONE";
  title: string;
  message: string;
  relatedId?: string;
  createdAt: string;
}

interface UserRoom {
  [userId: string]: Set<string>; // Map of userId to Set of socketIds
}

const PORT = process.env.SOCKET_PORT || 3001;
const REDIS_URL = process.env.REDIS_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Create HTTP server
const httpServer = createServer();

// Socket.io configuration
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: FRONTEND_URL.split(",").map((url) => url.trim()),
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Track connected users
const userRooms: UserRoom = {};

/**
 * Setup Redis adapter for multi-instance support
 * Required for production/scaling
 */
async function setupRedisAdapter() {
  if (!REDIS_URL) {
    console.warn("⚠️  REDIS_URL not set. Using in-memory adapter (suitable for development only)");
    return;
  }

  try {
    const pubClient = createClient({ url: REDIS_URL });
    const subClient = pubClient.duplicate();

    pubClient.on("error", (err) => console.error("Redis Pub Client Error", err));
    subClient.on("error", (err) => console.error("Redis Sub Client Error", err));

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ Redis adapter connected");
  } catch (err) {
    console.error("❌ Failed to connect Redis adapter:", err);
    process.exit(1);
  }
}

/**
 * Socket.io Connection Handlers
 */
io.on("connection", (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);

  /**
   * User authenticates and joins their personal room
   * Frontend sends userId after connection
   */
  socket.on("authenticate", (userId: string) => {
    console.log(`🔐 User authenticated: ${userId} (socket: ${socket.id})`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Track user connection
    if (!userRooms[userId]) {
      userRooms[userId] = new Set();
    }
    userRooms[userId].add(socket.id);

    // Emit confirmation
    socket.emit("authenticated", { userId, socketId: socket.id });
  });

  /**
   * Broadcast notification to specific user
   * Called from API endpoints when creating notifications
   */
  socket.on("send-notification", (data: NotificationPayload) => {
    console.log(`📨 Sending notification to ${data.userId}:`, data.type);

    // Send to user's room
    io.to(`user:${data.userId}`).emit("new-notification", {
      ...data,
      socketId: socket.id,
    });
  });

  /**
   * Mark notification as read
   * Broadcasts to all user's devices
   */
  socket.on("mark-read", (data: { notificationId: string; userId: string }) => {
    console.log(`✅ Marking read: ${data.notificationId}`);
    io.to(`user:${data.userId}`).emit("notification-read", {
      notificationId: data.notificationId,
    });
  });

  /**
   * Get current online status
   */
  socket.on("get-online-count", (userId: string) => {
    const count = userRooms[userId]?.size || 0;
    socket.emit("online-count", { userId, count });
  });

  /**
   * Health check endpoint
   */
  socket.on("ping", () => {
    socket.emit("pong");
  });

  /**
   * Handle disconnection
   */
  socket.on("disconnect", () => {
    console.log(`📴 Client disconnected: ${socket.id}`);

    // Remove from user rooms
    Object.keys(userRooms).forEach((userId) => {
      if (userRooms[userId].has(socket.id)) {
        userRooms[userId].delete(socket.id);

        // Clean up empty rooms
        if (userRooms[userId].size === 0) {
          delete userRooms[userId];
        }
      }
    });
  });

  /**
   * Error handling
   */
  socket.on("error", (error) => {
    console.error(`❌ Socket error (${socket.id}):`, error);
  });
});

/**
 * Start server
 */
async function startServer() {
  // Setup Redis if available
  await setupRedisAdapter();

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Socket.io server running on port ${PORT}`);
    console.log(`📍 Frontend URL: ${FRONTEND_URL}`);
    console.log(`🔄 Transport: WebSocket + Polling fallback`);
    console.log(`💾 Adapter: ${REDIS_URL ? "Redis" : "In-Memory"}\n`);
  });
}

/**
 * Graceful shutdown
 */
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down...");
  io.close();
  httpServer.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

// Start the server
startServer().catch(console.error);

/**
 * Export for testing/external use
 */
export { io, httpServer };

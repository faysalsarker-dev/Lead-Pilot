/**
 * Socket.io Broadcast Handler
 * 
 * This file extends the Socket.io server to handle broadcast requests
 * from the API. Add this to your socket-server.ts after creating the io instance.
 * 
 * Usage in socket-server.ts:
 * import { setupBroadcastEndpoint } from './broadcast-handler';
 * setupBroadcastEndpoint(io, httpServer);
 */

import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import express from "express";

export function setupBroadcastEndpoint(
  io: SocketIOServer,
  httpServer: createServer.Server
) {
  const app = express();

  // Middleware
  app.use(express.json());

  /**
   * Verify API key middleware
   */
  app.use((req, res, next) => {
    const apiKey = req.headers["x-api-key"] as string;
    const validApiKey = process.env.NOTIFICATIONS_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    next();
  });

  /**
   * Broadcast notification endpoint
   * POST /api/broadcast
   */
  app.post("/api/broadcast", (req, res) => {
    try {
      const { userId, notification } = req.body;

      if (!userId || !notification) {
        return res.status(400).json({ error: "Missing userId or notification" });
      }

      console.log(`📡 Broadcasting notification to user: ${userId}`);

      // Emit to user's room
      io.to(`user:${userId}`).emit("new-notification", {
        ...notification,
        source: "socket.io",
      });

      return res.json({
        success: true,
        message: `Notification broadcasted to user: ${userId}`,
      });
    } catch (error) {
      console.error("❌ Broadcast error:", error);
      return res.status(500).json({ error: "Broadcast failed" });
    }
  });

  /**
   * Health check endpoint
   */
  app.get("/api/health", (req, res) => {
    const connectedUsers = Object.keys(io.sockets.adapter.rooms);
    res.json({
      status: "ok",
      connectedUsers: connectedUsers.filter((room) => room.startsWith("user:")),
      timestamp: new Date(),
    });
  });

  /**
   * Server stats endpoint
   */
  app.get("/api/stats", (req, res) => {
    const stats = {
      connectedClients: io.engine.clientsCount,
      rooms: io.sockets.adapter.rooms.size,
      namespaces: io.nsps.length,
      uptime: process.uptime(),
    };

    res.json(stats);
  });

  // Setup HTTP server for these routes
  httpServer.on("request", app);

  console.log("✅ Broadcast endpoints configured");
}

export default setupBroadcastEndpoint;

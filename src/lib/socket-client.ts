/**
 * Socket.io Client Service
 * Handles WebSocket connection for real-time notifications
 * 
 * Usage:
 * const socket = SocketClient.getInstance();
 * socket.connect(userId);
 * socket.on("new-notification", (notification) => console.log(notification));
 */

import { io, Socket } from "socket.io-client";

interface NotificationPayload {
  userId: string;
  type: "REPLY_RECEIVED" | "FOLLOWUP_SENT" | "CAMPAIGN_COMPLETED" | "LEAD_BOUNCED" | "CAMPAIGN_PAUSED" | "AI_ENRICHMENT_DONE";
  title: string;
  message: string;
  relatedId?: string;
  createdAt: string;
}

class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;
  private userId: string | null = null;
  private serverUrl: string;
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {
    this.serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  /**
   * Connect to Socket.io server
   */
  public connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected && this.userId === userId) {
        resolve();
        return;
      }

      try {
        this.userId = userId;

        this.socket = io(this.serverUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ["websocket", "polling"],
          auth: {
            userId,
          },
        });

        /**
         * Connection event handlers
         */
        this.socket.on("connect", () => {
          console.log(`✅ Socket connected: ${this.socket?.id}`);

          // Authenticate with server
          this.socket?.emit("authenticate", userId);
        });

        this.socket.on("authenticated", (data) => {
          console.log(`🔐 Authenticated as user: ${data.userId}`);
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          console.error("❌ Connection error:", error);
          reject(error);
        });

        this.socket.on("disconnect", (reason) => {
          console.log(`📴 Socket disconnected: ${reason}`);
        });

        this.socket.on("error", (error) => {
          console.error("❌ Socket error:", error);
        });

        /**
         * Notification handlers
         */
        this.socket.on("new-notification", (notification: NotificationPayload) => {
          console.log("📨 New notification received:", notification);
          this.emit("new-notification", notification);
        });

        this.socket.on("notification-read", (data: { notificationId: string }) => {
          this.emit("notification-read", data);
        });

        this.socket.on("online-count", (data: { userId: string; count: number }) => {
          this.emit("online-count", data);
        });

        this.socket.on("pong", () => {
          this.emit("pong", {});
        });

        // Set connection timeout
        setTimeout(() => {
          if (!this.socket?.connected) {
            reject(new Error("Connection timeout"));
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log("🔌 Socket disconnected");
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get current user ID
   */
  public getCurrentUserId(): string | null {
    return this.userId;
  }

  /**
   * Send notification (admin/server use)
   */
  public sendNotification(notification: NotificationPayload): void {
    if (!this.socket?.connected) {
      console.warn("⚠️  Socket not connected. Cannot send notification.");
      return;
    }

    this.socket.emit("send-notification", notification);
    console.log("📤 Notification sent:", notification);
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string): void {
    if (!this.socket?.connected || !this.userId) {
      console.warn("⚠️  Socket not connected or user not authenticated.");
      return;
    }

    this.socket.emit("mark-read", {
      notificationId,
      userId: this.userId,
    });
  }

  /**
   * Get online device count for user
   */
  public getOnlineCount(): void {
    if (!this.socket?.connected || !this.userId) {
      console.warn("⚠️  Socket not connected or user not authenticated.");
      return;
    }

    this.socket.emit("get-online-count", this.userId);
  }

  /**
   * Send ping for health check
   */
  public ping(): void {
    if (this.socket?.connected) {
      this.socket.emit("ping");
    }
  }

  /**
   * Event listener registration
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   */
  public off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        callback(data);
      });
    }
  }

  /**
   * Get socket instance (for advanced use)
   */
  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton
export default SocketClient;

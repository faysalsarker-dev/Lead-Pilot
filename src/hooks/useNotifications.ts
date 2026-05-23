// Hook for real-time notification with WebSocket fallback
// Uses Socket.io for instant updates, falls back to polling if unavailable

import { useEffect, useCallback, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetNotificationsUnreadCountQuery } from "@/redux/hooks";
import WebPushService from "@/lib/web-push-service";
import SocketClient from "@/lib/socket-client";

interface UseNotificationsOptions {
  pollingInterval?: number; // ms, fallback polling interval (default 30000)
  autoRegisterServiceWorker?: boolean;
  useWebSocket?: boolean; // Enable Socket.io (default true)
  onNewNotification?: (count: number) => void;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    pollingInterval = 30000,
    autoRegisterServiceWorker = true,
    useWebSocket = true,
    onNewNotification,
  } = options;

  const { user } = useAuth();
  const { data: unreadCountData, refetch } = useGetNotificationsUnreadCountQuery();
  const previousCountRef = useRef<number>(0);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<ReturnType<typeof SocketClient.getInstance> | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    if (!useWebSocket || !user?.id) {
      return;
    }

    const initializeSocket = async () => {
      try {
        const socket = SocketClient.getInstance();
        socketRef.current = socket;

        // Connect to server
        await socket.connect(user.id);
        setIsSocketConnected(true);
        console.log("🎯 WebSocket connected for real-time notifications");

        // Listen for new notifications via WebSocket
        socket.on("new-notification", (notification) => {
          console.log("📨 New notification via WebSocket:", notification);
          refetch(); // Refetch to update unread count
        });

        // Listen for read notifications
        socket.on("notification-read", (data) => {
          console.log("✅ Notification marked read:", data);
          refetch();
        });
      } catch (error) {
        console.error("❌ WebSocket connection failed:", error);
        setIsSocketConnected(false);
        // Will fall back to polling
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setIsSocketConnected(false);
      }
    };
  }, [useWebSocket, user?.id, refetch]);

  // Register service worker on mount
  useEffect(() => {
    if (autoRegisterServiceWorker && WebPushService.canUseNotifications()) {
      WebPushService.registerServiceWorker().catch(console.error);
    }
  }, [autoRegisterServiceWorker]);

  // Detect new notifications and trigger callback
  useEffect(() => {
    const currentCount = unreadCountData?.data?.count || 0;
    const previousCount = previousCountRef.current;

    if (currentCount > previousCount && previousCount > 0) {
      // New notification arrived
      onNewNotification?.(currentCount);

      // Show browser notification if enabled
      if (WebPushService.isPushEnabled()) {
        WebPushService.sendLocalNotification({
          title: "New Notification",
          message: `You have ${currentCount} unread notification${currentCount > 1 ? "s" : ""}`,
          tag: "unread-count",
        }).catch(console.error);
      }
    }

    previousCountRef.current = currentCount;
  }, [unreadCountData?.data?.count, onNewNotification]);

  // Fallback polling when Socket.io is not available
  useEffect(() => {
    // Only poll if WebSocket is not connected or disabled
    if (isSocketConnected && useWebSocket) {
      return; // Skip polling when WebSocket is active
    }

    const interval = setInterval(() => {
      refetch();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [refetch, pollingInterval, isSocketConnected, useWebSocket]);

  const unreadCount = unreadCountData?.data?.count || 0;

  return {
    unreadCount,
    refetch,
    isSupported: WebPushService.canUseNotifications(),
    isPushEnabled: WebPushService.isPushEnabled(),
    isSocketConnected,
    socketInstance: socketRef.current,
  };
}

export default useNotifications;

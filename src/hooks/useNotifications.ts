import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGetNotificationsUnreadCountQuery } from "@/redux/hooks";
import WebPushService from "@/lib/web-push-service";

interface UseNotificationsOptions {
  pollingInterval?: number; // ms, fallback polling interval (default 30000)
  autoRegisterServiceWorker?: boolean;
  onNewNotification?: (count: number) => void;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    pollingInterval = 30000,
    autoRegisterServiceWorker = true,
    onNewNotification,
  } = options;

  const { user } = useAuth();
  const { data: unreadCountData, refetch } = useGetNotificationsUnreadCountQuery();
  const previousCountRef = useRef<number>(0);

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
      onNewNotification?.(currentCount);

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

  // Poll for unread count on an interval
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const interval = setInterval(() => {
      refetch();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [refetch, pollingInterval, user?.id]);

  const unreadCount = unreadCountData?.data?.count || 0;

  return {
    unreadCount,
    refetch,
    isSupported: WebPushService.canUseNotifications(),
    isPushEnabled: WebPushService.isPushEnabled(),
  };
}

export default useNotifications;

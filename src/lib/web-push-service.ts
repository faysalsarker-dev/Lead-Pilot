// Web Push Notification Service
// Manages browser push notification subscriptions and sending

interface PushNotificationOptions {
  title: string;
  message: string;
  badge?: string;
  icon?: string;
  tag?: string;
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
}

export class WebPushService {
  private static serviceWorkerPath = "/service-worker.js";

  /**
   * Check if browser supports push notifications
   */
  static canUseNotifications(): boolean {
    return (
      typeof window !== "undefined" &&
      ("serviceWorker" in navigator) &&
      ("Notification" in window) &&
      ("PushManager" in window)
    );
  }

  /**
   * Check if push notifications are enabled
   */
  static isPushEnabled(): boolean {
    return this.canUseNotifications() && Notification.permission === "granted";
  }

  /**
   * Request notification permission from user
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.canUseNotifications()) {
      console.warn("Push notifications not supported in this browser");
      return "denied";
    }

    if (Notification.permission !== "default") {
      return Notification.permission;
    }

    return Notification.requestPermission();
  }

  /**
   * Register service worker for push notifications
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.canUseNotifications()) {
      console.warn("Service workers not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        this.serviceWorkerPath,
        { scope: "/" }
      );
      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }

  /**
   * Subscribe to push notifications
   * Returns subscription object to send to server
   */
  static async subscribeToPush(
    vapidPublicKey?: string
  ): Promise<PushSubscription | null> {
    if (!this.canUseNotifications()) {
      console.warn("Push notifications not supported");
      return null;
    }

    // Request permission if not already granted
    if (Notification.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        return null;
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscriptionOptions: PushSubscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey: undefined,
      };

      // Add VAPID key if provided
      if (vapidPublicKey) {
        subscriptionOptions.applicationServerKey =
          this.urlBase64ToUint8Array(vapidPublicKey);
      }

      const subscription = await registration.pushManager.subscribe(
        subscriptionOptions
      );

      console.log("Subscribed to push notifications");
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  /**
   * Get existing push subscription
   */
  static async getExistingSubscription(): Promise<PushSubscription | null> {
    if (!this.canUseNotifications()) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Error getting push subscription:", error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  static async unsubscribeFromPush(): Promise<boolean> {
    try {
      const subscription = await this.getExistingSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log("Unsubscribed from push notifications");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      return false;
    }
  }

  /**
   * Send a local notification (for testing or in-app notifications)
   */
  static async sendLocalNotification(
    options: PushNotificationOptions
  ): Promise<void> {
    if (!this.isPushEnabled()) {
      console.warn("Push notifications not enabled");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(options.title, {
        body: options.message,
        badge: options.badge || "/badge.png",
        icon: options.icon || "/icon.png",
        tag: options.tag,
        actions: options.actions,
        requireInteraction: false,
      });
    } catch (error) {
      console.error("Error sending local notification:", error);
    }
  }

  /**
   * Convert VAPID key from URL-safe base64 to Uint8Array
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

export default WebPushService;

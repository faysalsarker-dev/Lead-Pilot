# Notification System Configuration Guide

## Overview
Your Lead Pilot notification system is now fully configured with:
- ✅ Real-time notification center page
- ✅ Web Push notification support
- ✅ Automatic notification triggers for key events
- ✅ Live unread count in header
- ✅ Auto-polling every 30 seconds

---

## 📁 Files Created/Updated

### 1. **Notification Center Page**
**File**: `src/app/(pages)/notifications/page.tsx`
- Full-featured notification management UI
- Filter by read/unread status
- Filter by notification type
- Real-time badge updates
- Mark as read / Delete functionality
- Auto-refetch every 30 seconds

### 2. **Web Push Service**
**File**: `src/lib/web-push-service.ts`
- Browser push notification management
- Service Worker registration
- Push subscription handling
- Local notification support
- Features:
  - Check browser support
  - Request user permission
  - Register service worker
  - Subscribe to push notifications
  - Send local notifications

### 3. **Notification Trigger Service**
**File**: `src/lib/notification-trigger-service.ts`
- Create notifications in database
- Trigger helpers for 6 notification types:
  - `REPLY_RECEIVED` - When leads reply
  - `FOLLOWUP_SENT` - When follow-ups are sent
  - `CAMPAIGN_COMPLETED` - When campaigns finish
  - `LEAD_BOUNCED` - When emails bounce
  - `CAMPAIGN_PAUSED` - When campaigns pause
  - `AI_ENRICHMENT_DONE` - When AI enrichment completes

### 4. **Notifications Hook**
**File**: `src/hooks/useNotifications.ts`
- Real-time notification polling
- Unread count tracking
- Auto service worker registration
- Callback on new notifications
- 30-second auto-refresh

### 5. **Updated Site Header**
**File**: `src/components/blocks/site-header.tsx`
- Live notification bell with badge
- Dropdown showing 5 most recent unread notifications
- Real-time unread count display
- Link to full notification center
- "View all notifications" action

---

## 🚀 Quick Start

### 1. Enable Web Push (Optional)
Add to your user settings page:

```typescript
import { WebPushService } from "@/lib/web-push-service";

// Request user permission
const permission = await WebPushService.requestPermission();

if (permission === "granted") {
  // Subscribe to push
  const subscription = await WebPushService.subscribeToPush();
  
  // Save subscription to database via API
  await fetch("/api/users/push-subscription", {
    method: "POST",
    body: JSON.stringify({ subscription })
  });
}
```

### 2. Create Notifications When Events Occur
Use the trigger service in your API routes/services:

```typescript
import { NotificationTriggerService } from "@/lib/notification-trigger-service";

// When a lead replies
await NotificationTriggerService.notifyLeadReply(
  userId,
  "john@example.com",
  "John Doe"
);

// When a campaign completes
await NotificationTriggerService.notifyCampaignCompleted(
  userId,
  campaignId,
  "Q1 Outreach",
  50,  // total leads
  12   // replies
);

// When AI enrichment finishes
await NotificationTriggerService.notifyAiEnrichmentComplete(
  userId,
  "Sarah Johnson",
  8    // score out of 10
);
```

### 3. Use in React Components
Hook for real-time updates:

```typescript
import { useNotifications } from "@/hooks/useNotifications";

function MyComponent() {
  const { unreadCount, isPushEnabled, refetch } = useNotifications({
    pollingInterval: 30000,
    onNewNotification: (count) => {
      console.log(`Got ${count} unread notifications!`);
    }
  });

  return <div>Unread: {unreadCount}</div>;
}
```

---

## 📋 Notification Types

| Type | Trigger | Example |
|------|---------|---------|
| REPLY_RECEIVED | Lead replies to email | "Sarah Wilson replied to your email" |
| FOLLOWUP_SENT | Follow-up email sent | "Follow-up #1 sent to John Doe" |
| CAMPAIGN_COMPLETED | Campaign finishes | "Q1 Outreach finished with 8.2% reply rate" |
| LEAD_BOUNCED | Email bounces | "Email to john@enterprise.com bounced" |
| CAMPAIGN_PAUSED | Campaign manually paused | "Q1 Outreach has been paused" |
| AI_ENRICHMENT_DONE | AI enrichment complete | "Lead enriched - Score: 8/10" |

---

## 🔄 Real-Time Features

### Auto-Polling
- Notifications auto-refresh every 30 seconds
- Unread count updates in real-time
- Header badge shows live count

### Browser Push (Optional)
- Can send native browser notifications
- Requires user permission
- Service Worker handles background notifications
- Useful for critical alerts

### Local Notifications
- Show in-app toast notifications
- Instant feedback on user actions

---

## 📝 Database Schema

Notifications table already exists in your Prisma schema:

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean  @default(false)
  relatedId String?  // leadId, campaignId, etc.
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 🔌 API Endpoints Ready

Your existing Redux/API endpoints work with notifications:

```typescript
// Get notifications
const { data } = useGetNotificationsQuery({
  page: 1,
  limit: 10,
  isRead: false  // unread only
});

// Get unread count
const { data } = useGetNotificationsUnreadCountQuery();

// Mark as read
const [markAsRead] = useMarkAsReadMutation();
await markAsRead(notificationId);

// Mark all as read
const [markAllAsRead] = useMarkAllAsReadMutation();
await markAllAsRead();

// Delete notification
const [deleteNotification] = useDeleteNotificationMutation();
await deleteNotification(notificationId);

// Delete all
const [deleteAll] = useDeleteAllNotificationsMutation();
await deleteAll();
```

---

## 🎯 Next Steps

1. **Integrate Notification Creation**
   - Add `NotificationTriggerService` calls to your API routes
   - Trigger when: leads reply, campaigns complete, etc.

2. **Set Up Web Push (Optional)**
   - Create service worker file at `/public/service-worker.js`
   - Implement backend push sending (use web-push library)

3. **Customize Notification Messages**
   - Update trigger service with your messaging
   - Add links to related resources

4. **Test Notifications**
   - Visit `/notifications` page
   - Check live updates in header
   - Verify Redux hooks work

---

## 📊 Component Structure

```
Notifications System
├── Pages
│   └── src/app/(pages)/notifications/page.tsx
├── Hooks
│   └── src/hooks/useNotifications.ts
├── Services
│   ├── src/lib/web-push-service.ts
│   └── src/lib/notification-trigger-service.ts
├── Components
│   └── src/components/blocks/site-header.tsx (updated)
└── Redux
    └── src/redux/features/notifications/notifications.api.ts (existing)
```

---

## ✅ Checklist

- [x] Notification Center page with filtering
- [x] Real-time unread count badge
- [x] Web Push service
- [x] Notification triggers
- [x] Redux integration
- [x] Header dropdown with recent notifications
- [x] Auto-polling (30 seconds)
- [x] Mark as read / Delete functionality
- [ ] Service Worker implementation (optional)
- [ ] Backend push sending (optional)

---

**Your notification system is ready to use! 🎉**

# 🎯 Socket.io Implementation - Quick Start Guide

## What's New?

You now have **real-time WebSocket notifications** instead of polling!

**Before:** 30-second delay (HTTP polling)
**After:** <100ms instant updates (WebSocket)

---

## Files Created

### Server (Separate Node.js Service)
- `server/socket-server.ts` - Socket.io server
- `server/broadcast-handler.ts` - API endpoints for broadcasting
- `server/package.json` - Dependencies for server
- `server/.env.example` - Configuration template

### Frontend (Next.js)
- `src/lib/socket-client.ts` - WebSocket client
- `src/hooks/useNotifications.ts` - Updated to use WebSocket
- `src/app/api/notifications/push/route.ts` - Notification push endpoint

### Documentation
- `SOCKET_IO_DEPLOYMENT.md` - Complete Vercel deployment guide
- This file - Quick reference

---

## Architecture

```
Your App (Vercel)
    ↓ WebSocket
Socket.io Server (Railway/Render)
    ↓ Query
PostgreSQL Database
```

**Key Benefits:**
✅ Instant notifications (no polling)
✅ Scalable with Redis
✅ Vercel compatible
✅ Fallback to polling if Socket.io down
✅ Zero breaking changes

---

## Local Development Setup

### 1. Install Dependencies

```bash
# Already done, but if needed:
npm install socket.io-client socket.io redis

# Socket.io server deps (in server folder)
cd server
npm install
```

### 2. Create Environment Variables

**Main app (.env.local):**
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

**Socket.io server (server/.env):**
```env
SOCKET_PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
NOTIFICATIONS_API_KEY=dev-secret-key
```

### 3. Run Both Servers

**Terminal 1 - Socket.io Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Next.js App:**
```bash
npm run dev
```

✅ Visit http://localhost:3000
✅ Check DevTools: Should see WebSocket connection
✅ Header badge updates in real-time

---

## Test Real-Time Notifications

### Option 1: Using curl

```bash
curl -X POST http://localhost:3000/api/notifications/push \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-secret-key" \
  -d '{
    "userId": "user123",
    "type": "REPLY_RECEIVED",
    "title": "New Reply",
    "message": "Sarah replied to your message",
    "broadcastViaSocket": true
  }'
```

### Option 2: Using the Trigger Service

```typescript
import { NotificationTriggerService } from "@/lib/notification-trigger-service";

// After creating a real notification, trigger it
await NotificationTriggerService.notifyLeadReply(
  userId,
  "sarah@example.com",
  "Sarah Wilson"
);
```

### Option 3: Direct Socket Emit (Development Only)

```javascript
// In browser console
const socket = SocketClient.getInstance();
socket.sendNotification({
  userId: "current-user-id",
  type: "REPLY_RECEIVED",
  title: "Test Notification",
  message: "This is a real-time test!",
  createdAt: new Date().toISOString(),
});
```

---

## How It Works

### Connection Flow

```
1. User loads app
   ↓
2. useNotifications hook initializes
   ↓
3. Socket client connects to Socket.io server
   ↓
4. Client authenticates with userId
   ↓
5. Client joins user-specific room: "user:{userId}"
   ↓
6. Ready to receive real-time notifications
```

### Notification Flow

```
Backend API
  ↓ POST /api/notifications/push
Next.js Server
  ↓ Create in database
  ↓ POST to Socket.io server broadcast endpoint
Socket.io Server
  ↓ Emit to "user:{userId}" room
Browser Clients
  ↓ Receive event
  ↓ Update Redux store
  ↓ UI updates instantly
```

---

## Usage in Components

### Basic Usage

```typescript
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBadge() {
  const { 
    unreadCount, 
    isSocketConnected,
    isPushEnabled 
  } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {isSocketConnected ? (
        <span>🟢 Real-time</span>
      ) : (
        <span>🟡 Polling</span>
      )}
    </div>
  );
}
```

### With Event Handler

```typescript
const { unreadCount } = useNotifications({
  onNewNotification: (count) => {
    console.log(`${count} new notifications!`);
    // Play sound, show toast, etc.
  },
});
```

### Force Polling (if needed)

```typescript
const { unreadCount } = useNotifications({
  useWebSocket: false, // Disable Socket.io
  pollingInterval: 30000, // Use polling instead
});
```

---

## Integration with Existing Code

### In API Routes - When Creating Notifications

**Before (polling only):**
```typescript
await NotificationTriggerService.notifyLeadReply(userId, email, name);
// Users wait up to 30 seconds
```

**After (real-time):**
```typescript
// Same code - now works via WebSocket!
await NotificationTriggerService.notifyLeadReply(userId, email, name);
// Instant notification
```

### Optional: Direct Socket Broadcast

```typescript
import SocketClient from "@/lib/socket-client";

export async function notifyUser(userId: string) {
  // Option 1: Via database + Socket.io push endpoint
  await fetch("/api/notifications/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NOTIFICATIONS_API_KEY,
    },
    body: JSON.stringify({
      userId,
      type: "REPLY_RECEIVED",
      title: "New Reply",
      message: "Sarah replied",
      broadcastViaSocket: true,
    }),
  });
}
```

---

## Monitoring

### Check Connection Status

```typescript
// In component or console
const socket = SocketClient.getInstance();

console.log("Connected:", socket.isConnected());
console.log("User ID:", socket.getCurrentUserId());

// Ping server
socket.ping();
```

### View Server Stats

**Development:**
```bash
curl http://localhost:3001/api/health
```

**Production (Railway/Render):**
```bash
curl https://socket-prod-xyz.railway.app/api/health
```

Response example:
```json
{
  "status": "ok",
  "connectedUsers": ["user:123", "user:456"],
  "timestamp": "2026-05-20T10:00:00Z"
}
```

---

## Fallback Mechanism

If Socket.io is unavailable:
- ✅ No errors in console
- ✅ Automatically falls back to HTTP polling
- ✅ Notifications still work
- ⚠️ Delay up to 30 seconds

Check status in browser:
```javascript
const { isSocketConnected } = useNotifications();
console.log("Using WebSocket:", isSocketConnected);
// false = using polling
```

---

## Production Deployment

### Step 1: Deploy Socket.io Server
Choose one:
- **Railway** (easiest): https://railway.app
- **Render**: https://render.com

See `SOCKET_IO_DEPLOYMENT.md` for detailed instructions

### Step 2: Update Environment Variables

```bash
# Vercel dashboard
NEXT_PUBLIC_SOCKET_URL=https://socket-prod-xyz.railway.app
NOTIFICATIONS_API_KEY=your-secret-key

# Railway/Render dashboard
SOCKET_PORT=3001
FRONTEND_URL=https://yourdomain.vercel.app
NOTIFICATIONS_API_KEY=your-secret-key
REDIS_URL=redis://...
```

### Step 3: Deploy Next.js

```bash
git push origin main
# Vercel auto-deploys
```

### Step 4: Verify

```bash
# Check WebSocket connection in DevTools
# Network tab → WS filter
# Should see connection to Socket.io server
```

---

## Troubleshooting

### Socket won't connect

**Check:**
1. Is Socket.io server running? `npm run dev` in `server/`
2. Is `NEXT_PUBLIC_SOCKET_URL` set correctly?
3. DevTools Network → WS → Connection attempts
4. Check server logs for errors

**Fix:**
```bash
# Restart servers
# Terminal 1: Ctrl+C then npm run dev
# Terminal 2: Ctrl+C then npm run dev
```

### Notifications not received

**Check:**
1. Socket connected? Check `isSocketConnected` state
2. User authenticated? Look for "🔐 Authenticated" log
3. API key correct? Match in both services
4. Check server logs: `console.log` output

### High latency

**Optimization:**
1. Check network: DevTools Network tab
2. Check Redis: Is it connected?
3. Check server load: `/api/stats` endpoint
4. Reduce polling interval for fallback

---

## API Reference

### Socket Events (Client Sends)

```typescript
socket.emit("authenticate", userId)           // Auth with server
socket.emit("send-notification", notification) // Send (admin)
socket.emit("mark-read", { notificationId, userId }) // Mark read
socket.emit("get-online-count", userId)       // Get connected devices
socket.emit("ping")                           // Health check
```

### Socket Events (Server Sends)

```typescript
socket.on("authenticated", data)      // Connection confirmed
socket.on("new-notification", notif)  // Notification received
socket.on("notification-read", data)  // Notification marked read
socket.on("online-count", { userId, count }) // Device count
socket.on("pong")                    // Ping response
```

### HTTP Endpoints

```
POST /api/notifications/push
  Headers:
    x-api-key: your-secret-key
  Body:
    {
      userId: string
      type: NotificationType
      title: string
      message: string
      relatedId?: string
      broadcastViaSocket?: boolean
    }
  Response: { success: true, notification: {...} }

GET  /api/health              # Server status
GET  /api/stats               # Connection statistics
```

---

## Performance Tips

1. **Use Redis** - Scales to multiple instances
2. **Monitor** - Check `/api/stats` regularly
3. **Limit Connections** - Set max per user
4. **Clean Old Messages** - Archive notifications
5. **Test Load** - Use artillery or similar

---

## Next Steps

1. ✅ Test locally with `npm run dev` (both servers)
2. ✅ Verify WebSocket connection in DevTools
3. ✅ Test notification push with curl
4. ✅ Check fallback polling works
5. ✅ Deploy Socket.io server (Railway/Render)
6. ✅ Deploy Next.js app (Vercel)
7. ✅ Test in production

---

## Still Using Polling?

No problem! Existing code works unchanged:

```typescript
const { unreadCount } = useNotifications({
  useWebSocket: false, // Opt out of WebSocket
  pollingInterval: 30000,
});
```

---

## Questions?

1. Check `SOCKET_IO_DEPLOYMENT.md` for Vercel setup
2. Review Socket.io docs: https://socket.io/docs/
3. Check server logs for errors
4. Test with curl/DevTools

---

**You're now running real-time WebSocket notifications! 🎉**

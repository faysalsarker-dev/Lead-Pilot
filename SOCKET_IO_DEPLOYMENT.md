# 🚀 Socket.io Real-Time Notifications - Vercel Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Browser (Next.js on Vercel)                                 │
│  ├─ React Components                                         │
│  ├─ Redux Store                                              │
│  └─ Socket.io Client                                         │
│        │                                                      │
│        │ WebSocket Connection                                │
│        ↓                                                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Socket.io Server (Separate Node.js Service)            │  │
│  │  ├─ Real-time connections                               │  │
│  │  ├─ Redis Adapter (for scaling)                         │  │
│  │  └─ Broadcast Handler                                   │  │
│  │        ↓                                                  │  │
│  │  PostgreSQL + Prisma                                    │  │
│  │                                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Why This Architecture?

✅ **Vercel Functions are stateless** - Can't maintain WebSocket connections
✅ **Separate Socket.io server** - Handles persistent connections
✅ **Next.js on Vercel** - Handles API routes, frontend, and serves static files
✅ **Redis Adapter** - Scales across multiple Socket.io instances
✅ **Best of both worlds** - Instant notifications + Vercel's easy deployment

---

## Step 1: Deploy Socket.io Server on Railway

### Option A: Using Railway (Recommended for Beginners)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "Create New"
   - Select "Deploy from GitHub repo"
   - Connect to your lead-pilot repository

3. **Configure Project Settings**
   - Select the `server` directory as root
   - Set environment variables in Railway dashboard:

   ```
   SOCKET_PORT=3001
   FRONTEND_URL=https://yourdomain.vercel.app
   REDIS_URL=<Railway PostgreSQL URL or Redis service>
   NOTIFICATIONS_API_KEY=your-secret-key-here
   NODE_ENV=production
   ```

4. **Add Redis for Scaling (Optional but Recommended)**
   - In Railway, add Redis service
   - Railway automatically injects REDIS_URL

5. **Deploy**
   - Railway auto-deploys on every push to main
   - Note the Railway URL (e.g., `https://socket-prod-xyz.railway.app`)

### Option B: Using Render.com

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +"
   - Select "Web Service"
   - Connect repository

3. **Configure**
   - Build command: `npm install --prefix server`
   - Start command: `npm start --prefix server`
   - Set environment variables in Render dashboard
   - Choose Redis add-on for `REDIS_URL`

4. **Deploy**
   - Render automatically deploys
   - Note the service URL

---

## Step 2: Configure Environment Variables

### In Vercel Dashboard (Next.js Frontend)

Go to **Settings → Environment Variables** and add:

```env
# Socket.io Server (from Railway/Render)
NEXT_PUBLIC_SOCKET_URL=https://socket-prod-xyz.railway.app

# API Key (match socket server)
NEXT_PUBLIC_NOTIFICATIONS_API_KEY=your-secret-key-here

# Other existing vars...
DATABASE_URL=...
NEXTAUTH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
# etc.
```

### In Socket.io Server (Railway/Render)

```env
SOCKET_PORT=3001
FRONTEND_URL=https://yourdomain.vercel.app
REDIS_URL=redis://...  # Provided by Railway/Render
NOTIFICATIONS_API_KEY=your-secret-key-here
NODE_ENV=production
```

---

## Step 3: Update Next.js Configuration

### 1. Add Socket.io URL to .env.local

```env
# .env.local (development)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# .env.production (Vercel)
NEXT_PUBLIC_SOCKET_URL=https://socket-prod-xyz.railway.app
```

### 2. Create/Update Environment Variable Script

Create `scripts/update-env.sh`:

```bash
#!/bin/bash
# Update environment variables in Vercel

SOCKET_URL=${1:-http://localhost:3001}

# Add to Vercel (requires Vercel CLI)
vercel env add NEXT_PUBLIC_SOCKET_URL $SOCKET_URL
```

---

## Step 4: Enable Socket.io in Your App

### 1. Update useNotifications Hook Usage

```typescript
import { useNotifications } from "@/hooks/useNotifications";

export function Dashboard() {
  const { 
    unreadCount, 
    isSocketConnected,  // NEW!
    isPushEnabled 
  } = useNotifications({
    useWebSocket: true,  // Enable Socket.io
    pollingInterval: 30000, // Fallback polling
  });

  return (
    <div>
      {isSocketConnected ? (
        <span className="text-green-600">🟢 Real-time</span>
      ) : (
        <span className="text-yellow-600">🟡 Polling (fallback)</span>
      )}
      <p>Unread: {unreadCount}</p>
    </div>
  );
}
```

### 2. Test Connection

Visit your app and check:
- Browser DevTools → Network → WS (WebSocket connections)
- Should see connection to `wss://socket-prod-xyz.railway.app/socket.io/`

---

## Step 5: Trigger Notifications via API

### Using the Push Endpoint

```typescript
// In your backend API route
export async function POST(req: Request) {
  // After creating a notification in database
  
  await fetch(`${process.env.API_URL}/api/notifications/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NOTIFICATIONS_API_KEY,
    },
    body: JSON.stringify({
      userId: "user123",
      type: "REPLY_RECEIVED",
      title: "New Reply",
      message: "Sarah replied to your message",
      relatedId: "lead123",
      broadcastViaSocket: true, // Push via Socket.io
    }),
  });
}
```

---

## Step 6: Test the Setup

### 1. Test Local Development

```bash
# Terminal 1: Socket.io Server
cd server
npm install
npm run dev

# Terminal 2: Next.js App
npm run dev
```

- Open http://localhost:3000
- DevTools Console → Should see "✅ Socket connected"
- Header badge should update in real-time

### 2. Test Production on Vercel

```bash
vercel deploy --prod
```

- Check Vercel deployment
- Open your site
- DevTools Console → Should show connection to Socket.io server
- Test with curl:

```bash
curl -X POST https://yourdomain.vercel.app/api/notifications/push \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-key" \
  -d '{
    "userId": "user123",
    "type": "REPLY_RECEIVED",
    "title": "Test",
    "message": "This is a test notification",
    "broadcastViaSocket": true
  }'
```

---

## Step 7: Monitor & Debug

### Check Socket.io Server Status

```bash
# Via Railway/Render dashboard
# Look for active connections

# Or call health endpoint
curl https://socket-prod-xyz.railway.app/api/health

# Response:
# {
#   "status": "ok",
#   "connectedUsers": ["user:123", "user:456"],
#   "timestamp": "2026-05-20T10:00:00Z"
# }
```

### Monitor Connections

```bash
# Get server stats
curl https://socket-prod-xyz.railway.app/api/stats

# Response:
# {
#   "connectedClients": 5,
#   "rooms": 3,
#   "namespaces": 1,
#   "uptime": 3600
# }
```

### Debugging

1. **Check Browser Console**
   - Look for WebSocket connection logs
   - Check for errors

2. **Check Vercel Logs**
   ```bash
   vercel logs
   ```

3. **Check Railway/Render Logs**
   - Go to deployment dashboard
   - Check service logs

4. **Test Connectivity**
   ```javascript
   // In browser console
   const socket = SocketClient.getInstance();
   socket.ping(); // Should see "pong" response
   ```

---

## Fallback to Polling

If Socket.io is unavailable, the system automatically falls back to HTTP polling every 30 seconds. This ensures:

- ✅ Notifications still work
- ✅ No errors or broken UI
- ✅ Graceful degradation
- ⚠️  Slight delay (up to 30 seconds)

To force polling (for testing):

```typescript
const { unreadCount } = useNotifications({
  useWebSocket: false, // Disable Socket.io
});
```

---

## Production Checklist

- [ ] Socket.io server deployed on Railway/Render
- [ ] Redis configured for scaling
- [ ] Environment variables set in all services
- [ ] Frontend URL configured in Socket.io server
- [ ] API key set and matches across services
- [ ] CORS configured correctly
- [ ] WebSocket connections tested
- [ ] Notifications tested end-to-end
- [ ] Fallback polling verified
- [ ] Error logging in place
- [ ] Monitoring/alerts set up

---

## Troubleshooting

### Issue: WebSocket Connection Fails

**Error:** `ERR_NAME_RESOLUTION_FAILED`

**Solution:**
- Check `NEXT_PUBLIC_SOCKET_URL` is correct
- Verify Socket.io server is running
- Check CORS in Socket.io server

### Issue: Notifications Not Received

**Check:**
1. Is Socket.io connected? (DevTools → Network → WS)
2. Is API key correct in both services?
3. Check server logs for errors
4. Verify Redis connection (if using)

### Issue: High Memory Usage

**Solution:**
- Enable Redis adapter
- Limit socket connection pool
- Monitor with Railway/Render dashboards

### Issue: CORS Errors

**Fix in Socket.io server config:**
```typescript
cors: {
  origin: "https://yourdomain.vercel.app",
  credentials: true,
}
```

---

## Performance Tips

1. **Use Redis Adapter**
   - Scales to multiple Socket.io instances
   - Recommended for production

2. **Enable Compression**
   - Reduces bandwidth
   - Enable in Socket.io config

3. **Monitor Connections**
   - Use `/api/stats` endpoint
   - Set up alerts for connection spikes

4. **Implement Reconnection Logic**
   - Already built into Socket.io client
   - Exponential backoff with max retries

5. **Test Load**
   ```bash
   # Using artillery for load testing
   npm install -g artillery
   artillery quick --count 100 --num 10 https://socket-prod-xyz.railway.app
   ```

---

## Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| Vercel (Next.js) | $0-20/month | Free tier available |
| Railway (Socket.io) | $5-50/month | Includes 5GB RAM, 5000 connection hours free |
| Redis (Railway add-on) | $7/month | For scaling |
| **Total** | **$12-77/month** | Scales with usage |

---

## Migration from Polling to WebSocket

Existing code already supports both:

```typescript
// Before: Pure polling
const { unreadCount } = useNotifications();

// After: WebSocket with fallback (same code works!)
const { unreadCount, isSocketConnected } = useNotifications({
  useWebSocket: true,
});
```

No breaking changes! Gradual rollout possible.

---

## Next Steps

1. ✅ Choose hosting: Railway or Render
2. ✅ Deploy Socket.io server
3. ✅ Set environment variables
4. ✅ Test locally
5. ✅ Deploy to Vercel
6. ✅ Monitor and optimize

---

## Support Resources

- **Socket.io Docs**: https://socket.io/docs/
- **Railway Docs**: https://docs.railway.app/
- **Render Docs**: https://render.com/docs/
- **Vercel Docs**: https://vercel.com/docs

---

**Your real-time notification system is now live on Vercel! 🎉**

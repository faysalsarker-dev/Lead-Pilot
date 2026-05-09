# Lead Pilot REST API

Complete REST API for Lead Pilot backend system.

## Quick Start

### 1. Environment Setup
```bash
# .env.local
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/lead-pilot
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Test API
```bash
curl -X GET http://localhost:3000/api/leads
```

---

## Resources

### 📖 Complete Documentation
- **[API Documentation](./API_DOCUMENTATION.md)** - All endpoints with curl examples
- **[Quick Reference](../API_QUICK_REFERENCE.md)** - Fast endpoint lookup
- **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)** - Route handler patterns
- **[Client Integration](./CLIENT_INTEGRATION.md)** - React/Redux integration
- **[Project Summary](../PROJECT_SUMMARY.md)** - Complete architecture overview

### 🎯 API Endpoints

**Users** (3 endpoints)
- `GET /users` - Get profile
- `PUT /users` - Update profile  
- `GET /users/settings` - Get settings
- `PUT /users/settings` - Update settings
- `GET /users/unread-count` - Unread count

**Leads** (3 routes)
- `GET /leads` - List with pagination & filters
- `POST /leads` - Create lead
- `GET/PUT/DELETE /leads/:id` - Individual operations
- `POST /leads/bulk/create` - Bulk import

**Campaigns** (5 routes)
- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create
- `GET/PUT/DELETE /campaigns/:id` - Individual
- `POST /campaigns/:id/launch` - Launch
- `POST /campaigns/:id/pause` - Pause
- `POST /campaigns/:id/resume` - Resume

**Templates** (3 routes)
- `GET /templates` - List templates
- `POST /templates` - Create
- `GET/PUT/DELETE /templates/:id` - Individual
- `POST /templates/:id/duplicate` - Duplicate

**Mailboxes** (4 routes)
- `GET /mailboxes` - List mailboxes
- `POST /mailboxes` - Create
- `GET /mailboxes/default` - Get default
- `GET/PUT/DELETE /mailboxes/:id` - Individual
- `POST /mailboxes/:id/set-default` - Set default

**Conversations** (2 routes)
- `GET /conversations/:leadId` - Get thread
- `POST /conversations/:leadId/messages` - Add message

**Replies** (3 routes)
- `GET /replies` - List
- `POST /replies` - Create
- `GET/PUT/DELETE /replies/:id` - Individual
- `POST /replies/:id/mark-as-read` - Mark read

**Notifications** (4 routes)
- `GET /notifications` - List
- `GET /notifications/:id` - Detail
- `POST /notifications/:id/mark-as-read` - Mark read
- `POST /notifications/mark-all-as-read` - Mark all
- `DELETE /notifications/:id` - Delete

**Email Queue** (5 routes)
- `GET /email-queue` - List
- `GET /email-queue/stats` - Statistics
- `GET /email-queue/:id` - Detail
- `POST /email-queue/:id/mark-as-sent` - Mark sent
- `POST /email-queue/:id/mark-as-failed` - Mark failed

---

## Architecture

### Layered Pattern

```
API Routes (Next.js)
    ↓
Controllers (Validation)
    ↓
Services (Business Logic)
    ↓
Repositories (Data Access)
    ↓
Prisma (ORM)
    ↓
PostgreSQL
```

### Request Flow

1. **HTTP Request** → API Route Handler
2. **Parse & Validate** → Extract user, validate inputs
3. **Call Service** → Business logic execution
4. **Data Access** → Repository queries with Prisma
5. **Response** → Formatted JSON response

---

## Response Format

### Success (200, 201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* entity or array */ },
  "pagination": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```

### Error (400, 401, 404, 500)
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "errors": { "field": ["error message"] }
}
```

---

## Authentication

All endpoints require NextAuth session. Session is automatically included in requests from Next.js client components.

For external API calls, tokens coming soon.

---

## Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | GET succeeded |
| 201 | Created | POST created resource |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/conflict |
| 500 | Server Error | Internal error |

---

## Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?status=ACTIVE&search=john&isInterested=true
```

### Sorting (coming soon)
```
?sortBy=createdAt&sortOrder=DESC
```

---

## Examples

### Get Leads
```bash
curl -X GET "http://localhost:3000/api/leads?page=1&limit=10"
```

### Create Lead
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "businessName": "ACME Corp"
  }'
```

### Launch Campaign
```bash
curl -X POST http://localhost:3000/api/campaigns/campaign_123/launch
```

### Bulk Create Leads
```bash
curl -X POST http://localhost:3000/api/leads/bulk/create \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [
      {"name": "Lead 1", "email": "lead1@example.com"},
      {"name": "Lead 2", "email": "lead2@example.com"}
    ]
  }'
```

---

## Data Models

### User
- id, email, name, autoEnrich, defaultSendWindow, timezone

### Lead
- id, name, email, businessName, businessType, website, country, timezone
- status (NEW, CONTACTED, ACTIVE, INTERESTED, CONVERTED, REJECTED)
- isActive, isInterested, aiScore, notes

### Campaign
- id, name, mailboxId, status (DRAFT, RUNNING, PAUSED, COMPLETED)
- initialTemplateId, followup1TemplateId, followup2TemplateId, finalTemplateId
- sendWindow, leadIds

### Template
- id, name, type (INITIAL, FOLLOWUP_1, FOLLOWUP_2, FINAL)
- subjectA, subjectB, body

### Mailbox
- id, label, type (GMAIL_OAUTH, CUSTOM_SMTP)
- isActive, isDefault

### Conversation
- id, leadId, messages array

### Reply
- id, leadId, mailboxId, fromEmail, subject, body
- isRead, receivedAt

### Notification
- id, userId, type, message, isRead, leadId

### EmailQueue
- id, campaignId, leadId, mailboxId, toEmail, subject, body
- status (PENDING, SENT, FAILED, CANCELLED)
- sentAt, failReason

---

## Development

### View Backend Code
- **Services**: `/src/backend/services/` - Business logic
- **Repositories**: `/src/backend/repositories/` - Data access
- **Validators**: `/src/backend/validators/` - Input validation
- **Middleware**: `/src/backend/middleware/` - Error handling, auth
- **Utils**: `/src/backend/utils/` - Helper functions

### View API Routes
- **Route Files**: `/src/app/api/[resource]/route.ts` - HTTP handlers
- **Structure**: Follows Next.js App Router conventions

### Run Tests
```bash
npm run test
```

### Lint Code
```bash
npm run lint
```

---

## Common Tasks

### Test an Endpoint
Use Postman, Insomnia, or curl. See [API Documentation](./API_DOCUMENTATION.md) for examples.

### Implement a Route
Follow patterns in [Implementation Guide](./IMPLEMENTATION_GUIDE.md).

### Add Request Validation
Use Zod validators from `/src/backend/validators/`.

### Handle Errors
Use error classes from `/src/backend/middleware/errors.ts`.

### Format Response
Use helpers from `/src/backend/middleware/response-handler.ts`.

---

## Performance

### Pagination
- Default: page=1, limit=10
- Max limit: 100
- All list endpoints support pagination

### Caching
Client should implement:
- React Query (recommended)
- SWR
- Redux

### Rate Limiting
Coming soon. Default: unlimited.

---

## Security

- ✅ Authentication via NextAuth
- ✅ Input validation with Zod
- ✅ CORS configured
- ⏳ Rate limiting (coming)
- ⏳ API tokens (coming)

---

## Troubleshooting

**"Unauthorized" error**
- Ensure user is logged in
- Check NextAuth session is valid

**"Validation error" on POST**
- Check request body matches schema
- Verify required fields present

**"Not found" error**
- Verify resource ID is correct
- Check resource belongs to user

**Database connection error**
- Check DATABASE_URL env var
- Verify PostgreSQL running
- Check credentials

---

## Monitoring & Debugging

### Enable Logging
```typescript
// Already setup in middleware/logger.ts
console.log({ context: 'endpoint', error, userId });
```

### Database Inspector
```bash
npx prisma studio
```

### API Response Logging
All endpoints log request/response in development mode.

---

## Deployment

### Production Checklist
- [ ] All env vars configured
- [ ] Database migrations run
- [ ] Error tracking setup (Sentry)
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Security audit passed

### Deploy to Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
# View at https://your-app.vercel.app/api/leads
```

---

## Support

- **API Docs**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Quick Ref**: [../API_QUICK_REFERENCE.md](../API_QUICK_REFERENCE.md)
- **Integration**: [CLIENT_INTEGRATION.md](./CLIENT_INTEGRATION.md)
- **Implementation**: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Summary**: [../PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)

---

## License

MIT

---

## Version

**API Version**: 1.0-draft  
**Last Updated**: 2026-05-01  
**Status**: ✅ Architecture Complete | ⏳ Implementation In Progress

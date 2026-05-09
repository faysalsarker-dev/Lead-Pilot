# API Quick Reference

Fast lookup for all REST API endpoints.

## Endpoint Summary Table

| Resource | Method | Path | Purpose |
|----------|--------|------|---------|
| **USERS** |
| | GET | `/users` | Get user profile |
| | PUT | `/users` | Update user profile |
| | GET | `/users/settings` | Get settings |
| | PUT | `/users/settings` | Update settings |
| | GET | `/users/unread-count` | Get unread notifications count |
| **LEADS** |
| | GET | `/leads` | List leads (paginated) |
| | POST | `/leads` | Create single lead |
| | GET | `/leads/:id` | Get lead detail |
| | PUT | `/leads/:id` | Update lead |
| | DELETE | `/leads/:id` | Delete lead |
| | POST | `/leads/bulk/create` | Bulk create leads |
| **CAMPAIGNS** |
| | GET | `/campaigns` | List campaigns (paginated) |
| | POST | `/campaigns` | Create campaign |
| | GET | `/campaigns/:id` | Get campaign detail |
| | PUT | `/campaigns/:id` | Update campaign |
| | DELETE | `/campaigns/:id` | Delete campaign |
| | POST | `/campaigns/:id/launch` | Launch campaign |
| | POST | `/campaigns/:id/pause` | Pause campaign |
| | POST | `/campaigns/:id/resume` | Resume campaign |
| **TEMPLATES** |
| | GET | `/templates` | List templates (paginated) |
| | POST | `/templates` | Create template |
| | GET | `/templates/:id` | Get template detail |
| | PUT | `/templates/:id` | Update template |
| | DELETE | `/templates/:id` | Delete template |
| | POST | `/templates/:id/duplicate` | Duplicate template |
| **MAILBOXES** |
| | GET | `/mailboxes` | List mailboxes (paginated) |
| | POST | `/mailboxes` | Create mailbox |
| | GET | `/mailboxes/:id` | Get mailbox detail |
| | PUT | `/mailboxes/:id` | Update mailbox |
| | DELETE | `/mailboxes/:id` | Delete mailbox |
| | GET | `/mailboxes/default` | Get default mailbox |
| | POST | `/mailboxes/:id/set-default` | Set as default |
| **CONVERSATIONS** |
| | GET | `/conversations/:leadId` | Get conversation |
| | POST | `/conversations/:leadId/messages` | Add message |
| **REPLIES** |
| | GET | `/replies` | List replies (paginated) |
| | POST | `/replies` | Create reply |
| | GET | `/replies/:id` | Get reply detail |
| | PUT | `/replies/:id` | Update reply |
| | DELETE | `/replies/:id` | Delete reply |
| | POST | `/replies/:id/mark-as-read` | Mark as read |
| **NOTIFICATIONS** |
| | GET | `/notifications` | List notifications (paginated) |
| | POST | `/notifications` | Create notification |
| | GET | `/notifications/:id` | Get notification |
| | DELETE | `/notifications/:id` | Delete notification |
| | POST | `/notifications/:id/mark-as-read` | Mark as read |
| | POST | `/notifications/mark-all-as-read` | Mark all as read |
| **EMAIL QUEUE** |
| | GET | `/email-queue` | List emails (paginated) |
| | GET | `/email-queue/stats` | Get queue stats |
| | GET | `/email-queue/:id` | Get email detail |
| | POST | `/email-queue/:id/mark-as-sent` | Mark as sent |
| | POST | `/email-queue/:id/mark-as-failed` | Mark as failed |

## Common Query Parameters

### Pagination
```
page=1&limit=10
```

### Filtering
```
status=ACTIVE&isInterested=true&search=john
```

### Sorting (coming soon)
```
sortBy=createdAt&sortOrder=DESC
```

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful GET/PUT/DELETE |
| 201 | Created - Successful POST |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Need authentication |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate/conflict error |
| 500 | Server Error |

## Request/Response Examples

### GET List with Pagination
```
GET /leads?page=1&limit=10

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### POST Create
```
POST /leads
Body: {
  "name": "John",
  "email": "john@example.com"
}

Response:
{
  "success": true,
  "statusCode": 201,
  "message": "Lead created successfully",
  "data": { id, name, email, ... }
}
```

### Error Response
```
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "errors": {
    "email": ["Invalid email format"]
  }
}
```

## Resource Attributes

### User
- `id`, `email`, `name`, `autoEnrich`, `defaultSendWindow`

### Lead
- `id`, `name`, `email`, `businessName`, `businessType`, `website`, `country`, `timezone`, `status`, `isActive`, `isInterested`, `aiScore`, `notes`, `createdAt`, `updatedAt`

### Campaign
- `id`, `name`, `mailboxId`, `initialTemplateId`, `followup1TemplateId`, `followup2TemplateId`, `finalTemplateId`, `status`, `sendWindow`, `leadIds`, `createdAt`, `updatedAt`

### Template
- `id`, `name`, `type` (INITIAL|FOLLOWUP_1|FOLLOWUP_2|FINAL), `subjectA`, `subjectB`, `body`, `createdAt`, `updatedAt`

### Mailbox
- `id`, `label`, `type` (GMAIL_OAUTH|CUSTOM_SMTP), `isActive`, `isDefault`, `createdAt`, `updatedAt`

### Conversation
- `id`, `leadId`, `messages` (array of message objects)

### Reply
- `id`, `leadId`, `mailboxId`, `fromEmail`, `subject`, `body`, `isRead`, `receivedAt`, `createdAt`

### Notification
- `id`, `userId`, `type`, `message`, `isRead`, `leadId`, `createdAt`

### EmailQueue
- `id`, `campaignId`, `leadId`, `mailboxId`, `toEmail`, `subject`, `body`, `status`, `sentAt`, `failReason`

## Filter Options

### Lead Status
- NEW, CONTACTED, ACTIVE, INTERESTED, CONVERTED, REJECTED

### Campaign Status
- DRAFT, RUNNING, PAUSED, COMPLETED

### Template Type
- INITIAL, FOLLOWUP_1, FOLLOWUP_2, FINAL

### Mailbox Type
- GMAIL_OAUTH, CUSTOM_SMTP

### Notification Type
- REPLY_RECEIVED, FOLLOWUP_SENT, CAMPAIGN_COMPLETED, LEAD_BOUNCED, CAMPAIGN_PAUSED, AI_ENRICHMENT_DONE

### EmailQueue Status
- PENDING, SENT, FAILED, CANCELLED

## Usage Patterns

### Fetch and List
```bash
# List with pagination
GET /leads?page=1&limit=10

# Filter
GET /leads?status=ACTIVE&isInterested=true

# Search
GET /leads?search=john
```

### Create and Launch Campaign
```bash
# 1. Create template
POST /templates

# 2. Create campaign
POST /campaigns

# 3. Launch campaign
POST /campaigns/{id}/launch
```

### Handle Lead Reply
```bash
# 1. Create reply
POST /replies

# 2. Create notification
POST /notifications

# 3. Update lead status
PUT /leads/{id}
```

### Manage Mailboxes
```bash
# List mailboxes
GET /mailboxes

# Create mailbox
POST /mailboxes

# Set as default
POST /mailboxes/{id}/set-default
```

## Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `Invalid email format` | Email validation failed | Use valid email format |
| `Lead not found` | Lead ID doesn't exist | Check lead ID |
| `Campaign is not in DRAFT status` | Can't modify running campaign | Pause campaign first |
| `Mailbox not found` | Mailbox ID doesn't exist | Create or get valid mailbox ID |
| `Unauthorized` | Not authenticated | Login first |
| `Forbidden` | Don't have permission | Check user access |

## Authentication

All endpoints require authentication via NextAuth session.

Session is automatically included in requests from Next.js client components.

For API calls from external services, use API tokens (coming soon).

## Rate Limits

Coming soon. Currently no limits.

## Webhooks

Email received webhook available at: `/api/webhooks/email-received`

Payload structure:
```json
{
  "fromEmail": "lead@example.com",
  "toEmail": "user@mailbox.com",
  "subject": "RE: Your message",
  "body": "Thanks for reaching out",
  "receivedAt": "2026-05-01T11:30:00Z"
}
```

## Versioning

Current API version: v1

All endpoints are at `/api/` (v1)

Future versions will be at `/api/v2/`, etc.

## Testing

Use Postman, Insomnia, or cURL for testing:

```bash
# Example: Create lead
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "businessName": "ACME"
  }'
```

## Pagination Defaults

- Default page: 1
- Default limit: 10
- Max limit: 100

## CORS

CORS is enabled for local development.

For production, configure allowed origins in environment variables.

## Caching

Resources are not cached by default. Client should implement caching using:
- React Query
- SWR
- Redux

## Support

See [API Documentation](./API_DOCUMENTATION.md) for detailed endpoint docs.

See [Backend README](../backend/README.md) for architecture details.

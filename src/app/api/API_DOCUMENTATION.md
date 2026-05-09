# REST API Documentation

Complete REST API endpoints for Lead Pilot backend.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require authentication. Pass your NextAuth session token in the request headers.

---

## User Endpoints

### Get User Profile
**GET** `/users`
```bash
curl -X GET http://localhost:3000/api/users
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "autoEnrich": true,
    "defaultSendWindow": "09:00-11:00"
  }
}
```

### Update User Profile
**PUT** `/users`
```bash
curl -X PUT http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "yourService": "Web Development"
  }'
```

### Get User Settings
**GET** `/users/settings`
```bash
curl -X GET http://localhost:3000/api/users/settings
```

### Update User Settings
**PUT** `/users/settings`
```bash
curl -X PUT http://localhost:3000/api/users/settings \
  -H "Content-Type: application/json" \
  -d '{
    "autoEnrich": false,
    "defaultSendWindow": "10:00-12:00",
    "webPushEnabled": true
  }'
```

### Get Unread Notifications Count
**GET** `/users/unread-count`
```bash
curl -X GET http://localhost:3000/api/users/unread-count
```

---

## Lead Endpoints

### List Leads (with Pagination & Filtering)
**GET** `/leads`
```bash
curl -X GET "http://localhost:3000/api/leads?page=1&limit=10&status=ACTIVE&search=john"
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name, email, or business
- `status` - Filter by status (NEW, CONTACTED, ACTIVE, INTERESTED, CONVERTED, REJECTED)
- `isActive` - Filter by active status (true/false)
- `isInterested` - Filter by interested status (true/false)
- `aiEnriched` - Filter by enrichment status (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [
    {
      "id": "lead_1",
      "name": "John Doe",
      "email": "john@example.com",
      "businessName": "ACME Corp",
      "status": "ACTIVE",
      "isInterested": true,
      "aiScore": 8
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Get Single Lead
**GET** `/leads/:id`
```bash
curl -X GET http://localhost:3000/api/leads/lead_123
```

### Create Lead
**POST** `/leads`
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "businessName": "ACME Corp",
    "businessType": "SaaS",
    "website": "https://acme.com",
    "country": "USA",
    "timezone": "America/New_York",
    "notes": "Initial contact"
  }'
```

### Update Lead
**PUT** `/leads/:id`
```bash
curl -X PUT http://localhost:3000/api/leads/lead_123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INTERESTED",
    "isInterested": true,
    "notes": "Updated notes"
  }'
```

### Delete Lead
**DELETE** `/leads/:id`
```bash
curl -X DELETE http://localhost:3000/api/leads/lead_123
```

### Bulk Create Leads
**POST** `/leads/bulk/create`
```bash
curl -X POST http://localhost:3000/api/leads/bulk/create \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [
      {
        "name": "Lead 1",
        "email": "lead1@example.com",
        "businessName": "Company 1"
      },
      {
        "name": "Lead 2",
        "email": "lead2@example.com",
        "businessName": "Company 2"
      }
    ]
  }'
```

---

## Campaign Endpoints

### List Campaigns
**GET** `/campaigns`
```bash
curl -X GET "http://localhost:3000/api/campaigns?page=1&limit=10&status=RUNNING"
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (DRAFT, RUNNING, PAUSED, COMPLETED)
- `mailboxId` - Filter by mailbox

### Get Single Campaign
**GET** `/campaigns/:id`
```bash
curl -X GET http://localhost:3000/api/campaigns/campaign_123
```

### Create Campaign
**POST** `/campaigns`
```bash
curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q2 Outreach",
    "mailboxId": "mailbox_123",
    "initialTemplateId": "template_1",
    "followup1TemplateId": "template_2",
    "followup1Days": 3,
    "followup2Days": 5,
    "finalDays": 7,
    "sendWindow": "09:00-11:00",
    "leadIds": ["lead_1", "lead_2"]
  }'
```

### Update Campaign
**PUT** `/campaigns/:id`
```bash
curl -X PUT http://localhost:3000/api/campaigns/campaign_123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Campaign Name",
    "followup1Days": 4
  }'
```

### Delete Campaign
**DELETE** `/campaigns/:id`
```bash
curl -X DELETE http://localhost:3000/api/campaigns/campaign_123
```

### Launch Campaign
**POST** `/campaigns/:id/launch`
```bash
curl -X POST http://localhost:3000/api/campaigns/campaign_123/launch
```

### Pause Campaign
**POST** `/campaigns/:id/pause`
```bash
curl -X POST http://localhost:3000/api/campaigns/campaign_123/pause
```

### Resume Campaign
**POST** `/campaigns/:id/resume`
```bash
curl -X POST http://localhost:3000/api/campaigns/campaign_123/resume
```

---

## Template Endpoints

### List Templates
**GET** `/templates`
```bash
curl -X GET "http://localhost:3000/api/templates?page=1&limit=10&type=INITIAL"
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Filter by type (INITIAL, FOLLOWUP_1, FOLLOWUP_2, FINAL)

### Get Single Template
**GET** `/templates/:id`
```bash
curl -X GET http://localhost:3000/api/templates/template_123
```

### Create Template
**POST** `/templates`
```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Initial Outreach",
    "type": "INITIAL",
    "subjectA": "Quick question about {{business}}",
    "subjectB": "I think {{name}} would benefit from our service",
    "body": "Hi {{name}},\n\nI noticed {{businessName}} specializes in {{businessType}}..."
  }'
```

### Update Template
**PUT** `/templates/:id`
```bash
curl -X PUT http://localhost:3000/api/templates/template_123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Template Name",
    "body": "Updated body..."
  }'
```

### Delete Template
**DELETE** `/templates/:id`
```bash
curl -X DELETE http://localhost:3000/api/templates/template_123
```

### Duplicate Template
**POST** `/templates/:id/duplicate`
```bash
curl -X POST http://localhost:3000/api/templates/template_123/duplicate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate Template Name"
  }'
```

---

## Mailbox Endpoints

### List Mailboxes
**GET** `/mailboxes`
```bash
curl -X GET "http://localhost:3000/api/mailboxes?page=1&limit=10"
```

### Get Single Mailbox
**GET** `/mailboxes/:id`
```bash
curl -X GET http://localhost:3000/api/mailboxes/mailbox_123
```

### Get Default Mailbox
**GET** `/mailboxes/default`
```bash
curl -X GET http://localhost:3000/api/mailboxes/default
```

### Create Mailbox
**POST** `/mailboxes`
```bash
curl -X POST http://localhost:3000/api/mailboxes \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Main Outreach",
    "type": "GMAIL_OAUTH",
    "gmailRefreshToken": "refresh_token_here",
    "isDefault": true
  }'
```

Or for Custom SMTP:
```bash
curl -X POST http://localhost:3000/api/mailboxes \
  -H "Content-Type: application/json" \
  -d '{
    "label": "SMTP Mail",
    "type": "CUSTOM_SMTP",
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "smtpUser": "user@example.com",
    "smtpPassEnc": "encrypted_password"
  }'
```

### Update Mailbox
**PUT** `/mailboxes/:id`
```bash
curl -X PUT http://localhost:3000/api/mailboxes/mailbox_123 \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Updated Label",
    "isActive": true
  }'
```

### Delete Mailbox
**DELETE** `/mailboxes/:id`
```bash
curl -X DELETE http://localhost:3000/api/mailboxes/mailbox_123
```

### Set Default Mailbox
**POST** `/mailboxes/:id/set-default`
```bash
curl -X POST http://localhost:3000/api/mailboxes/mailbox_123/set-default
```

---

## Conversation Endpoints

### Get Conversation by Lead
**GET** `/conversations/:leadId`
```bash
curl -X GET http://localhost:3000/api/conversations/lead_123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_123",
    "leadId": "lead_123",
    "messages": [
      {
        "role": "user",
        "body": "Hi John, ...",
        "subject": "Initial outreach",
        "sentAt": "2026-05-01T10:00:00Z"
      },
      {
        "role": "lead",
        "body": "Thanks for reaching out...",
        "subject": "RE: Initial outreach",
        "sentAt": "2026-05-01T11:30:00Z"
      }
    ]
  }
}
```

### Add Message to Conversation
**POST** `/conversations/:leadId/messages`
```bash
curl -X POST http://localhost:3000/api/conversations/lead_123/messages \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "body": "Follow-up message...",
    "subject": "RE: Initial outreach"
  }'
```

---

## Reply Endpoints

### List Replies
**GET** `/replies`
```bash
curl -X GET "http://localhost:3000/api/replies?leadId=lead_123&page=1&limit=10"
```

Or by mailbox:
```bash
curl -X GET "http://localhost:3000/api/replies?mailboxId=mailbox_123&page=1&limit=10"
```

### Get Single Reply
**GET** `/replies/:id`
```bash
curl -X GET http://localhost:3000/api/replies/reply_123
```

### Create Reply (from webhook or IMAP sync)
**POST** `/replies`
```bash
curl -X POST http://localhost:3000/api/replies \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "lead_123",
    "mailboxId": "mailbox_123",
    "fromEmail": "john@example.com",
    "subject": "RE: Your outreach",
    "body": "Thanks for reaching out...",
    "receivedAt": "2026-05-01T11:30:00Z"
  }'
```

### Update Reply
**PUT** `/replies/:id`
```bash
curl -X PUT http://localhost:3000/api/replies/reply_123 \
  -H "Content-Type: application/json" \
  -d '{
    "isRead": true
  }'
```

### Mark Reply as Read
**POST** `/replies/:id/mark-as-read`
```bash
curl -X POST http://localhost:3000/api/replies/reply_123/mark-as-read
```

### Delete Reply
**DELETE** `/replies/:id`
```bash
curl -X DELETE http://localhost:3000/api/replies/reply_123
```

---

## Notification Endpoints

### List Notifications
**GET** `/notifications`
```bash
curl -X GET "http://localhost:3000/api/notifications?page=1&limit=10&unreadOnly=false"
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `unreadOnly` - Show only unread (true/false)

### Get Single Notification
**GET** `/notifications/:id`
```bash
curl -X GET http://localhost:3000/api/notifications/notif_123
```

### Create Notification
**POST** `/notifications`
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "lead_123",
    "type": "REPLY_RECEIVED",
    "message": "Reply received from John Doe"
  }'
```

### Update Notification
**PUT** `/notifications/:id`
```bash
curl -X PUT http://localhost:3000/api/notifications/notif_123 \
  -H "Content-Type: application/json" \
  -d '{
    "isRead": true
  }'
```

### Mark Notification as Read
**POST** `/notifications/:id/mark-as-read`
```bash
curl -X POST http://localhost:3000/api/notifications/notif_123/mark-as-read
```

### Mark All Notifications as Read
**POST** `/notifications/mark-all-as-read`
```bash
curl -X POST http://localhost:3000/api/notifications/mark-all-as-read
```

### Delete Notification
**DELETE** `/notifications/:id`
```bash
curl -X DELETE http://localhost:3000/api/notifications/notif_123
```

---

## Email Queue Endpoints

### List Email Queue Items
**GET** `/email-queue`
```bash
curl -X GET "http://localhost:3000/api/email-queue?campaignId=campaign_123&page=1&limit=10"
```

Or get only pending:
```bash
curl -X GET "http://localhost:3000/api/email-queue?pendingOnly=true"
```

### Get Queue Statistics
**GET** `/email-queue/stats`
```bash
curl -X GET http://localhost:3000/api/email-queue/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pending": 125,
    "sent": 340,
    "failed": 5,
    "cancelled": 12,
    "total": 482
  }
}
```

### Get Single Email Queue Item
**GET** `/email-queue/:id`
```bash
curl -X GET http://localhost:3000/api/email-queue/email_123
```

### Mark Email as Sent
**POST** `/email-queue/:id/mark-as-sent`
```bash
curl -X POST http://localhost:3000/api/email-queue/email_123/mark-as-sent
```

### Mark Email as Failed
**POST** `/email-queue/:id/mark-as-failed`
```bash
curl -X POST http://localhost:3000/api/email-queue/email_123/mark-as-failed \
  -H "Content-Type: application/json" \
  -d '{
    "failReason": "SMTP connection timeout"
  }'
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* entity data */ },
  "statusCode": 200
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": [ /* array of items */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Invalid input",
  "statusCode": 400,
  "errors": {
    "email": ["Invalid email format"],
    "name": ["Name is required"]
  }
}
```

---

## HTTP Status Codes

- `200` - OK (successful GET, PUT, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (permission denied)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate/conflict error)
- `500` - Internal Server Error

---

## Error Codes

- `ValidationError` - Input validation failed
- `NotFoundError` - Resource not found
- `UnauthorizedError` - Authentication required
- `ForbiddenError` - Permission denied
- `ConflictError` - Resource conflict
- `ApiError` - Generic server error

---

## Examples

### Complete Workflow: Creating and Launching a Campaign

```bash
# 1. Create a template
TEMPLATE=$(curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Initial Contact",
    "type": "INITIAL",
    "subjectA": "Hi {{name}}, I have a quick question",
    "body": "Hi {{name}}, I noticed {{businessName}} and thought you might be interested in {{yourService}}"
  }')

TEMPLATE_ID=$(echo $TEMPLATE | jq -r '.data.id')

# 2. Create leads
curl -X POST http://localhost:3000/api/leads/bulk/create \
  -H "Content-Type: application/json" \
  -d '{
    "leads": [
      {"name": "John", "email": "john@example.com", "businessName": "Acme"},
      {"name": "Jane", "email": "jane@example.com", "businessName": "TechCorp"}
    ]
  }'

# 3. Get mailbox ID (assuming it exists)
MAILBOX=$(curl -X GET http://localhost:3000/api/mailboxes/default)
MAILBOX_ID=$(echo $MAILBOX | jq -r '.data.id')

# 4. Create campaign
CAMPAIGN=$(curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Q2 Outreach\",
    \"mailboxId\": \"$MAILBOX_ID\",
    \"initialTemplateId\": \"$TEMPLATE_ID\",
    \"leadIds\": [\"lead_1\", \"lead_2\"]
  }")

CAMPAIGN_ID=$(echo $CAMPAIGN | jq -r '.data.id')

# 5. Launch campaign
curl -X POST http://localhost:3000/api/campaigns/$CAMPAIGN_ID/launch
```

---

## Rate Limiting

Currently no rate limiting. Recommended to implement:
- 100 requests per minute per user
- 1000 requests per hour per user

---

## Pagination

Use `page` and `limit` query parameters for pagination:
- Default page: 1
- Default limit: 10
- Max limit: 100

Example:
```
GET /leads?page=2&limit=20
```

---

## Filtering & Search

Most list endpoints support filtering:
- `search` - Free text search
- `status` - Filter by status
- `isActive`, `isInterested`, `aiEnriched` - Boolean filters
- Entity-specific filters (type, mailboxId, campaignId, etc.)

---

## Sorting

Sort parameters coming soon. For now, results are sorted by `createdAt` descending.

---

## Contact & Support

For API issues or questions, check the [Backend README](./README.md) or [Quick Reference](./QUICK_REFERENCE.md).

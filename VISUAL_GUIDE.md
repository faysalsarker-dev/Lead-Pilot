# API Architecture & Integration Guide (Visual)

Quick visual guide to the Lead Pilot API architecture and how everything connects.

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     Frontend (React/Next.js)                   │
│              (/app/* components, pages, forms)                 │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           ↓ HTTP Requests
┌────────────────────────────────────────────────────────────────┐
│                        API Routes                               │
│              (/app/api/[resource]/route.ts)                    │
│  - GET /leads, POST /leads, GET /leads/:id, etc.               │
│  - 26 route files handling all resources                       │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓ Function Calls
┌────────────────────────────────────────────────────────────────┐
│                      Controllers                                │
│           (Validation, Request Handling)                        │
│  - leadController, campaignController, etc.                    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓ Method Calls
┌────────────────────────────────────────────────────────────────┐
│                      Services                                   │
│         (Business Logic, Orchestration)                         │
│  - leadService, campaignService, etc.                          │
│  - Implements workflows, validations, calculations             │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓ Query Methods
┌────────────────────────────────────────────────────────────────┐
│                    Repositories                                 │
│         (Data Abstraction, Prisma Queries)                      │
│  - leadRepository.findAll(), create(), update()                │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓ ORM Calls
┌────────────────────────────────────────────────────────────────┐
│                    Prisma Client                                │
│          (Type-Safe Database Access)                            │
│  - prisma.lead.findMany(), create(), update()                  │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ↓ SQL Queries
┌────────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                           │
│         (Users, Leads, Campaigns, Templates, etc.)             │
└────────────────────────────────────────────────────────────────┘
```

---

## Request-Response Flow

### Example: GET /leads

```
┌─ CLIENT (Browser/App)
│  │
│  └─→ fetch('http://localhost:3000/api/leads?page=1&limit=10')
│
├─ NEXT.JS ROUTE HANDLER (/app/api/leads/route.ts)
│  │
│  ├─→ getServerSession(authOptions)  [Auth Middleware]
│  ├─→ Extract userId from session
│  ├─→ Parse query params (page, limit)
│  └─→ Validate inputs with Zod
│
├─ SERVICE (/backend/services/lead.service.ts)
│  │
│  └─→ getLeads(userId, { page, limit })
│
├─ REPOSITORY (/backend/repositories/lead.repository.ts)
│  │
│  └─→ prisma.lead.findMany({ where, skip, take })
│
├─ DATABASE (PostgreSQL)
│  │
│  └─→ SELECT * FROM Lead WHERE ... LIMIT 10 OFFSET 0
│
└─ RESPONSE (JSON)
   │
   └─→ {
     "success": true,
     "data": [ { id, name, email, ... }, ... ],
     "pagination": { total: 100, page: 1, limit: 10, totalPages: 10 }
   }
```

---

## Resource Structure

### 1. Users
```
GET /users                          Get profile
PUT /users                          Update profile
GET /users/settings                 Get settings
PUT /users/settings                 Update settings
GET /users/unread-count             Get unread count
```

### 2. Leads
```
GET /leads                          List all (paginated)
POST /leads                         Create single
GET /leads/:id                      Get detail
PUT /leads/:id                      Update
DELETE /leads/:id                   Delete
POST /leads/bulk/create             Bulk import
```

### 3. Campaigns
```
GET /campaigns                      List all
POST /campaigns                     Create
GET /campaigns/:id                  Get detail
PUT /campaigns/:id                  Update
DELETE /campaigns/:id               Delete
POST /campaigns/:id/launch          Launch (DRAFT → RUNNING)
POST /campaigns/:id/pause           Pause (RUNNING → PAUSED)
POST /campaigns/:id/resume          Resume (PAUSED → RUNNING)
```

### 4. Templates
```
GET /templates                      List all
POST /templates                     Create
GET /templates/:id                  Get detail
PUT /templates/:id                  Update
DELETE /templates/:id               Delete
POST /templates/:id/duplicate       Duplicate
```

### 5. Mailboxes
```
GET /mailboxes                      List all
POST /mailboxes                     Create
GET /mailboxes/:id                  Get detail
PUT /mailboxes/:id                  Update
DELETE /mailboxes/:id               Delete
GET /mailboxes/default              Get default
POST /mailboxes/:id/set-default     Set default
```

### 6. Conversations
```
GET /conversations/:leadId          Get thread
POST /conversations/:leadId/messages Add message
```

### 7. Replies
```
GET /replies                        List all
POST /replies                       Create
GET /replies/:id                    Get detail
PUT /replies/:id                    Update
DELETE /replies/:id                 Delete
POST /replies/:id/mark-as-read      Mark read
```

### 8. Notifications
```
GET /notifications                  List all
POST /notifications                 Create
GET /notifications/:id              Get detail
DELETE /notifications/:id           Delete
POST /notifications/:id/mark-as-read Mark read
POST /notifications/mark-all-as-read Mark all
```

### 9. Email Queue
```
GET /email-queue                    List all
GET /email-queue/stats              Get statistics
GET /email-queue/:id                Get detail
POST /email-queue/:id/mark-as-sent  Mark sent
POST /email-queue/:id/mark-as-failed Mark failed
```

---

## File Organization

```
Lead Pilot Root
│
├── src/
│   ├── backend/
│   │   ├── services/               ← Business logic (9 files)
│   │   ├── repositories/           ← Data access (9 files)
│   │   ├── controllers/            ← Request handling (5 files)
│   │   ├── dtos/                   ← Data types (9 files)
│   │   ├── validators/             ← Zod schemas (9 files)
│   │   ├── middleware/             ← Utility functions (5 files)
│   │   │   ├── errors.ts           (Error classes)
│   │   │   ├── response-handler.ts (Response formatters)
│   │   │   ├── auth.ts             (Auth checks)
│   │   │   ├── validation.ts       (Input validation)
│   │   │   └── logger.ts           (Logging)
│   │   ├── types/                  ← TypeScript types (1 file)
│   │   ├── utils/                  ← Helpers (6+ files)
│   │   │   ├── crypto.utils.ts
│   │   │   ├── timezone.utils.ts
│   │   │   ├── email.utils.ts
│   │   │   ├── template.utils.ts
│   │   │   ├── analytics.utils.ts
│   │   │   └── array.utils.ts
│   │   └── README.md               ← Architecture guide
│   │
│   ├── app/
│   │   └── api/                    ← REST API Routes (26 files)
│   │       ├── users/
│   │       │   ├── route.ts
│   │       │   ├── settings/route.ts
│   │       │   └── unread-count/route.ts
│   │       ├── leads/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── bulk/create/route.ts
│   │       ├── campaigns/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   ├── [id]/launch/route.ts
│   │       │   ├── [id]/pause/route.ts
│   │       │   └── [id]/resume/route.ts
│   │       ├── templates/
│   │       ├── mailboxes/
│   │       ├── conversations/
│   │       ├── replies/
│   │       ├── notifications/
│   │       ├── email-queue/
│   │       ├── README.md
│   │       ├── API_DOCUMENTATION.md
│   │       ├── CLIENT_INTEGRATION.md
│   │       └── IMPLEMENTATION_GUIDE.md
│   │
│   ├── components/                 ← React components
│   ├── hooks/                      ← Custom hooks
│   └── lib/                        ← Utilities
│
├── prisma/
│   ├── schema.prisma
│   └── models/                     ← 9 data models
│
├── PROJECT_SUMMARY.md              ← Start here
├── API_QUICK_REFERENCE.md
├── IMPLEMENTATION_CHECKLIST.md
├── READY_FOR_IMPLEMENTATION.md
└── ... (other config files)
```

---

## Data Flow: Creating a Lead

```
1. USER ACTION (Frontend)
   User fills form and clicks "Create Lead"
   
   ↓

2. API REQUEST (Frontend → Backend)
   POST /api/leads
   {
     "name": "John Doe",
     "email": "john@example.com",
     "businessName": "ACME"
   }
   
   ↓

3. ROUTE HANDLER (/app/api/leads/route.ts)
   - Extract session
   - Parse request body
   - Validate with createLeadSchema (Zod)
   - Call leadService.createLead()
   
   ↓

4. SERVICE (leadService.ts)
   - Check business rules
   - Enrich data if needed
   - Call leadRepository.create()
   
   ↓

5. REPOSITORY (leadRepository.ts)
   - Call prisma.lead.create()
   - Return created lead
   
   ↓

6. DATABASE (PostgreSQL)
   INSERT INTO Lead (name, email, businessName, ...)
   VALUES ('John Doe', 'john@example.com', 'ACME', ...)
   
   ↓

7. RESPONSE (Backend → Frontend)
   {
     "success": true,
     "statusCode": 201,
     "message": "Lead created successfully",
     "data": {
       "id": "lead_123",
       "name": "John Doe",
       "email": "john@example.com",
       ...
     }
   }
   
   ↓

8. UI UPDATE (Frontend)
   - Show success message
   - Add lead to list
   - Redirect or clear form
```

---

## Status Codes Reference

```
┌─────────┬───────────────┬──────────────────────────────────────┐
│ Code    │ Meaning       │ When Used                            │
├─────────┼───────────────┼──────────────────────────────────────┤
│ 200 OK  │ Success       │ GET, PUT, DELETE succeeded           │
│ 201     │ Created       │ POST successfully created resource   │
│ 400     │ Bad Request   │ Validation error, invalid input      │
│ 401     │ Unauthorized  │ Not authenticated/logged in          │
│ 403     │ Forbidden     │ No permission for resource           │
│ 404     │ Not Found     │ Resource doesn't exist               │
│ 409     │ Conflict      │ Duplicate, conflict, constraint      │
│ 500     │ Server Error  │ Internal server error                │
└─────────┴───────────────┴──────────────────────────────────────┘
```

---

## Error Flow

```
1. USER ACTION
   POST /api/leads with invalid email
   
   ↓

2. ROUTE HANDLER
   - Parse request ✓
   - Extract session ✓
   - Validate with Zod ✗ (email validation fails)
   
   ↓

3. ERROR HANDLING
   - Catch validation error
   - Format as 400 response
   - Include field errors
   
   ↓

4. RESPONSE
   {
     "success": false,
     "statusCode": 400,
     "message": "Validation error",
     "errors": {
       "email": ["Invalid email format"]
     }
   }
   
   ↓

5. FRONTEND
   - Show error message
   - Highlight invalid field
   - Allow user to fix and retry
```

---

## Pagination Pattern

```
GET /leads?page=2&limit=20

Response:
{
  "success": true,
  "data": [ /* 20 items */ ],
  "pagination": {
    "total": 100,           ← Total items in database
    "page": 2,              ← Current page
    "limit": 20,            ← Items per page
    "totalPages": 5         ← Total pages (100 / 20)
  }
}

Frontend usage:
- Show items 21-40 out of 100
- Show page 2/5
- Enable "Next" button
- Enable "Previous" button
```

---

## Filtering Pattern

```
GET /leads?search=john&status=ACTIVE&isInterested=true

Applies filters:
- Search by name, email, business (any field)
- Filter by status (NEW, CONTACTED, ACTIVE, INTERESTED, CONVERTED, REJECTED)
- Filter by interested status (true/false)

Response returns only matching leads.
```

---

## Authentication Flow

```
1. USER LOGIN (NextAuth)
   User enters credentials
   → NextAuth creates session
   → Session stored in cookies
   
   ↓

2. API REQUEST
   Browser sends request to /api/leads
   → Cookies included automatically
   → NextAuth session included
   
   ↓

3. ROUTE HANDLER
   const session = await getServerSession(authOptions)
   → Extracts session from cookies
   → Gets user ID: session.user.id
   
   ↓

4. AUTHORIZATION CHECK
   if (!session?.user?.id) {
     return 401 Unauthorized
   }
   
   ↓

5. QUERY EXECUTION
   Service filters by userId
   → Returns only user's data
   → Prevents seeing other users' data
   
   ↓

6. RESPONSE
   Returns user's data safely
```

---

## Service Layer Example

```
leadService.createLead(userId, data)
│
├─ Validate input (done by route, but extra check)
├─ Check for duplicates
├─ Enrich lead data
│  ├─ Geocode address
│  ├─ Get timezone
│  └─ Calculate AI score
├─ Call repository
├─ Create notification if needed
└─ Return created lead
```

---

## Database Schema (Simplified)

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │
│ email       │
│ name        │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ↓                 ↓
┌─────────────┐   ┌─────────────┐
│    Lead     │   │   Mailbox   │
├─────────────┤   ├─────────────┤
│ id (PK)     │   │ id (PK)     │
│ userId (FK) │   │ userId (FK) │
│ name        │   │ type        │
│ email       │   │ isDefault   │
│ status      │   └─────────────┘
│ aiScore     │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ↓                  ↓
┌──────────────┐  ┌──────────────┐
│ Conversation │  │   Reply      │
├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │
│ leadId (FK)  │  │ leadId (FK)  │
│ messages     │  │ fromEmail    │
└──────────────┘  │ isRead       │
                  └──────────────┘

┌──────────────┐  ┌──────────────┐
│  Campaign    │  │  Template    │
├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │
│ userId (FK)  │  │ userId (FK)  │
│ status       │  │ type         │
│ mailboxId    │  │ subject      │
│ templateIds  │  │ body         │
└──────┬───────┘  └──────────────┘
       │
       ↓
┌──────────────┐  ┌──────────────┐
│ EmailQueue   │  │Notification  │
├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │
│ campaignId   │  │ userId (FK)  │
│ leadId       │  │ type         │
│ status       │  │ message      │
│ sentAt       │  │ isRead       │
└──────────────┘  └──────────────┘
```

---

## Implementation Checklist (26 Routes)

```
✓ PLANNED
⏳ IN PROGRESS
❌ NOT STARTED

USERS (3)
├─ ⏳ GET /users
├─ ⏳ PUT /users
├─ ⏳ GET /users/settings
├─ ⏳ PUT /users/settings
└─ ⏳ GET /users/unread-count

LEADS (3)
├─ ⏳ GET /leads
├─ ⏳ POST /leads
├─ ⏳ GET /leads/:id
├─ ⏳ PUT /leads/:id
├─ ⏳ DELETE /leads/:id
└─ ⏳ POST /leads/bulk/create

CAMPAIGNS (5)
├─ ⏳ GET /campaigns
├─ ⏳ POST /campaigns
├─ ⏳ GET /campaigns/:id
├─ ⏳ PUT /campaigns/:id
├─ ⏳ DELETE /campaigns/:id
├─ ⏳ POST /campaigns/:id/launch
├─ ⏳ POST /campaigns/:id/pause
└─ ⏳ POST /campaigns/:id/resume

TEMPLATES (3)
├─ ⏳ GET /templates
├─ ⏳ POST /templates
├─ ⏳ GET /templates/:id
├─ ⏳ PUT /templates/:id
├─ ⏳ DELETE /templates/:id
└─ ⏳ POST /templates/:id/duplicate

MAILBOXES (4)
├─ ⏳ GET /mailboxes
├─ ⏳ POST /mailboxes
├─ ⏳ GET /mailboxes/:id
├─ ⏳ PUT /mailboxes/:id
├─ ⏳ DELETE /mailboxes/:id
├─ ⏳ GET /mailboxes/default
└─ ⏳ POST /mailboxes/:id/set-default

CONVERSATIONS (2)
├─ ⏳ GET /conversations/:leadId
└─ ⏳ POST /conversations/:leadId/messages

REPLIES (3)
├─ ⏳ GET /replies
├─ ⏳ POST /replies
├─ ⏳ GET /replies/:id
├─ ⏳ PUT /replies/:id
├─ ⏳ DELETE /replies/:id
└─ ⏳ POST /replies/:id/mark-as-read

NOTIFICATIONS (4)
├─ ⏳ GET /notifications
├─ ⏳ POST /notifications
├─ ⏳ GET /notifications/:id
├─ ⏳ DELETE /notifications/:id
├─ ⏳ POST /notifications/:id/mark-as-read
└─ ⏳ POST /notifications/mark-all-as-read

EMAIL QUEUE (5)
├─ ⏳ GET /email-queue
├─ ⏳ GET /email-queue/stats
├─ ⏳ GET /email-queue/:id
├─ ⏳ POST /email-queue/:id/mark-as-sent
└─ ⏳ POST /email-queue/:id/mark-as-failed

TOTAL: 26 routes
```

---

## Next: What to Do Now

1. **Read Documentation** (15 min)
   - Start: API_QUICK_REFERENCE.md
   - Then: IMPLEMENTATION_GUIDE.md
   - Then: CLIENT_INTEGRATION.md

2. **Implement First Route** (30 min)
   - Copy pattern from IMPLEMENTATION_GUIDE.md
   - Create GET /leads route
   - Test with curl

3. **Implement Remaining Routes** (2-3 days)
   - Follow same pattern
   - Test each one
   - Reference documentation as needed

4. **Test & Deploy** (1-2 days)
   - Write tests
   - Performance test
   - Deploy to staging
   - Deploy to production

---

**Ready? Start with IMPLEMENTATION_GUIDE.md! 🚀**

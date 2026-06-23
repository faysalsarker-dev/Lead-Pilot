# PitchPilot — Agent Guide

## What This App Does
Cold outreach SaaS. User connects mailboxes → creates campaigns (category + city) → imports leads → sends bulk email sequences with follow-ups → tracks replies.

---

## Stack
- **Next.js 16** App Router — no separate backend
- **Prisma** + Neon PostgreSQL — ORM only, no raw SQL
- **NextAuth** — credentials auth
- **RTK Query** — all client data fetching
- **shadcn/ui** + Tailwind — UI only, no animation libraries
- **Nodemailer** — email sending
- **Gemini API** — AI lead enrichment
- **Vercel Cron** — scheduled jobs

---

## Core Flow
```
User creates Campaign (category + city + mailbox + template)
  → imports Leads via CSV or manual
  → launches campaign
  → system resolves {{variables}} per lead → inserts EmailQueue rows
  → Vercel Cron sends PENDING queue items where scheduledAt <= now()
  → on reply (webhook or IMAP) → cancel pending queue → mark lead REPLIED
  → user manages pipeline / schedules follow-ups manually
```

---

## DB Models & Relations
```
User
 ├── Mailbox[]         (sending accounts: Gmail/SMTP/Cloudflare)
 ├── Template[]        (email bodies with {{variables}})
 ├── Campaign[]        (targeting intent: category + city)
 │    └── CampaignLead[] (join: one lead → one campaign only)
 ├── Lead[]
 │    ├── CampaignLead  (which campaign this lead belongs to)
 │    ├── EmailQueue[]  (all emails queued for this lead)
 │    ├── Reply[]       (inbound replies)
 │    ├── FollowUp[]    (manually scheduled next contacts)
 │    └── Notification[]
 ├── AIAgentJob[]      (Hermes sniper runs: category+city → CSV)
 └── Notification[]
```

**Key rules:**
- One lead belongs to exactly ONE campaign (`CampaignLead.leadId` is `@unique`)
- Email body is NOT stored for sent mail — read from Gmail directly
- Reply IS stored — user reads it inside the app
- SMTP/IMAP passwords stored AES-256-GCM encrypted

---

## Template Variables
Resolved in `src/lib/variables.ts` at send time:

| Variable | Source |
|---|---|
| `{{business_name}}` | `lead.businessName` |
| `{{owner_name}}` | `lead.ownerName` |
| `{{city}}` | `lead.city` |
| `{{website}}` | `lead.website` |
| `{{your_name}}` | `user.name` |
| `{{your_service}}` | `user.service` |

---

## Key API Routes
```
POST   /api/auth/[...nextauth]     — login / register
GET    /api/campaigns              — list user campaigns
POST   /api/campaigns              — create campaign
PATCH  /api/campaigns/[id]         — update / pause / launch
GET    /api/leads                  — list leads (filter by campaignId, status)
POST   /api/leads                  — create single lead
POST   /api/leads/import           — bulk CSV import → insert CampaignLead rows
GET    /api/mailboxes              — list mailboxes
POST   /api/mailboxes              — add mailbox
POST   /api/mailboxes/[id]/test    — test SMTP + IMAP connection
GET    /api/templates              — list templates
POST   /api/templates              — create template (auto-extract usedVariables)
POST   /api/follow-ups             — create manual follow-up for a lead
GET    /api/notifications          — list unread notifications
POST   /api/webhooks/inbound       — Cloudflare Email Worker reply webhook
GET    /api/agent                  — list AI agent jobs
POST   /api/agent                  — trigger new Hermes sniper job
```

---

## Hard Rules

**Types** — never write custom interfaces for DB models. Always use Prisma-generated types:
```ts
import type { Lead, Campaign } from '@/app/generated/prisma'
import type { Prisma } from '@/app/generated/prisma'
type CampaignWithLeads = Prisma.CampaignGetPayload<{ include: { leads: true } }>
```

**Data fetching** — never `useEffect + fetch` in components. Always RTK Query hooks from `src/redux/hooks`.

**Auth** — every API route checks session first. Always scope DB queries with `userId` from session. Never trust client-sent userId.

**No:** separate backend, Axios, React Query, SWR, Framer Motion, GSAP, raw SQL, custom type files for models.
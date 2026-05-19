# 🚀 PitchPilot - AI-Powered Cold Outreach & Lead Management SaaS

**The complete solution for solo freelancers to find leads, score them with AI, send personalized bulk emails, detect replies automatically, and close clients—all in one tool.**

---

## 📋 What It Does

- **🔍 Find Leads** - Manually add leads, import CSV, or use AI to find qualified prospects from Google Maps/Facebook
- **🤖 AI Enrichment** - Website scoring (1-10), personalized email openers, pain point identification 
- **📧 Bulk Email Campaigns** - Create campaigns with templates, schedule sends per recipient timezone, track delivery
- **✉️ Reply Detection** - Automatically scans IMAP mailboxes every 10 minutes for responses
- **💬 Unified Inbox** - Read all replies in one place, AI-drafts your responses
- **📊 Campaign Analytics** - Track opens, replies, conversions, auto-pause if bounce rate exceeds 5%

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 14 App Router, React, TypeScript | Type-safe SSR, fast builds, zero-config deployment |
| **Components** | shadcn/ui, Tailwind CSS | Accessible, customizable, enterprise-ready UI |
| **Forms** | react-hook-form + Zod | Type-safe validation, minimal re-renders |
| **Database** | PostgreSQL (Neon serverless) + Prisma ORM | Fully managed, auto-scaling, type-safe queries |
| **Authentication** | NextAuth.js with JWT | Credentials provider, secure sessions |
| **AI** | Google Gemini API 1.5-flash | Fast, affordable, good for text generation |
| **Email Sending** | Nodemailer (Gmail OAuth + SMTP) | Multi-mailbox, open tracking via pixel |
| **Email Receiving** | imapflow | Fast IMAP client, event-driven |
| **Scheduling** | Vercel Cron Jobs | Serverless, no infrastructure needed |
| **Encryption** | AES-256-GCM | Protects API keys, passwords, SMTP credentials |
| **Deployment** | Vercel | Next.js native, auto-scaling, built-in crons |

---

## 📁 Project Folder Structure

```
lead-pilot/
├── src/
│   ├── app/
│   │   ├── (auth)/                    # Login/Register routes
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (pages)/                   # Protected dashboard routes
│   │   │   ├── page.tsx               # Dashboard (KPIs, charts)
│   │   │   ├── layout.tsx
│   │   │   ├── leads/                 # Lead management
│   │   │   │   ├── page.tsx           # List leads
│   │   │   │   ├── add/page.tsx       # Create lead
│   │   │   │   ├── import/page.tsx    # CSV wizard
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # Lead profile
│   │   │   │       └── edit/page.tsx
│   │   │   ├── campaigns/             # Campaign management
│   │   │   │   ├── page.tsx           # Campaign grid
│   │   │   │   ├── new/page.tsx       # 4-step wizard
│   │   │   │   └── [id]/page.tsx      # Campaign stats
│   │   │   ├── templates/page.tsx     # Email template library
│   │   │   ├── inbox/page.tsx         # Unified reply inbox
│   │   │   ├── notifications/page.tsx # All system events
│   │   │   └── settings/
│   │   │       ├── page.tsx           # Settings hub
│   │   │       ├── mailboxes/page.tsx # Email accounts
│   │   │       ├── profile/page.tsx   # User profile
│   │   │       └── ai/page.tsx        # Gemini API key
│   │   ├── api/                       # All API routes
│   │   │   ├── auth/[...nextauth]     # Authentication
│   │   │   ├── leads/                 # Lead CRUD + enrichment
│   │   │   ├── tags/                  # Lead categorization
│   │   │   ├── campaigns/             # Campaign management
│   │   │   ├── templates/             # Template CRUD
│   │   │   ├── mailboxes/             # Email account config
│   │   │   ├── inbox/                 # Reply management
│   │   │   ├── ai/                    # AI endpoints (enrich, draft, generate)
│   │   │   ├── cron/                  # Scheduled jobs
│   │   │   ├── pixel/[token]          # Open tracking
│   │   │   └── user/                  # Profile + settings
│   │   ├── error.tsx                  # Error boundary
│   │   ├── not-found.tsx              # 404 page
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Tailwind
│   ├── components/                    # React components
│   │   ├── ui/                        # shadcn/ui components
│   │   ├── blocks/                    # Page sections (header, sidebar)
│   │   └── modules/                   # Feature modules
│   ├── lib/                           # Utilities
│   │   ├── auth.ts                    # NextAuth config
│   │   ├── prisma.ts                  # Prisma client
│   │   ├── gemini.ts                  # Gemini API wrapper
│   │   ├── encryption.ts              # AES-256-GCM encrypt/decrypt
│   │   ├── email-extractor.ts         # Parse emails, fetch pages
│   │   ├── mailer.ts                  # Send emails (Gmail + SMTP)
│   │   ├── imap.ts                    # Scan for replies
│   │   ├── scheduler.ts               # Timezone-aware scheduling
│   │   ├── queue.ts                   # Email queue + templates
│   │   ├── agents/
│   │   │   ├── enricher-agent.ts      # AI enrichment
│   │   │   └── writer-agent.ts        # AI template + reply generation
│   │   └── utils.ts                   # General utilities
│   ├── hooks/                         # React hooks
│   │   ├── useAuth.ts                 # Auth context
│   │   └── use-mobile.ts              # Mobile detection
│   ├── redux/                         # State management
│   │   ├── store.ts
│   │   ├── baseApi.ts
│   │   └── features/                  # Redux slices
│   └── types/                         # TypeScript types
│       └── next-auth.d.ts
├── prisma/
│   ├── schema.prisma                  # Database schema (13 models)
│   └── migrations/                    # Database migrations
├── public/                            # Static files
├── middleware.ts                      # Route protection + CRON verification
├── vercel.json                        # Cron schedule config
├── .env.local.example                 # Environment template
├── next.config.ts                     # Next.js config
├── tsconfig.json                      # TypeScript config
├── eslint.config.mjs                  # Linting rules
├── tailwind.config.ts                 # Tailwind theme
├── postcss.config.mjs                 # CSS processing
└── package.json                       # Dependencies

```

---

## 📄 Page Routes & Purpose

| Route | Purpose | Key Features |
|-------|---------|--------------|
| **/login** | Credentials authentication | Email + password form, error messages |
| **/register** | Create account | Validation, auto-login after signup |
| **/** (Dashboard) | Main hub, KPIs | Pipeline chart, recent replies, campaign stats |
| **/leads** | Lead management table | Sort, filter, bulk actions (status, delete, export) |
| **/leads/add** | Single lead form | Name, email, business, website, timezone |
| **/leads/import** | CSV bulk upload | 4-step: upload → preview → validate → confirm |
| **/leads/[id]** | Lead profile | AI score card, conversation thread, notes |
| **/leads/[id]/edit** | Edit lead | All fields, plus AI enrichment button |
| **/campaigns** | Campaign grid | Status cards, launch button, stats |
| **/campaigns/new** | Campaign wizard | 4 steps: select leads → templates → timing → review |
| **/campaigns/[id]** | Campaign stats | Per-lead table, open/reply/conversion rates |
| **/templates** | Template library | CRUD templates, AI generator, A/B variants |
| **/inbox** | Unified inbox | Reply list (left), thread view (right), AI draft reply |
| **/notifications** | Event log | All system notifications with timestamps |
| **/settings/mailboxes** | Gmail/SMTP setup | Add mailbox, test connection, set default |
| **/settings/profile** | User profile | Name, your service, password |
| **/settings/ai** | Gemini config | API key input, test enrichment |

---

## 🔌 API Routes Reference

| Method | Route | Purpose |
|--------|-------|---------|
| **LEADS** | | |
| GET | `/api/leads` | List leads (paginated, filterable by status) |
| POST | `/api/leads` | Create single lead |
| GET | `/api/leads/[id]` | Get lead + AI data |
| PUT | `/api/leads/[id]` | Update lead |
| DELETE | `/api/leads/[id]` | Soft-delete lead |
| POST | `/api/leads/[id]/enrich` | Trigger AI enrichment |
| POST | `/api/leads/[id]/tags` | Add tag to lead |
| DELETE | `/api/leads/[id]/tags?tagId=...` | Remove tag |
| PUT | `/api/leads/bulk` | Batch update status |
| DELETE | `/api/leads/bulk?ids=...` | Batch soft-delete |
| POST | `/api/leads/import` | CSV bulk import |
| **TAGS** | | |
| GET | `/api/tags` | List all tags |
| POST | `/api/tags` | Create tag |
| PUT | `/api/tags/[id]` | Rename tag |
| DELETE | `/api/tags/[id]` | Delete tag |
| **CAMPAIGNS** | | |
| GET | `/api/campaigns` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| GET | `/api/campaigns/[id]` | Get campaign details |
| PUT | `/api/campaigns/[id]` | Update campaign |
| DELETE | `/api/campaigns/[id]` | Delete campaign |
| POST | `/api/campaigns/[id]/launch` | Start sending |
| PUT | `/api/campaigns/[id]/pause` | Pause campaign |
| PUT | `/api/campaigns/[id]/resume` | Resume campaign |
| GET | `/api/campaigns/[id]/leads` | List leads in campaign |
| POST | `/api/campaigns/[id]/leads` | Add leads to campaign |
| **TEMPLATES** | | |
| GET | `/api/templates` | List templates |
| POST | `/api/templates` | Create template |
| GET | `/api/templates/[id]` | Get template |
| PUT | `/api/templates/[id]` | Update template |
| DELETE | `/api/templates/[id]` | Delete template |
| POST | `/api/templates/[id]/duplicate` | Clone template |
| **MAILBOXES** | | |
| GET | `/api/mailboxes` | List configured mailboxes |
| POST | `/api/mailboxes` | Add Gmail/SMTP mailbox |
| GET | `/api/mailboxes/[id]` | Get mailbox config |
| PUT | `/api/mailboxes/[id]` | Update mailbox |
| DELETE | `/api/mailboxes/[id]` | Delete mailbox |
| POST | `/api/mailboxes/[id]/test` | Test SMTP + IMAP |
| PUT | `/api/mailboxes/[id]/set-default` | Set default mailbox |
| **AI** | | |
| POST | `/api/ai/enrich` | Enrichment prompt → Gemini → score + opener |
| POST | `/api/ai/draft-reply` | Conversation history → Gemini → 80-word reply |
| POST | `/api/ai/generate-template` | User goal → Gemini → 2 subjects + body |
| **INBOX** | | |
| POST | `/api/inbox/[leadId]/reply` | Send reply to lead |
| PUT | `/api/inbox/[leadId]/read` | Mark conversation as read |
| **CRONS** (Vercel scheduled) | | |
| POST | `/api/cron/send-queue` | Send pending emails (every 5 min) |
| POST | `/api/cron/check-replies` | Scan IMAP (every 10 min) |
| POST | `/api/cron/followups` | Queue follow-ups (daily 9am) |
| POST | `/api/cron/reset-send-counts` | Reset limits (daily midnight) |
| **PIXEL** | | |
| GET | `/api/pixel/[token]` | 1x1 GIF for open tracking |
| **AUTH** | | |
| POST | `/api/auth/[...nextauth]` | NextAuth handler |
| **USER** | | |
| GET | `/api/user/profile` | Get user + settings |
| PUT | `/api/user/profile` | Update name, service |
| PUT | `/api/user/password` | Change password |
| GET | `/api/user/ai-settings` | Get Gemini key status |
| PUT | `/api/user/ai-settings` | Store encrypted Gemini key |
| POST | `/api/user/ai-settings/test` | Test Gemini connection |

---

## 🗄️ Database Models Overview

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **User** | email, password, name, service, geminiApiKey (encrypted), autoEnrich | 1→many: Leads, Campaigns, Templates, Mailboxes |
| **Lead** | name, email, businessName, website, timezone, status (NEW/CONTACTED/ACTIVE/INTERESTED/CONVERTED/REJECTED), aiScore, aiSummary, aiPainPoints, aiEmailOpener, enrichmentStatus, source | 1→1: Conversation; 1→many: Replies, CampaignLeads, EmailQueue, LeadTags |
| **Campaign** | name, status, initialTemplate, followup1/2/finalTemplate, followup1/2/finalDays, sendWindow, totalSent, totalBounced | 1→many: CampaignLeads, EmailQueue |
| **Template** | name, type (INITIAL/FOLLOWUP_1/FOLLOWUP_2/FINAL), subjectA, subjectB, body (with {{name}} {{business}} {{pain_point}} {{your_name}} variables) | Many→many via Campaign |
| **Mailbox** | label, type (GMAIL_OAUTH/CUSTOM_SMTP), gmailRefreshToken, smtpHost/port/user/passEnc, imapHost/port/user/passEnc, isDefault, isActive, lastImapSync | 1→many: Campaigns, Replies, EmailQueue |
| **EmailQueue** | campaignId, leadId, mailboxId, templateId, templateType, subject, body, scheduledAt (UTC), status (PENDING/SENT/FAILED/CANCELLED), sentAt, failReason, retryCount | Tracks every email to send |
| **Reply** | leadId, mailboxId, fromEmail, subject, body, receivedAt, isRead, threadId | Incoming emails from leads |
| **Conversation** | leadId, messages (JSON array), updatedAt | Thread history in inbox |
| **CampaignLead** | campaignId, leadId, assignedSubject (A or B), sentAt, openedAt, repliedAt, followup1/2/finalSentAt, bounced | Per-lead campaign tracking |
| **Notification** | userId, leadId, campaignId, type, message, isRead, createdAt | System events |
| **Tag** | userId, name | Lead categorization |
| **LeadTag** | leadId, tagId | Many→many join table |

---

## 🔧 Environment Variables (.env.local)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# NextAuth
NEXTAUTH_SECRET=<generate: openssl rand -base64 32>
NEXTAUTH_URL=https://yourdomain.com

# Encryption (MUST be exactly 64 hex characters)
ENCRYPTION_KEY=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# Cron Jobs (protects scheduled endpoints)
CRON_SECRET=<generate: openssl rand -base64 32>

# Gmail OAuth (for email sending)
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=https://yourdomain.com/api/auth/callback

# Lead Finder (optional)
GOOGLE_PLACES_API_KEY=your-google-places-api-key
META_ACCESS_TOKEN=your-facebook-ad-library-token

# AI (optional per-user keys in DB, but can set global default)
GEMINI_API_KEY=your-gemini-api-key (optional)
```

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/lead-pilot.git
cd lead-pilot
npm install
```

### 2. Setup Environment
```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local with your values
# Required: DATABASE_URL, NEXTAUTH_SECRET, ENCRYPTION_KEY, CRON_SECRET
# Gmail: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET

# Generate ENCRYPTION_KEY (must be 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Setup
```bash
# Push Prisma schema to database
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# (Optional) Seed test data
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Create Account
- Go to /register
- Sign up with test credentials
- Go to /settings/ai and add your Gemini API key
- Go to /settings/mailboxes and add Gmail or SMTP account

---

## ⏰ Scheduled Cron Jobs

Vercel automatically runs these on a schedule (via `/vercel.json`):

| Job | Schedule | What It Does |
|-----|----------|-------------|
| **send-queue** | Every 5 minutes | Sends 10 pending emails, marks as SENT/FAILED |
| **check-replies** | Every 10 minutes | Scans IMAP mailboxes for new emails, creates Reply records |
| **followups** | Daily at 9am UTC | Checks if any follow-up emails are due, queues them |
| **reset-send-counts** | Daily at midnight UTC | Resets mailbox send counters, auto-pauses if bounce rate >5% |

### Testing Cron Jobs Manually

```bash
# Send emails from queue
curl -X POST https://yourdomain.com/api/cron/send-queue \
  -H "Authorization: Bearer $CRON_SECRET"

# Check for replies
curl -X POST https://yourdomain.com/api/cron/check-replies \
  -H "Authorization: Bearer $CRON_SECRET"

# Queue follow-ups
curl -X POST https://yourdomain.com/api/cron/followups \
  -H "Authorization: Bearer $CRON_SECRET"

# Reset counters
curl -X POST https://yourdomain.com/api/cron/reset-send-counts \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 🤖 AI Agent Modes

### Mode 1: Lead Enricher
**Trigger**: Lead created or manual "Enrich" button  
**Input**: Lead (name, business, website)  
**Process**:
1. Fetches first 10KB of website text
2. Sends to Gemini: "Score this lead 1-10, write personalized opener, identify 3 pain points"
3. Parses JSON response
**Output**: 
- `aiScore` (1-10)
- `aiSummary` (2-3 sentences about business)
- `aiPainPoints` (3 key pain points)
- `aiEmailOpener` (personalized first line)

### Mode 2: Reply Drafter
**Trigger**: User opens conversation in inbox  
**Input**: Conversation history (last 4 messages)  
**Process**:
1. Reads previous emails between user and lead
2. Sends to Gemini: "Draft a 80-word professional reply addressing their concern"
3. Strips markdown formatting
**Output**: Plain text reply (user always reviews before sending)

### Mode 3: Template Generator
**Trigger**: User clicks "Generate with AI"  
**Input**: User's goal description ("Get web design clients interested in redesigns")  
**Process**:
1. Sends to Gemini: "Create 2 subject lines and compelling email body with {{variables}}"
2. Parses JSON response
**Output**:
- `subjectA` and `subjectB` for A/B testing
- `body` with {{name}}, {{business}}, {{pain_point}}, {{your_name}} variables

---

## 📧 Email Template Variables

Available variables (auto-replaced before sending):
- `{{name}}` → Lead's name
- `{{business}}` → Lead's business name  
- `{{pain_point}}` → AI-identified pain point
- `{{your_name}}` → Your name from profile

Example template:
```
Subject: {{name}}, I noticed {{business}} isn't {{pain_point}} optimized

Hi {{name}},

I saw {{business}} and noticed an opportunity...

Best,
{{your_name}}
```

---

## 📈 Lead Pipeline

```
┌─────────┐
│   NEW   │  Lead first added (manual, CSV, or AI finder)
└────┬────┘
     │ (After first email sent)
     ↓
┌─────────────┐
│ CONTACTED   │  Email queued/sent, waiting for response
└────┬────────┘
     │ (Reply received via IMAP)
     ↓
┌─────────┐
│ ACTIVE  │  Lead replied (followed-ups cancelled automatically)
└────┬────┘
     │ (User marks interested)
     ↓
┌──────────────┐
│ INTERESTED   │  User indicates deal potential
└────┬─────────┘
     │ (User closes deal)
     ↓
┌──────────────┐
│ CONVERTED    │  Deal closed / contract signed
└──────────────┘

Any stage can go to: REJECTED (user marks not a fit)
```

---

## 🌐 Deployment on Vercel

### 1. Connect Repository
```bash
# Push to GitHub
git remote add origin https://github.com/yourusername/lead-pilot.git
git push -u origin main
```

### 2. Create Vercel Project
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repo
- Select root directory: `/`

### 3. Configure Environment
In Vercel project settings, add environment variables:
- `DATABASE_URL` 
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (set to your Vercel domain)
- `ENCRYPTION_KEY`
- `CRON_SECRET`
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REDIRECT_URI` (update to Vercel domain)
- Others: `GEMINI_API_KEY`, `GOOGLE_PLACES_API_KEY`, `META_ACCESS_TOKEN`

### 4. Deploy
```bash
git push  # Auto-deploys to Vercel
```

### 5. Verify Crons
In Vercel dashboard → Settings → Crons:
- Should see 4 cron jobs listed
- Status: Active
- Schedule visible (5 min, 10 min, daily, daily)

### 6. Test in Production
```bash
curl -X POST https://yourdomain.vercel.app/api/cron/send-queue \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 📦 npm Packages

One-liner to install all dependencies:
```bash
npm install next@14 react@18 typescript nextauth zod react-hook-form prisma @prisma/client @google/generative-ai nodemailer imapflow bcrypt jsonwebtoken next-auth google-apis-js-client axios sonner recharts date-fns date-fns-tz lucide-react papaparse
```

Or just run:
```bash
npm install  # Uses package.json
```

### Key Packages
- `next`, `react`, `typescript` - Framework
- `nextauth` - Authentication
- `prisma` - ORM
- `@prisma/client` - Prisma client
- `zod` - Schema validation
- `react-hook-form` - Form handling
- `@google/generative-ai` - Gemini API
- `nodemailer` - Email sending
- `imapflow` - IMAP client
- `bcrypt` - Password hashing
- `date-fns-tz` - Timezone scheduling
- `tailwindcss` - Styling
- `shadcn/ui` - Component library
- `recharts` - Charts
- `sonner` - Notifications
- `axios` - HTTP client

---

## 🔒 Security Notes

### What's Encrypted
✅ User Gemini API keys (stored in `User.geminiApiKey`)  
✅ SMTP passwords (stored in `Mailbox.smtpPassEnc`)  
✅ IMAP passwords (stored in `Mailbox.imapPassEnc`)  
✅ AES-256-GCM encryption with random IV + auth tag

### What's Protected
✅ All API routes verify NextAuth session  
✅ Cron routes require `Authorization: Bearer {CRON_SECRET}` header  
✅ All database queries filter by `userId` (prevents cross-user data access)  
✅ Passwords hashed with bcrypt before storage  
✅ No sensitive data in API responses (no password hashes, API keys, tokens)

### What's Not (Yet)
⚠️ Rate limiting (can be abused)
⚠️ Request logging (no audit trail for compliance)
⚠️ CORS restrictions (any origin can call API)
⚠️ IP whitelisting (not implemented)

---

## 📊 Roadmap (Future Features)

- [ ] **Real-time Notifications** - WebSocket push instead of polling
- [ ] **Lead Scoring Rules** - Custom conditions for auto-grading leads
- [ ] **Email Template A/B Analytics** - Which subject line won?
- [ ] **Webhook Support** - Send events to Slack, Zapier, custom webhooks
- [ ] **Multi-language Support** - Emails in German, Spanish, etc
- [ ] **LinkedIn Integration** - Find leads from LinkedIn company search
- [ ] **Cold Call Notes** - Track calls, record outcomes
- [ ] **Deal Pipeline CRM** - Full CRM for won deals
- [ ] **SMS Outreach** - Text message follow-ups
- [ ] **AI Objection Handler** - Gemini drafts responses to common objections
- [ ] **Rate Limiting** - Per-user API request limits
- [ ] **Advanced Analytics** - Cohort analysis, revenue attribution
- [ ] **Team Collaboration** - Multiple users, assign leads to team members
- [ ] **Mobile App** - React Native iOS/Android
- [ ] **Self-hosted Option** - Docker deployment, no Vercel needed

---

## 🐛 Troubleshooting

### Emails not sending
1. Verify mailbox is set as default and active
2. Test SMTP connection: `/settings/mailboxes` → "Test"
3. Check email body doesn't exceed size limits
4. Verify template variables are correct syntax: `{{name}}` not `{name}`
5. Check browser console for API errors

### Replies not detecting
1. Check IMAP is working: `/settings/mailboxes` → "Test" (green checkmark)
2. Verify emails were actually sent from that mailbox
3. Wait 10-15 min for next cron job (runs every 10 min)
4. Check IMAP password hasn't changed
5. Try marking test email as unread, run cron again

### AI enrichment failing
1. Verify Gemini API key is valid: `/settings/ai` → "Test"
2. Check lead has a website (improves enrichment)
3. Ensure website is publicly accessible
4. Check Gemini API usage quota in Google Cloud Console
5. Review error message in notification

### Campaign not launching
1. Select at least one lead
2. Select INITIAL template
3. Assign mailbox with active SMTP/Gmail
4. Fill in send window (e.g., "09:00-11:00")
5. Click "Launch"

### Cron jobs not running
1. Verify `CRON_SECRET` is set on Vercel
2. Check crons are enabled in Vercel dashboard
3. Test manually with curl command (see cron section above)
4. Check database connection (Prisma connect is working)
5. Look for error logs in Vercel dashboard

---

## 📞 Support & Documentation

- **API Docs**: See [AUDIT_AND_IMPROVEMENTS.md](AUDIT_AND_IMPROVEMENTS.md) for detailed API reference
- **Prisma Docs**: [prisma.io](https://prisma.io)
- **Next.js Docs**: [nextjs.org](https://nextjs.org)
- **Gemini API**: [ai.google.dev](https://ai.google.dev)

---

## 📄 License

MIT - Feel free to use for personal projects

---

**Built with ❤️ for solo freelancers who want to close deals faster.**

Last updated: May 18, 2026

# Lead Pilot Frontend - Shadcn UI Implementation Guide

## 🎯 Overview

This document outlines the complete shadcn UI component implementation for the Lead Pilot frontend, integrating with Redux hooks and Prisma database models.

---

## 📦 Components Created

### 1. **Dialog & Form Components**

#### CreateLeadDialog (`src/components/modules/leads/CreateLeadDialog.tsx`)
- Full-featured lead creation form with Zod validation
- Fields: name, email, businessName, businessType, website, country, timezone, notes
- Uses Redux `useCreateLeadMutation` hook
- Features: Loading states, error handling, toast notifications

#### CreateCampaignDialog (`src/components/modules/campaigns/CreateCampaignDialog.tsx`)
- Campaign creation with template selection
- Supports multiple follow-up stages (up to 4 emails)
- Configurable send windows and follow-up timing
- Uses Redux query hooks for mailboxes and templates
- Features: Cascading template type filters

#### CreateTemplateDialog (`src/components/modules/templates/CreateTemplateDialog.tsx`)
- Email template creation with A/B testing support
- Template type selection (INITIAL, FOLLOWUP_1, FOLLOWUP_2, FINAL)
- Placeholder support for dynamic email variables
- Validation ensures minimum length and required fields

---

### 2. **Data Table Components**

#### LeadsDataTable (`src/components/modules/leads/LeadsDataTable.tsx`)
Features:
- Sortable columns with TanStack React Table
- Multi-select with checkboxes
- Inline actions: Copy ID, Edit, Delete
- Status badges with color coding
- AI score progress bar visualization
- Pagination with page count display
- Redux integration for delete mutations

Column breakdown:
- Name & Email
- Business info
- Status badge (NEW, CONTACTED, ACTIVE, INTERESTED, CONVERTED, REJECTED)
- AI Score with progress visualization
- Created date
- Action menu

#### CampaignsDataTable (`src/components/modules/campaigns/CampaignsDataTable.tsx`)
Features:
- Similar structure to LeadsDataTable
- Campaign-specific metrics: Lead count, sent count, progress percentage
- Status-specific actions: Launch (DRAFT), Pause (RUNNING), Resume
- Delete with confirmation
- Launch/Pause/Resume campaign mutations

---

### 3. **Status Badge Components** (`src/components/modules/common/StatusBadges.tsx`)

#### LeadStatusBadge
- Status: NEW, CONTACTED, ACTIVE, INTERESTED, CONVERTED, REJECTED
- Color-coded with icons
- Responsive to lead status changes

#### CampaignStatusBadge
- Status: DRAFT, RUNNING, PAUSED, COMPLETED
- Visual indicators with icons

#### MailboxTypeBadge
- Type: GMAIL_OAUTH, CUSTOM_SMTP
- Distinguishes configuration method

#### TemplateTypeBadge
- Type: INITIAL, FOLLOWUP_1, FOLLOWUP_2, FINAL
- Color progression from blue → orange → red

#### Specialized Indicators
- `AIEnrichedIndicator`: Shows enrichment status and score
- `RepliedIndicator`: Marks leads with replies
- `InterestedIndicator`: Flags interested leads
- `ActiveIndicator`: Shows active/inactive status

---

### 4. **Stat Card Components** (`src/components/modules/common/StatCard.tsx`)

#### StatCard
Props:
- `title`: Metric name
- `value`: Number or string
- `description`: Optional subtitle
- `trend`: Optional trend indicator (positive/negative)
- `icon`: React node for icon
- `className`: Additional styling

#### InfoCard
Props:
- `title`: Card title
- `items`: Array of {label, value} pairs
- Ideal for detailed information displays

#### StatsGrid
Props:
- `title`, `description`: Grid header
- `columns`: 1-4 column layout
- `gap`: sm/md/lg spacing
- Container component for multiple StatCards

---

## 🔄 Page Implementations

### Leads Page (`src/app/(pages)/leads/page.tsx`)
**Features:**
- Header with search and action buttons
- Overview stats: Total, Contacted, Converted, Replied, AI Enriched
- Advanced filters: Search, Status, AI Enrichment status
- Pagination with page size selector
- Full data table with sorting and selection
- Redux integration with loading states

**Redux Hooks Used:**
- `useGetLeadsQuery`: Fetch paginated leads with filters
- `useCreateLeadMutation`: Dialog integration
- `useDeleteLeadMutation`: Row action integration

### Campaigns Page (`src/app/(pages)/campaigns/page.tsx`)
**Features:**
- Campaign creation dialog
- Overview stats: Total, Active, Draft, Completed
- Status filter dropdown
- Campaigns data table with actions
- Launch/Pause/Resume buttons per campaign status
- Pagination

**Redux Hooks Used:**
- `useGetCampaignsQuery`
- `useCreateCampaignMutation`
- `useLaunchCampaignMutation`
- `usePauseCampaignMutation`
- `useDeleteCampaignMutation`

### Templates Page (`src/app/(pages)/templates/page.tsx`)
**Features:**
- Template creation dialog
- Template type statistics
- Type-based filtering
- Card grid layout (not table)
- Duplicate/Edit/Delete actions
- Subject A/B preview

**Redux Hooks Used:**
- `useGetTemplatesQuery`
- `useCreateTemplateMutation`
- `useDuplicateTemplateMutation`

---

## 🎨 Shadcn UI Components Used

### Core Components
- **Button**: Primary, outline, ghost variants
- **Input**: Text fields with validation
- **Select**: Dropdowns with filterable options
- **Textarea**: Multi-line text input
- **Card**: Container for sections
- **Badge**: Status indicators
- **Checkbox**: Multi-select functionality
- **Dialog**: Modal forms
- **Form**: React Hook Form integration with validation

### Layout Components
- **Table**: TanStack React Table integration
- **Skeleton**: Loading placeholders
- **Separator**: Visual dividers

### Navigation
- **DropdownMenu**: Action menus
- **Tooltip**: Hover information

---

## 📝 Database Model Mapping

### Redux ↔ Prisma Integration

```
Lead (Redux)        → Lead (Prisma)
├── id              → id
├── name            → name
├── email           → email
├── businessName    → businessName
├── businessType    → businessType
├── website         → website
├── country         → country
├── timezone        → timezone
├── status          → status (enum)
├── isActive        → isActive
├── hasReplied      → hasReplied
├── isInterested    → isInterested
├── aiScore         → aiScore
├── aiEnriched      → aiEnriched
├── notes           → notes
└── timestamps      → createdAt, updatedAt

Campaign (Redux)    → Campaign (Prisma)
├── id              → id
├── name            → name
├── status          → status (enum)
├── mailboxId       → mailboxId (FK)
├── templates       → *TemplateId fields
├── sendWindow      → sendWindow
├── timing          → followup*Days fields
├── metrics         → leadCount, sentCount
└── timestamps      → launchedAt, completedAt

Template (Redux)    → Template (Prisma)
├── id              → id
├── name            → name
├── type            → type (enum)
├── subjectA/B      → subjectA, subjectB
├── body            → body
└── relations       → campaign relations
```

---

## 🔧 Form Validation

All forms use **Zod** schemas with **React Hook Form** integration:

```typescript
const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  businessName: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  // ... more fields
});
```

---

## 🚀 Usage Examples

### Creating a Lead
```tsx
import { CreateLeadDialog } from "@/components/modules/leads/CreateLeadDialog";

export default function MyComponent() {
  return <CreateLeadDialog />;
}
```

### Displaying Leads Table
```tsx
import { LeadsTable } from "@/components/modules/leads/LeadsDataTable";
import { useGetLeadsQuery } from "@/redux/hooks";

export default function LeadsView() {
  const { data } = useGetLeadsQuery({ page: 1, limit: 10 });
  return <LeadsTable leads={data?.data || []} />;
}
```

### Status Badge
```tsx
import { LeadStatusBadge } from "@/components/modules/common/StatusBadges";

export default function LeadRow({ lead }) {
  return <LeadStatusBadge status={lead.status} />;
}
```

---

## 📋 Remaining Implementation Checklist

### To Be Implemented:
- [ ] Mailboxes management page with OAuth configuration
- [ ] Email Queue monitoring page
- [ ] Replies/Conversation management page
- [ ] Notification center
- [ ] User profile/settings page
- [ ] Dashboard analytics with charts
- [ ] Bulk import CSV page
- [ ] Edit dialogs for all resources
- [ ] Bulk action dropdowns on tables
- [ ] Advanced filtering with saved filters
- [ ] Export functionality
- [ ] Real-time notifications
- [ ] Email preview templates
- [ ] A/B test results analytics

---

## 🎯 Next Steps

1. **Complete remaining pages**: Mailboxes, Replies, Notifications
2. **Add Edit/Delete modals**: For all resource types
3. **Implement bulk actions**: Multi-select operations
4. **Add dashboard analytics**: Charts and metrics
5. **Email preview**: Template rendering engine
6. **User authentication**: Login/Register/Profile
7. **Settings page**: User preferences and integrations
8. **Export/Import**: CSV functionality

---

## 📚 Resources

- Shadcn UI Docs: https://ui.shadcn.com
- React Hook Form: https://react-hook-form.com
- TanStack React Table: https://tanstack.com/table
- Redux Toolkit: https://redux-toolkit.js.org
- Prisma: https://prisma.io

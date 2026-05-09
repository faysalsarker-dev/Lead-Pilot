# Redux RTK Query Hooks Implementation Guide

## Overview

This document provides a comprehensive guide to all Redux Toolkit Query hooks auto-generated from the API slices for your Next.js backend.

**Total Hooks**: 43 typed hooks across 9 resources
**Location**: `/src/redux/features/[resource]/[resource].api.ts`
**Re-exports**: `/src/redux/hooks.ts`

## Quick Start

### Basic Import Pattern

```typescript
// Option 1: Import from specific resource
import { useGetLeadsQuery, useCreateLeadMutation } from "@/redux/features/leads/leads.api";

// Option 2: Import from unified hooks file (recommended)
import { useGetLeadsQuery, useCreateLeadMutation } from "@/redux/hooks";
```

### Basic Usage Pattern

```typescript
export function LeadsPage() {
  // Query - reads data
  const { data, isLoading, error } = useGetLeadsQuery({
    page: 1,
    limit: 10,
    status: "ACTIVE",
  });

  // Mutation - writes data
  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();

  return (
    <div>
      {isLoading && <p>Loading leads...</p>}
      {data?.data.map((lead) => (
        <div key={lead.id}>{lead.name}</div>
      ))}
      <button
        onClick={() =>
          createLead({
            name: "New Lead",
            email: "lead@example.com",
          })
        }
        disabled={isCreating}
      >
        Create Lead
      </button>
    </div>
  );
}
```

## Resource-by-Resource Hook Reference

---

## 1. Users API (5 hooks)

**File**: `/src/redux/features/users/users.api.ts`

### Queries

#### `useGetUserProfileQuery()`

Fetch current user profile.

```typescript
const { data, isLoading, error } = useGetUserProfileQuery();

// data structure:
// { success: boolean, data: UserProfile }
```

**Use Cases**: Profile page, user settings display

#### `useGetUserSettingsQuery()`

Fetch user preferences and settings.

```typescript
const { data } = useGetUserSettingsQuery();
// { success: boolean, data: UserSettings }
```

#### `useGetUnreadCountQuery()`

Poll unread notifications/messages count (updates every 30 seconds).

```typescript
const { data } = useGetUnreadCountQuery();
// { success: boolean, data: { unreadCount: number } }
```

### Mutations

#### `useUpdateUserProfileMutation()`

Update user profile information.

```typescript
const [updateProfile, { isLoading, error }] =
  useUpdateUserProfileMutation();

// Call mutation
await updateProfile({
  name: "Updated Name",
  bio: "Updated Bio",
});
```

#### `useUpdateUserSettingsMutation()`

Update user settings and preferences.

```typescript
const [updateSettings] = useUpdateUserSettingsMutation();

await updateSettings({
  emailNotifications: true,
  theme: "dark",
});
```

---

## 2. Leads API (6 hooks)

**File**: `/src/redux/features/leads/leads.api.ts`

### Queries

#### `useGetLeadsQuery(params)`

List leads with pagination, filtering, and search.

```typescript
const { data, isLoading, error } = useGetLeadsQuery({
  page: 1,
  limit: 20,
  search: "John", // Search by name/email
  status: "ACTIVE", // Filter by status
  isActive: true, // Filter by active status
  isInterested: true, // Filter by interest
});

// data structure:
// {
//   success: boolean
//   data: Lead[]
//   pagination: {
//     total: number
//     page: number
//     limit: number
//     totalPages: number
//   }
// }
```

**Parameters**:
- `page`: Page number (1-indexed)
- `limit`: Results per page
- `search`: Search term for name/email
- `status`: One of `NEW | CONTACTED | ACTIVE | INTERESTED | CONVERTED | REJECTED`
- `isActive`: Boolean filter
- `isInterested`: Boolean filter
- `aiEnriched`: Boolean filter

#### `useGetLeadQuery(id)`

Fetch single lead details.

```typescript
const { data, isLoading, error } = useGetLeadQuery(leadId);
// data: { data: Lead }
```

### Mutations

#### `useCreateLeadMutation()`

Create a new lead.

```typescript
const [createLead, { isLoading, error }] = useCreateLeadMutation();

await createLead({
  name: "John Doe",
  email: "john@example.com",
  businessName: "Acme Corp",
  website: "https://acme.com",
  country: "US",
  timezone: "EST",
});
```

#### `useUpdateLeadMutation()`

Update an existing lead.

```typescript
const [updateLead] = useUpdateLeadMutation();

await updateLead({
  id: leadId,
  data: {
    status: "CONVERTED",
    isInterested: true,
    notes: "Updated notes",
  },
});
```

#### `useDeleteLeadMutation()`

Delete a lead.

```typescript
const [deleteLead] = useDeleteLeadMutation();
await deleteLead(leadId);
```

#### `useBulkCreateLeadsMutation()`

Bulk import multiple leads at once.

```typescript
const [bulkCreate, { isLoading }] = useBulkCreateLeadsMutation();

await bulkCreate({
  leads: [
    { name: "Lead 1", email: "lead1@example.com" },
    { name: "Lead 2", email: "lead2@example.com" },
    // ... more leads
  ],
});

// Response: { created: 2, failed: 0, leads: [...] }
```

---

## 3. Campaigns API (8 hooks)

**File**: `/src/redux/features/campaigns/campaigns.api.ts`

### Queries

#### `useGetCampaignsQuery(params)`

List campaigns with filtering.

```typescript
const { data } = useGetCampaignsQuery({
  page: 1,
  limit: 10,
  status: "RUNNING", // DRAFT | RUNNING | PAUSED | COMPLETED
  mailboxId: "mailbox-id", // Optional filter
});
```

#### `useGetCampaignQuery(id)`

Fetch campaign details.

```typescript
const { data } = useGetCampaignQuery(campaignId);
```

### Mutations

#### `useCreateCampaignMutation()`

Create a new campaign.

```typescript
const [createCampaign] = useCreateCampaignMutation();

await createCampaign({
  name: "Q4 Outreach",
  mailboxId: "mailbox-id",
  initialTemplateId: "template-1",
  followup1TemplateId: "template-2",
  followup1Days: 3,
  followup2TemplateId: "template-3",
  followup2Days: 7,
  leadIds: ["lead-1", "lead-2"],
});
```

#### `useUpdateCampaignMutation()`

Update campaign details.

```typescript
const [updateCampaign] = useUpdateCampaignMutation();

await updateCampaign({
  id: campaignId,
  data: {
    name: "Updated Name",
    followup1Days: 5,
  },
});
```

#### `useDeleteCampaignMutation()`

Delete a campaign.

```typescript
const [deleteCampaign] = useDeleteCampaignMutation();
await deleteCampaign(campaignId);
```

#### `useLaunchCampaignMutation()`

Launch a campaign (starts email sending).

```typescript
const [launchCampaign, { isLoading }] = useLaunchCampaignMutation();
await launchCampaign(campaignId);
```

#### `usePauseCampaignMutation()`

Pause a running campaign.

```typescript
const [pauseCampaign] = usePauseCampaignMutation();
await pauseCampaign(campaignId);
```

#### `useResumeCampaignMutation()`

Resume a paused campaign.

```typescript
const [resumeCampaign] = useResumeCampaignMutation();
await resumeCampaign(campaignId);
```

---

## 4. Templates API (6 hooks)

**File**: `/src/redux/features/templates/templates.api.ts`

### Queries

#### `useGetTemplatesQuery(params)`

List email templates.

```typescript
const { data } = useGetTemplatesQuery({
  page: 1,
  limit: 20,
  type: "INITIAL", // INITIAL | FOLLOWUP_1 | FOLLOWUP_2 | FINAL
});
```

#### `useGetTemplateQuery(id)`

Fetch template details.

```typescript
const { data } = useGetTemplateQuery(templateId);
```

### Mutations

#### `useCreateTemplateMutation()`

Create a new email template.

```typescript
const [createTemplate] = useCreateTemplateMutation();

await createTemplate({
  name: "Welcome Email",
  type: "INITIAL",
  subjectA: "Subject A/B Test - Variant A",
  subjectB: "Subject A/B Test - Variant B",
  body: "Email body content with {{variables}}",
});
```

#### `useUpdateTemplateMutation()`

Update template.

```typescript
const [updateTemplate] = useUpdateTemplateMutation();

await updateTemplate({
  id: templateId,
  data: {
    subjectA: "Updated subject",
    body: "Updated body",
  },
});
```

#### `useDeleteTemplateMutation()`

Delete template.

```typescript
const [deleteTemplate] = useDeleteTemplateMutation();
await deleteTemplate(templateId);
```

#### `useDuplicateTemplateMutation()`

Clone an existing template.

```typescript
const [duplicateTemplate] = useDuplicateTemplateMutation();

await duplicateTemplate({
  id: templateId,
  data: { name: "Template Copy" },
});
```

---

## 5. Mailboxes API (7 hooks)

**File**: `/src/redux/features/mailboxes/mailboxes.api.ts`

### Queries

#### `useGetMailboxesQuery(params)`

List all connected mailboxes.

```typescript
const { data } = useGetMailboxesQuery({
  page: 1,
  limit: 10,
});
```

#### `useGetMailboxQuery(id)`

Fetch mailbox details.

```typescript
const { data } = useGetMailboxQuery(mailboxId);
```

#### `useGetDefaultMailboxQuery()`

Get the default/primary mailbox.

```typescript
const { data } = useGetDefaultMailboxQuery();
```

### Mutations

#### `useCreateMailboxMutation()`

Connect a new Gmail or SMTP mailbox.

```typescript
// Gmail OAuth
const [createMailbox] = useCreateMailboxMutation();

await createMailbox({
  type: "GMAIL_OAUTH",
  label: "My Gmail Account",
  gmailRefreshToken: "refresh-token-from-oauth",
  isDefault: true,
});

// Or Custom SMTP
await createMailbox({
  type: "CUSTOM_SMTP",
  label: "Company SMTP",
  smtpHost: "smtp.company.com",
  smtpPort: 587,
  smtpUser: "user@company.com",
  smtpPassEnc: "encrypted-password",
});
```

#### `useUpdateMailboxMutation()`

Update mailbox settings.

```typescript
const [updateMailbox] = useUpdateMailboxMutation();

await updateMailbox({
  id: mailboxId,
  data: {
    label: "Updated Label",
    isActive: false,
  },
});
```

#### `useDeleteMailboxMutation()`

Remove a mailbox connection.

```typescript
const [deleteMailbox] = useDeleteMailboxMutation();
await deleteMailbox(mailboxId);
```

#### `useSetDefaultMailboxMutation()`

Set a mailbox as the default.

```typescript
const [setDefault] = useSetDefaultMailboxMutation();
await setDefault(mailboxId);
```

---

## 6. Conversations API (2 hooks)

**File**: `/src/redux/features/conversations/conversations.api.ts`

### Queries

#### `useGetConversationQuery(leadId)`

Fetch email conversation history with a lead.

```typescript
const { data } = useGetConversationQuery(leadId);

// data.data structure:
// {
//   id: string
//   leadId: string
//   messages: Array<{
//     role: "user" | "lead"
//     body: string
//     subject?: string
//     sentAt: string
//   }>
//   createdAt: string
//   updatedAt: string
// }
```

### Mutations

#### `useAddMessageMutation()`

Add a message to conversation.

```typescript
const [addMessage] = useAddMessageMutation();

await addMessage({
  leadId: leadId,
  data: {
    role: "user",
    body: "Message content",
    subject: "Reply",
  },
});
```

---

## 7. Replies API (6 hooks)

**File**: `/src/redux/features/replies/replies.api.ts`

### Queries

#### `useGetRepliesQuery(params)`

List incoming email replies.

```typescript
const { data } = useGetRepliesQuery({
  page: 1,
  limit: 20,
  leadId: "optional-lead-filter",
  mailboxId: "optional-mailbox-filter",
  isRead: false, // Show unread only
});
```

#### `useGetReplyQuery(id)`

Fetch single reply details.

```typescript
const { data } = useGetReplyQuery(replyId);
```

### Mutations

#### `useCreateReplyMutation()`

Save an incoming reply.

```typescript
const [createReply] = useCreateReplyMutation();

await createReply({
  leadId: "lead-id",
  mailboxId: "mailbox-id",
  fromEmail: "lead@example.com",
  subject: "Re: Your Message",
  body: "Reply content",
  receivedAt: new Date().toISOString(),
});
```

#### `useUpdateReplyMutation()`

Update reply status.

```typescript
const [updateReply] = useUpdateReplyMutation();

await updateReply({
  id: replyId,
  data: { isRead: true },
});
```

#### `useDeleteReplyMutation()`

Delete a reply.

```typescript
const [deleteReply] = useDeleteReplyMutation();
await deleteReply(replyId);
```

#### `useMarkReplyAsReadMutation()`

Mark reply as read.

```typescript
const [markAsRead] = useMarkReplyAsReadMutation();
await markAsRead(replyId);
```

---

## 8. Notifications API (7 hooks)

**File**: `/src/redux/features/notifications/notifications.api.ts`

### Queries

#### `useGetNotificationsQuery(params)`

List notifications (auto-polls every 30 seconds).

```typescript
const { data } = useGetNotificationsQuery({
  page: 1,
  limit: 10,
  type: "REPLY_RECEIVED", // Filter by type
  isRead: false, // Unread only
});

// Notification types:
// - REPLY_RECEIVED
// - FOLLOWUP_SENT
// - CAMPAIGN_COMPLETED
// - LEAD_BOUNCED
// - CAMPAIGN_PAUSED
// - AI_ENRICHMENT_DONE
```

#### `useGetNotificationQuery(id)`

Fetch single notification.

```typescript
const { data } = useGetNotificationQuery(notificationId);
```

#### `useGetNotificationsUnreadCountQuery()`

Get count of unread notifications (auto-polls every 30 seconds).

```typescript
const { data } = useGetNotificationsUnreadCountQuery();
// data.data.count: number
```

### Mutations

#### `useMarkAsReadMutation()`

Mark notification as read.

```typescript
const [markAsRead] = useMarkAsReadMutation();
await markAsRead(notificationId);
```

#### `useMarkAllAsReadMutation()`

Mark all notifications as read.

```typescript
const [markAllAsRead] = useMarkAllAsReadMutation();
await markAllAsRead();
```

#### `useDeleteNotificationMutation()`

Delete notification.

```typescript
const [deleteNotification] = useDeleteNotificationMutation();
await deleteNotification(notificationId);
```

#### `useDeleteAllNotificationsMutation()`

Clear all notifications.

```typescript
const [deleteAll] = useDeleteAllNotificationsMutation();
await deleteAll();
```

---

## 9. Email Queue API (5 hooks)

**File**: `/src/redux/features/email-queue/email-queue.api.ts`

### Queries

#### `useGetQueueItemsQuery(params)`

List queued/sent emails (auto-polls every 30 seconds).

```typescript
const { data } = useGetQueueItemsQuery({
  page: 1,
  limit: 50,
  campaignId: "optional-filter",
  leadId: "optional-filter",
  status: "PENDING", // PENDING | SENT | FAILED
});
```

#### `useGetQueueStatsQuery()`

Get queue statistics (auto-polls every 30 seconds).

```typescript
const { data } = useGetQueueStatsQuery();

// data.data structure:
// {
//   total: number
//   pending: number
//   sent: number
//   failed: number
// }
```

#### `useGetQueueItemQuery(id)`

Fetch queue item details.

```typescript
const { data } = useGetQueueItemQuery(queueItemId);
```

### Mutations

#### `useMarkAsSentMutation()`

Mark email as sent (remove from queue).

```typescript
const [markSent] = useMarkAsSentMutation();
await markSent(queueItemId);
```

#### `useMarkAsFailedMutation()`

Mark email as failed with error reason.

```typescript
const [markFailed] = useMarkAsFailedMutation();

await markFailed({
  id: queueItemId,
  reason: "Email address bounced",
});
```

---

## Advanced Usage Patterns

### 1. Conditional Queries

Skip querying based on conditions:

```typescript
const { data: leads } = useGetLeadsQuery(
  { page: 1, limit: 10 },
  { skip: !isUserLoggedIn } // Skip if condition false
);
```

### 2. Polling

Queries with `pollingIntervalMs` auto-poll:

```typescript
// This auto-polls every 30 seconds
const { data: stats } = useGetQueueStatsQuery();

// Start/stop polling programmatically
const { data, startPolling, stopPolling } = useGetLeadsQuery({});

useEffect(() => {
  startPolling(5000); // Poll every 5 seconds
  return () => stopPolling();
}, [startPolling, stopPolling]);
```

### 3. Error Handling

```typescript
const { data, isLoading, error, isError } = useGetLeadsQuery({ page: 1 });

if (isError) {
  return (
    <div className="error">
      {error?.data?.message || "Failed to load leads"}
    </div>
  );
}
```

### 4. Mutation with Callbacks

```typescript
const [createLead, { isLoading, error }] = useCreateLeadMutation();

const handleCreate = async (leadData) => {
  try {
    const result = await createLead(leadData).unwrap();
    console.log("Lead created:", result.data);
    // Cache automatically invalidates, data refetches
  } catch (err) {
    console.error("Failed to create:", err);
  }
};
```

### 5. Optimistic Updates

```typescript
const [updateLead] = useUpdateLeadMutation();
const { data: lead } = useGetLeadQuery(leadId);

const handleUpdate = (newStatus) => {
  updateLead({
    id: leadId,
    data: { status: newStatus },
  });
  // Optimistically update UI immediately
  // RTK handles re-sync when server responds
};
```

---

## Cache Invalidation Strategy

All hooks automatically handle cache invalidation using tags:

**Resource Tags** (auto-invalidated):
- `"Users"` - User profile/settings queries
- `"Leads"` - All lead queries
- `"Campaigns"` - All campaign queries
- `"Templates"` - All template queries
- `"Mailboxes"` - All mailbox queries
- `"Conversations"` - Conversation queries
- `"Replies"` - All reply queries
- `"Notifications"` - All notification queries
- `"EmailQueue"` - All queue queries

**Specific ID Tags**:
- `{ type: "Leads", id: "lead-123" }` - Single lead cache
- `{ type: "Campaigns", id: "campaign-456" }` - Single campaign cache

**Example**: When you create a lead:
1. `useCreateLeadMutation()` automatically invalidates `["Leads"]` tag
2. All `useGetLeadsQuery()` instances automatically refetch
3. UI updates with new data

---

## TypeScript Support

All hooks are fully typed with TypeScript:

```typescript
// Request type
interface CreateLeadRequest {
  name: string;
  email: string;
  // ...
}

// Response type
interface Lead {
  id: string;
  name: string;
  // ...
}

// Usage with full type safety
const [createLead] = useCreateLeadMutation();
// Hover over createLead parameter - full type hints!
await createLead({ name: "John" }); // Type error: missing email
```

---

## Common Patterns

### Loading State UI

```typescript
function LeadsPage() {
  const { data, isLoading, isFetching } = useGetLeadsQuery({ page: 1 });

  return (
    <div>
      {isLoading && <Skeleton />}
      {isFetching && !isLoading && <Spinner />} // Refetching
      {data?.data.map((lead) => (...))}
    </div>
  );
}
```

### Form Integration

```typescript
function CreateLeadForm() {
  const [createLead, { isLoading }] = useCreateLeadMutation();
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    createLead(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Lead"}
      </button>
    </form>
  );
}
```

### Pagination

```typescript
function LeadsTable() {
  const [page, setPage] = useState(1);
  const { data } = useGetLeadsQuery({ page, limit: 20 });

  return (
    <div>
      {/* Table */}
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <span>{page} of {data?.pagination.totalPages}</span>
      <button
        onClick={() => setPage(page + 1)}
        disabled={page === data?.pagination.totalPages}
      >
        Next
      </button>
    </div>
  );
}
```

---

## Testing Hooks

Use RTK Query test utilities:

```typescript
import { setupServer } from "msw/node";
import { renderHook, waitFor } from "@testing-library/react";

const server = setupServer(
  rest.get("/leads", (req, res, ctx) =>
    res(
      ctx.json({
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      })
    )
  )
);

test("fetches leads", async () => {
  const { result } = renderHook(() => useGetLeadsQuery({ page: 1 }), {
    wrapper: StoreProvider,
  });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
});
```

---

## Troubleshooting

### Hook not returning data

```typescript
// Check if query is skipped
const { data, isLoading } = useGetLeadsQuery({ page: 1 });

// Verify endpoint exists in backend
// Check browser Network tab for request/response
// Check Redux DevTools for action history
```

### Mutation not working

```typescript
const [createLead, { error }] = useCreateLeadMutation();

// Check error object
console.log(error); // { status: 400, data: { message: "..." } }

// Verify POST endpoint exists
// Check request payload shape
```

### Cache not updating

```typescript
// Force refetch
const { refetch } = useGetLeadsQuery({ page: 1 });
refetch();

// Or in mutation callback
const { unwrap } = await createLead(data);
// RTK auto-invalidates on success
```

---

## Next Steps

1. **Install Hooks in Components**: Start using these hooks in React components
2. **Handle Loading States**: Add loading skeletons and spinners
3. **Error Boundaries**: Wrap components with error handling
4. **Build UI Forms**: Integrate mutations with form libraries (React Hook Form, Formik)
5. **Optimize Performance**: Use `skip`, conditional queries, and selective subscriptions

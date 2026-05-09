# Redux Hooks Cheat Sheet

Quick reference for all 43 hooks across 9 resources.

## Import Pattern

```typescript
import {
  // Any of these hooks
  useGetLeadsQuery,
  useCreateLeadMutation,
  // ... etc
} from "@/redux/hooks";
```

---

## Users (5 hooks)

| Hook | Type | Purpose |
|------|------|---------|
| `useGetUserProfileQuery()` | Query | Get current user |
| `useGetUserSettingsQuery()` | Query | Get user preferences |
| `useGetUnreadCountQuery()` | Query | Poll unread count (30s) |
| `useUpdateUserProfileMutation()` | Mutation | Update profile |
| `useUpdateUserSettingsMutation()` | Mutation | Update settings |

**Example:**
```typescript
const { data: profile } = useGetUserProfileQuery();
const [updateProfile] = useUpdateUserProfileMutation();
```

---

## Leads (6 hooks)

| Hook | Type | Purpose |
|------|------|---------|
| `useGetLeadsQuery(params)` | Query | List leads (paginated, filterable) |
| `useGetLeadQuery(id)` | Query | Get single lead |
| `useCreateLeadMutation()` | Mutation | Create lead |
| `useUpdateLeadMutation()` | Mutation | Update lead |
| `useDeleteLeadMutation()` | Mutation | Delete lead |
| `useBulkCreateLeadsMutation()` | Mutation | Bulk import leads |

**Example:**
```typescript
const { data: leads } = useGetLeadsQuery({ page: 1, limit: 10, status: "ACTIVE" });
const [createLead] = useCreateLeadMutation();
const [deleteLead] = useDeleteLeadMutation();
```

---

## Campaigns (8 hooks)

| Hook | Type | Purpose |
|------|------|---------|
| `useGetCampaignsQuery(params)` | Query | List campaigns |
| `useGetCampaignQuery(id)` | Query | Get campaign details |
| `useCreateCampaignMutation()` | Mutation | Create campaign |
| `useUpdateCampaignMutation()` | Mutation | Update campaign |
| `useDeleteCampaignMutation()` | Mutation | Delete campaign |
| `useLaunchCampaignMutation()` | Mutation | Launch campaign (start sending) |
| `usePauseCampaignMutation()` | Mutation | Pause campaign |
| `useResumeCampaignMutation()` | Mutation | Resume campaign |

**Example:**
```typescript
const { data: campaigns } = useGetCampaignsQuery({ status: "RUNNING" });
const [launchCampaign] = useLaunchCampaignMutation();
const [pauseCampaign] = usePauseCampaignMutation();
```

---

## Templates (6 hooks)

| Hook | Type | Purpose |
|------|------|---------|
| `useGetTemplatesQuery(params)` | Query | List templates |
| `useGetTemplateQuery(id)` | Query | Get template details |
| `useCreateTemplateMutation()` | Mutation | Create template |
| `useUpdateTemplateMutation()` | Mutation | Update template |
| `useDeleteTemplateMutation()` | Mutation | Delete template |
| `useDuplicateTemplateMutation()` | Mutation | Clone template |

**Example:**
```typescript
const { data: templates } = useGetTemplatesQuery({ type: "INITIAL" });
const [createTemplate] = useCreateTemplateMutation();
```

---

## Mailboxes (7 hooks)

| Hook | Type | Purpose |
|------|------|---------|
| `useGetMailboxesQuery(params)` | Query | List mailboxes |
| `useGetMailboxQuery(id)` | Query | Get mailbox details |
| `useGetDefaultMailboxQuery()` | Query | Get default mailbox |
| `useCreateMailboxMutation()` | Mutation | Connect new mailbox |
| `useUpdateMailboxMutation()` | Mutation | Update mailbox |
| `useDeleteMailboxMutation()` | Mutation | Remove mailbox |
| `useSetDefaultMailboxMutation()` | Mutation | Set default mailbox |

**Example:**
```typescript
const { data: mailboxes } = useGetMailboxesQuery({});
const [createMailbox] = useCreateMailboxMutation();
const { data: defaultBox } = useGetDefaultMailboxQuery();
```

---

## Conversations (2 hooks)

| Hook | Type | Purpose |
|------|------|---------|
| `useGetConversationQuery(leadId)` | Query | Get email thread with lead |
| `useAddMessageMutation()` | Mutation | Add message to conversation |

**Example:**
```typescript
const { data: conv } = useGetConversationQuery(leadId);
const [addMessage] = useAddMessageMutation();
```

---

## Replies (6 hooks)

| Hook | Type | Purpose |
|------|------|---------|
| `useGetRepliesQuery(params)` | Query | List incoming replies |
| `useGetReplyQuery(id)` | Query | Get reply details |
| `useCreateReplyMutation()` | Mutation | Save incoming reply |
| `useUpdateReplyMutation()` | Mutation | Update reply |
| `useDeleteReplyMutation()` | Mutation | Delete reply |
| `useMarkReplyAsReadMutation()` | Mutation | Mark as read |

**Example:**
```typescript
const { data: replies } = useGetRepliesQuery({ isRead: false });
const [markAsRead] = useMarkReplyAsReadMutation();
```

---

## Notifications (7 hooks)

| Hook | Type | Purpose |
|------|------|---------|
| `useGetNotificationsQuery(params)` | Query | List notifications (polls 30s) |
| `useGetNotificationQuery(id)` | Query | Get notification details |
| `useGetNotificationsUnreadCountQuery()` | Query | Get unread count (polls 30s) |
| `useMarkAsReadMutation()` | Mutation | Mark as read |
| `useMarkAllAsReadMutation()` | Mutation | Mark all as read |
| `useDeleteNotificationMutation()` | Mutation | Delete notification |
| `useDeleteAllNotificationsMutation()` | Mutation | Clear all |

**Example:**
```typescript
const { data: notifs } = useGetNotificationsQuery({ isRead: false });
const { data: count } = useGetNotificationsUnreadCountQuery();
const [markAsRead] = useMarkAsReadMutation();
```

---

## Email Queue (5 hooks)

| Hook | Type | Purpose |
|------|------|---------|
| `useGetQueueItemsQuery(params)` | Query | List queued emails (polls 30s) |
| `useGetQueueStatsQuery()` | Query | Get queue stats (polls 30s) |
| `useGetQueueItemQuery(id)` | Query | Get queue item details |
| `useMarkAsSentMutation()` | Mutation | Mark as sent |
| `useMarkAsFailedMutation()` | Mutation | Mark as failed |

**Example:**
```typescript
const { data: stats } = useGetQueueStatsQuery();
const { data: queue } = useGetQueueItemsQuery({ status: "PENDING" });
const [markSent] = useMarkAsSentMutation();
```

---

## Query Result Shape

All queries return:
```typescript
{
  data: T,                          // Response data (undefined if loading)
  isLoading: boolean,               // First load
  isFetching: boolean,              // Any fetch (including refetch)
  isSuccess: boolean,               // Query succeeded
  isError: boolean,                 // Query failed
  error: any,                       // Error details
  refetch: () => void,              // Manual refetch
  startPolling: (interval) => void, // Start auto-poll
  stopPolling: () => void,          // Stop auto-poll
}
```

---

## Mutation Result Shape

All mutations return array: `[trigger, result]`

```typescript
// trigger = function to invoke mutation
// result = status object
{
  isLoading: boolean,               // Mutation in progress
  isSuccess: boolean,               // Mutation succeeded
  isError: boolean,                 // Mutation failed
  error: any,                       // Error details
  data: T,                          // Response data
}

// Usage
const [createLead, { isLoading, error }] = useCreateLeadMutation();
await createLead(data).unwrap();    // Returns data or throws
```

---

## Tag Invalidation

When mutations succeed, these tags are auto-invalidated:

| Mutation | Invalidates |
|----------|-------------|
| Create/Update/Delete Lead | `Leads` tag + specific ID |
| Create/Update/Delete Campaign | `Campaigns` tag + `EmailQueue` |
| Create/Update/Delete Template | `Templates` tag + `Campaigns` |
| Create/Update/Delete Mailbox | `Mailboxes` tag |
| Create/Update/Delete Reply | `Replies` tag + `Conversations` |
| Mark Notification as Read | `Notifications` tag |
| Mark Email as Sent/Failed | `EmailQueue` tag |

---

## Common Patterns

### Fetch on Mount
```typescript
const { data, isLoading } = useGetLeadsQuery({ page: 1 });
```

### Conditional Fetch
```typescript
const { data } = useGetLeadsQuery({ page: 1 }, { skip: !userId });
```

### Auto-Polling
```typescript
// These auto-poll every 30s
useGetNotificationsQuery({});
useGetQueueStatsQuery();
useGetUnreadCountQuery();
```

### Manual Refetch
```typescript
const { refetch } = useGetLeadsQuery({ page: 1 });
refetch();
```

### Mutation with Success Handler
```typescript
const [createLead] = useCreateLeadMutation();

try {
  const result = await createLead(data).unwrap();
  console.log("Success:", result.data);
} catch (error) {
  console.error("Failed:", error);
}
```

### Optimistic Update
```typescript
const [updateLead] = useUpdateLeadMutation();

// Mutation auto-invalidates and refetches
updateLead({ id, data: { status: "CONVERTED" } });
```

---

## Response Format

All endpoints follow this pattern:

**GET List (Query)**
```typescript
{
  success: boolean,
  data: T[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

**GET Single (Query)**
```typescript
{
  data: T
}
```

**POST/PUT/DELETE (Mutation)**
```typescript
{
  success: boolean,
  data: T | { created: number, failed: number, ... }
}
```

---

## Error Handling

```typescript
try {
  await createLead(data).unwrap();
} catch (error) {
  // error.status: HTTP status code
  // error.data: Server error response
  // error.data.message: Error message
}

// Or with state
const [createLead, { error }] = useCreateLeadMutation();
if (error) {
  console.log(error.data?.message);
}
```

---

## Performance Tips

1. **Use specific IDs** in `providesTags` to avoid full cache invalidation
2. **Conditional queries** with `skip: true` to avoid unnecessary requests
3. **Pagination** to limit data per request
4. **Selective polling** - only poll when needed
5. **Mutation `unwrap()`** for proper error handling in async flows

---

## Files Location

- **Base API**: `/src/redux/baseApi.ts`
- **Hooks Export**: `/src/redux/hooks.ts`
- **User API**: `/src/redux/features/users/users.api.ts`
- **Leads API**: `/src/redux/features/leads/leads.api.ts`
- **Campaigns API**: `/src/redux/features/campaigns/campaigns.api.ts`
- **Templates API**: `/src/redux/features/templates/templates.api.ts`
- **Mailboxes API**: `/src/redux/features/mailboxes/mailboxes.api.ts`
- **Conversations API**: `/src/redux/features/conversations/conversations.api.ts`
- **Replies API**: `/src/redux/features/replies/replies.api.ts`
- **Notifications API**: `/src/redux/features/notifications/notifications.api.ts`
- **Email Queue API**: `/src/redux/features/email-queue/email-queue.api.ts`

---

## Full Guide

For detailed examples and advanced patterns, see: [REDUX_HOOKS_GUIDE.md](REDUX_HOOKS_GUIDE.md)

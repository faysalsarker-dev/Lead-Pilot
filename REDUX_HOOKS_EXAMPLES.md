# Redux Hooks Implementation Examples

Complete, working examples of React components using all Redux hooks.

## Table of Contents

1. [Users Components](#users-components)
2. [Leads Components](#leads-components)
3. [Campaigns Components](#campaigns-components)
4. [Templates Components](#templates-components)
5. [Mailboxes Components](#mailboxes-components)
6. [Conversations Components](#conversations-components)
7. [Replies Components](#replies-components)
8. [Notifications Components](#notifications-components)
9. [Email Queue Components](#email-queue-components)

---

## Users Components

### User Profile Display

```typescript
import React from "react";
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "@/redux/hooks";

export function UserProfile() {
  const { data: profile, isLoading, error } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (profile?.data) {
      setName(profile.data.name);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({ name }).unwrap();
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Error loading profile</div>;

  return (
    <div className="profile-card">
      <h2>User Profile</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleSave} disabled={isUpdating}>
        {isUpdating ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
```

### Unread Notification Badge

```typescript
import { useGetUnreadCountQuery } from "@/redux/hooks";

export function NotificationBadge() {
  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.data?.unreadCount || 0;

  return (
    <div className="badge">
      {unreadCount > 0 && (
        <span className="badge-number">{unreadCount}</span>
      )}
      <i className="bell-icon" />
    </div>
  );
}
```

---

## Leads Components

### Leads List with Pagination

```typescript
import React from "react";
import { useGetLeadsQuery, useDeleteLeadMutation } from "@/redux/hooks";

export function LeadsList() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, error } = useGetLeadsQuery({
    page,
    limit: 20,
    status: "ACTIVE",
  });
  const [deleteLead] = useDeleteLeadMutation();

  const handleDelete = async (id: string) => {
    if (confirm("Delete this lead?")) {
      try {
        await deleteLead(id).unwrap();
        alert("Lead deleted");
      } catch (err) {
        alert("Failed to delete lead");
      }
    }
  };

  if (isLoading) return <div>Loading leads...</div>;
  if (error) return <div>Error loading leads</div>;

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.status}</td>
              <td>
                <button onClick={() => handleDelete(lead.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {data?.pagination.page} of {data?.pagination.totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === data?.pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Create Lead Form

```typescript
import React from "react";
import { useCreateLeadMutation } from "@/redux/hooks";

export function CreateLeadForm() {
  const [createLead, { isLoading, error }] = useCreateLeadMutation();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    businessName: "",
    website: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead(formData).unwrap();
      alert("Lead created successfully!");
      setFormData({ name: "", email: "", businessName: "", website: "" });
    } catch (err) {
      alert("Failed to create lead");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Business Name</label>
        <input
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Website</label>
        <input
          name="website"
          value={formData.website}
          onChange={handleChange}
        />
      </div>
      {error && <div className="error">{error?.data?.message}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Lead"}
      </button>
    </form>
  );
}
```

### Bulk Import Leads

```typescript
import React from "react";
import { useBulkCreateLeadsMutation } from "@/redux/hooks";

export function BulkImportLeads() {
  const [bulkCreate, { isLoading, error }] = useBulkCreateLeadsMutation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Parse CSV or JSON
    const text = await file.text();
    const leads = JSON.parse(text); // Assuming JSON format

    try {
      const result = await bulkCreate({ leads }).unwrap();
      alert(`Created: ${result.data.created}, Failed: ${result.data.failed}`);
    } catch (err) {
      alert("Bulk import failed");
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleFileUpload}
        disabled={isLoading}
      />
      {isLoading && <p>Importing leads...</p>}
      {error && <p className="error">Import failed</p>}
    </div>
  );
}
```

---

## Campaigns Components

### Campaigns Dashboard

```typescript
import React from "react";
import {
  useGetCampaignsQuery,
  useLaunchCampaignMutation,
  usePauseCampaignMutation,
} from "@/redux/hooks";

export function CampaignsDashboard() {
  const [status, setStatus] = React.useState<"DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED">(
    "RUNNING"
  );
  const { data: campaigns, isLoading } = useGetCampaignsQuery({ status });
  const [launchCampaign] = useLaunchCampaignMutation();
  const [pauseCampaign] = usePauseCampaignMutation();

  const handleLaunch = async (id: string) => {
    try {
      await launchCampaign(id).unwrap();
      alert("Campaign launched!");
    } catch (err) {
      alert("Failed to launch campaign");
    }
  };

  const handlePause = async (id: string) => {
    try {
      await pauseCampaign(id).unwrap();
      alert("Campaign paused");
    } catch (err) {
      alert("Failed to pause campaign");
    }
  };

  return (
    <div>
      <div className="tabs">
        {["DRAFT", "RUNNING", "PAUSED", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s as any)}
            className={status === s ? "active" : ""}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && <p>Loading campaigns...</p>}

      <div className="campaign-grid">
        {campaigns?.data.map((campaign) => (
          <div key={campaign.id} className="campaign-card">
            <h3>{campaign.name}</h3>
            <p>Sent: {campaign.sentCount} / {campaign.leadCount}</p>
            <div className="actions">
              {campaign.status === "DRAFT" && (
                <button onClick={() => handleLaunch(campaign.id)}>
                  Launch
                </button>
              )}
              {campaign.status === "RUNNING" && (
                <button onClick={() => handlePause(campaign.id)}>
                  Pause
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Templates Components

### Templates Library

```typescript
import React from "react";
import {
  useGetTemplatesQuery,
  useDeleteTemplateMutation,
  useDuplicateTemplateMutation,
} from "@/redux/hooks";

export function TemplatesLibrary() {
  const [type, setType] = React.useState<string | undefined>(undefined);
  const { data: templates, isLoading } = useGetTemplatesQuery({
    page: 1,
    limit: 50,
    type: type as any,
  });
  const [deleteTemplate] = useDeleteTemplateMutation();
  const [duplicateTemplate] = useDuplicateTemplateMutation();

  const handleDelete = async (id: string) => {
    if (confirm("Delete template?")) {
      try {
        await deleteTemplate(id).unwrap();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    try {
      await duplicateTemplate({
        id,
        data: { name: `${name} (Copy)` },
      }).unwrap();
      alert("Template duplicated!");
    } catch (err) {
      alert("Failed to duplicate");
    }
  };

  return (
    <div>
      <select value={type || ""} onChange={(e) => setType(e.target.value || undefined)}>
        <option value="">All Types</option>
        <option value="INITIAL">Initial</option>
        <option value="FOLLOWUP_1">Followup 1</option>
        <option value="FOLLOWUP_2">Followup 2</option>
        <option value="FINAL">Final</option>
      </select>

      {isLoading && <p>Loading templates...</p>}

      <div className="template-grid">
        {templates?.data.map((template) => (
          <div key={template.id} className="template-card">
            <h4>{template.name}</h4>
            <p>Type: {template.type}</p>
            <p>Subject: {template.subjectA}</p>
            <div className="actions">
              <button onClick={() => handleDuplicate(template.id, template.name)}>
                Duplicate
              </button>
              <button onClick={() => handleDelete(template.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Mailboxes Components

### Mailbox Manager

```typescript
import React from "react";
import {
  useGetMailboxesQuery,
  useGetDefaultMailboxQuery,
  useSetDefaultMailboxMutation,
  useDeleteMailboxMutation,
} from "@/redux/hooks";

export function MailboxManager() {
  const { data: mailboxes, isLoading } = useGetMailboxesQuery({});
  const { data: defaultBox } = useGetDefaultMailboxQuery();
  const [setDefault] = useSetDefaultMailboxMutation();
  const [deleteMailbox] = useDeleteMailboxMutation();

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault(id).unwrap();
      alert("Default mailbox updated");
    } catch (err) {
      alert("Failed to set default");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete mailbox?")) {
      try {
        await deleteMailbox(id).unwrap();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  return (
    <div>
      <h2>Connected Mailboxes</h2>
      {isLoading && <p>Loading...</p>}

      <div className="mailbox-list">
        {mailboxes?.data.map((mailbox) => (
          <div key={mailbox.id} className="mailbox-item">
            <div>
              <h4>{mailbox.label}</h4>
              <p>{mailbox.email || "SMTP"}</p>
              {defaultBox?.data.id === mailbox.id && (
                <span className="badge">Default</span>
              )}
            </div>
            <div className="actions">
              <button onClick={() => handleSetDefault(mailbox.id)}>
                Set Default
              </button>
              <button onClick={() => handleDelete(mailbox.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Conversations Components

### Email Thread View

```typescript
import React from "react";
import {
  useGetConversationQuery,
  useAddMessageMutation,
} from "@/redux/hooks";

export function ConversationView({ leadId }: { leadId: string }) {
  const { data: conversation, isLoading } = useGetConversationQuery(leadId);
  const [addMessage, { isLoading: isSending }] = useAddMessageMutation();
  const [messageBody, setMessageBody] = React.useState("");

  const handleSendMessage = async () => {
    if (!messageBody.trim()) return;

    try {
      await addMessage({
        leadId,
        data: {
          role: "user",
          body: messageBody,
        },
      }).unwrap();
      setMessageBody("");
    } catch (err) {
      alert("Failed to send message");
    }
  };

  if (isLoading) return <div>Loading conversation...</div>;

  return (
    <div className="conversation">
      <div className="messages">
        {conversation?.data.messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            <p className="sender">{msg.role === "user" ? "You" : "Lead"}</p>
            <p className="body">{msg.body}</p>
            <span className="timestamp">
              {new Date(msg.sentAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="compose">
        <textarea
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder="Write your message..."
          rows={4}
        />
        <button onClick={handleSendMessage} disabled={isSending}>
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
```

---

## Replies Components

### Inbox View

```typescript
import React from "react";
import {
  useGetRepliesQuery,
  useMarkReplyAsReadMutation,
} from "@/redux/hooks";

export function RepliesInbox() {
  const { data: replies, isLoading } = useGetRepliesQuery({
    page: 1,
    limit: 20,
    isRead: false, // Show unread only
  });
  const [markAsRead] = useMarkReplyAsReadMutation();

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch (err) {
      alert("Failed to mark as read");
    }
  };

  if (isLoading) return <div>Loading replies...</div>;

  return (
    <div className="inbox">
      <h2>Inbox ({replies?.data.length} unread)</h2>

      <div className="reply-list">
        {replies?.data.map((reply) => (
          <div
            key={reply.id}
            className={`reply-item ${reply.isRead ? "read" : "unread"}`}
          >
            <h4>{reply.subject}</h4>
            <p className="from">From: {reply.fromEmail}</p>
            <p className="preview">{reply.body.substring(0, 100)}...</p>
            <button onClick={() => handleMarkRead(reply.id)}>
              {reply.isRead ? "Unread" : "Mark as Read"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Notifications Components

### Notification Center

```typescript
import React from "react";
import {
  useGetNotificationsQuery,
  useGetNotificationsUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/redux/hooks";

export function NotificationCenter() {
  const { data: notifications, isLoading } = useGetNotificationsQuery({
    page: 1,
    limit: 10,
    isRead: false,
  });
  const { data: unreadCount } = useGetNotificationsUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch (err) {
      alert("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (err) {
      alert("Failed to mark all as read");
    }
  };

  return (
    <div className="notification-panel">
      <div className="header">
        <h3>Notifications ({unreadCount?.data.count || 0})</h3>
        <button onClick={handleMarkAllAsRead}>Mark all as read</button>
      </div>

      {isLoading && <p>Loading notifications...</p>}

      <div className="notification-list">
        {notifications?.data.map((notif) => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            <h4>{notif.title}</h4>
            <p>{notif.message}</p>
            <button onClick={() => handleMarkAsRead(notif.id)}>
              Mark as Read
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Email Queue Components

### Queue Monitor

```typescript
import React from "react";
import {
  useGetQueueStatsQuery,
  useGetQueueItemsQuery,
  useMarkAsSentMutation,
  useMarkAsFailedMutation,
} from "@/redux/hooks";

export function EmailQueueMonitor() {
  const { data: stats, isLoading: statsLoading } = useGetQueueStatsQuery();
  const { data: queueItems } = useGetQueueItemsQuery({
    page: 1,
    limit: 50,
    status: "PENDING",
  });
  const [markSent] = useMarkAsSentMutation();
  const [markFailed] = useMarkAsFailedMutation();

  const handleMarkSent = async (id: string) => {
    try {
      await markSent(id).unwrap();
    } catch (err) {
      alert("Failed to mark as sent");
    }
  };

  const handleMarkFailed = async (id: string) => {
    try {
      await markFailed({
        id,
        reason: "Manual failure mark",
      }).unwrap();
    } catch (err) {
      alert("Failed to mark as failed");
    }
  };

  if (statsLoading) return <div>Loading queue...</div>;

  return (
    <div className="queue-monitor">
      <div className="stats">
        <div className="stat-card">
          <h3>Total</h3>
          <p className="number">{stats?.data.total}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="number">{stats?.data.pending}</p>
        </div>
        <div className="stat-card">
          <h3>Sent</h3>
          <p className="number">{stats?.data.sent}</p>
        </div>
        <div className="stat-card">
          <h3>Failed</h3>
          <p className="number">{stats?.data.failed}</p>
        </div>
      </div>

      <h3>Pending Emails</h3>
      <table>
        <thead>
          <tr>
            <th>To</th>
            <th>Subject</th>
            <th>Scheduled For</th>
            <th>Attempts</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {queueItems?.data.map((item) => (
            <tr key={item.id}>
              <td>{item.toEmail}</td>
              <td>{item.subject}</td>
              <td>{new Date(item.scheduledFor).toLocaleString()}</td>
              <td>{item.attemptCount}</td>
              <td>
                <button onClick={() => handleMarkSent(item.id)}>
                  Sent
                </button>
                <button onClick={() => handleMarkFailed(item.id)}>
                  Failed
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Tips for Implementation

1. **Always handle loading states** - Show spinners or skeletons
2. **Always handle errors** - Display error messages to users
3. **Use `.unwrap()`** in async/await to throw on errors
4. **Leverage auto-invalidation** - Don't manually refetch
5. **Type your hooks** - Full TypeScript support available
6. **Use conditional queries** - Skip queries with `skip: true`
7. **Optimize polling** - Only use where necessary (notifications, queue)

---

## Testing Tips

Mock RTK Query in tests:

```typescript
import { setupServer } from "msw/node";
import { rest } from "msw";

const server = setupServer(
  rest.get("/leads", (req, res, ctx) =>
    res(
      ctx.json({
        success: true,
        data: [{ id: "1", name: "Test Lead", email: "test@example.com" }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      })
    )
  )
);

// Use in your test setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

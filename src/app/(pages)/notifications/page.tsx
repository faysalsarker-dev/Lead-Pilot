"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  useGetNotificationsQuery,
  useGetNotificationsUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} from "@/redux/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  MessageSquare,
  Target,
  TrendingUp,
  Trash2,
  MoreVertical,
  Mail,
  Clock,
  Filter,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type NotificationType = "REPLY_RECEIVED" | "FOLLOWUP_SENT" | "CAMPAIGN_COMPLETED" | "LEAD_BOUNCED" | "CAMPAIGN_PAUSED" | "AI_ENRICHMENT_DONE";

function getTypeIcon(type: NotificationType) {
  const icons: Record<NotificationType, JSX.Element> = {
    REPLY_RECEIVED: <MessageSquare className="h-4 w-4" />,
    FOLLOWUP_SENT: <Mail className="h-4 w-4" />,
    CAMPAIGN_COMPLETED: <CheckCircle2 className="h-4 w-4" />,
    LEAD_BOUNCED: <AlertTriangle className="h-4 w-4" />,
    CAMPAIGN_PAUSED: <Zap className="h-4 w-4" />,
    AI_ENRICHMENT_DONE: <TrendingUp className="h-4 w-4" />,
  };
  return icons[type] || <Bell className="h-4 w-4" />;
}

function getTypeColor(type: NotificationType) {
  const colors: Record<NotificationType, string> = {
    REPLY_RECEIVED: "bg-blue-100 text-blue-800 border-blue-200",
    FOLLOWUP_SENT: "bg-purple-100 text-purple-800 border-purple-200",
    CAMPAIGN_COMPLETED: "bg-green-100 text-green-800 border-green-200",
    LEAD_BOUNCED: "bg-red-100 text-red-800 border-red-200",
    CAMPAIGN_PAUSED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    AI_ENRICHMENT_DONE: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
}

function getTypeLabel(type: NotificationType) {
  const labels: Record<NotificationType, string> = {
    REPLY_RECEIVED: "Reply Received",
    FOLLOWUP_SENT: "Follow-up Sent",
    CAMPAIGN_COMPLETED: "Campaign Completed",
    LEAD_BOUNCED: "Lead Bounced",
    CAMPAIGN_PAUSED: "Campaign Paused",
    AI_ENRICHMENT_DONE: "AI Enrichment Done",
  };
  return labels[type] || type.replace(/_/g, " ");
}

function getActionUrl(type: NotificationType, relatedId?: string) {
  switch (type) {
    case "REPLY_RECEIVED":
      return "/inbox";
    case "CAMPAIGN_COMPLETED":
    case "CAMPAIGN_PAUSED":
      return relatedId ? `/campaigns/${relatedId}` : "/campaigns";
    case "AI_ENRICHMENT_DONE":
      return relatedId ? `/leads/${relatedId}` : "/leads";
    default:
      return null;
  }
}

function NotificationSkeleton() {
  return (
    <div className="p-4 border-b space-y-3">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isLoading,
}: NotificationItemProps) {
  const actionUrl = getActionUrl(notification.type, notification.relatedId);

  const content = (
    <div
      className={`p-4 border-b flex items-start gap-4 hover:bg-muted/50 transition-colors ${
        !notification.isRead ? "bg-blue-50" : ""
      }`}
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg mt-1 flex-shrink-0 border ${getTypeColor(notification.type)}`}>
        {getTypeIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-medium text-sm ${!notification.isRead ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
            {notification.title}
          </h3>
          <Badge
            variant="outline"
            className={getTypeColor(notification.type)}
          >
            {getTypeLabel(notification.type)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!notification.isRead && (
              <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(notification.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (actionUrl) {
    return <Link href={actionUrl}>{content}</Link>;
  }

  return content;
}

export default function NotificationsPage() {
  const [filterType, setFilterType] = useState<"all" | "unread" | "read">("all");
  const [selectedType, setSelectedType] = useState<NotificationType | "all">("all");

  // Redux queries
  const { data: notificationsData, isLoading, refetch } = useGetNotificationsQuery({
    page: 1,
    limit: 50,
    isRead: filterType === "unread" ? false : filterType === "read" ? true : undefined,
  });

  const { data: unreadCountData } = useGetNotificationsUnreadCountQuery();

  // Redux mutations
  const [markAsRead, { isLoading: isMarkingRead }] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] = useDeleteNotificationMutation();
  const [deleteAll, { isLoading: isDeletingAll }] = useDeleteAllNotificationsMutation();

  // Auto-refetch every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const notifications = notificationsData?.data || [];
  const unreadCount = unreadCountData?.data?.count || 0;
  const readCount = (notificationsData?.pagination?.total || 0) - unreadCount;

  const filteredNotifications = useMemo(() => {
    if (selectedType === "all") return notifications;
    return notifications.filter((n: any) => n.type === selectedType);
  }, [notifications, selectedType]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDeleteAll = async () => {
    if (confirm("Are you sure you want to delete all notifications?")) {
      try {
        await deleteAll().unwrap();
        toast.success("All notifications deleted");
      } catch {
        toast.error("Failed to delete notifications");
      }
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with important events and actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead || unreadCount === 0}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteAll}
            disabled={isDeletingAll || notifications.length === 0}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Total Notifications
              </p>
              <p className="text-3xl font-bold">
                {notificationsData?.pagination?.total || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-blue-900 font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Unread
              </p>
              <p className="text-3xl font-bold text-blue-900">{unreadCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Read
              </p>
              <p className="text-3xl font-bold">{readCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All Notifications</TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="read">Read ({readCount})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
            >
              All Types
            </Button>
            {(["REPLY_RECEIVED", "FOLLOWUP_SENT", "CAMPAIGN_COMPLETED", "LEAD_BOUNCED", "CAMPAIGN_PAUSED", "AI_ENRICHMENT_DONE"] as NotificationType[]).map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {getTypeLabel(type)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedType === "all"
              ? "All Notifications"
              : getTypeLabel(selectedType)}
            {" "}
            <Badge variant="secondary" className="ml-2">
              {filteredNotifications.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Alert className="border-0 rounded-none">
              <Bell className="h-4 w-4" />
              <AlertTitle>No notifications</AlertTitle>
              <AlertDescription>
                {selectedType === "all"
                  ? "You're all caught up! No notifications to display."
                  : `No ${getTypeLabel(selectedType).toLowerCase()} notifications.`}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border-t">
              {filteredNotifications.map((notification: any) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  isLoading={isMarkingRead || isDeleting}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

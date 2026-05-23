import { baseApi } from "@/redux/baseApi";
import type { Notification as PrismaNotification, NotificationType, Lead, Campaign } from "@/app/generated/prisma/browser";

export type Notification = PrismaNotification & {
  lead?: Lead;
  campaign?: Campaign;
  title?: string;
  relatedId?: string;
};

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get list of notifications
    getNotifications: builder.query<
      NotificationListResponse,
      NotificationListParams
    >({
      query: (params) => ({
        url: "/notifications",
        method: "GET",
        params,
      }),
      providesTags: ["Notifications"],
    }),

    // Get single notification
    getNotification: builder.query<{ data: Notification }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Notifications", id }],
    }),

    // Mark notification as read
    markAsRead: builder.mutation<{ data: Notification }, string>({
      query: (id) => ({
        url: `/notifications/${id}/mark-as-read`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notifications", id },
        "Notifications",
      ],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/notifications/mark-all-as-read",
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // Delete notification
    deleteNotification: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notifications", id },
        "Notifications",
      ],
    }),

    // Delete all notifications
    deleteAllNotifications: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/notifications",
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // Get unread count
    getNotificationsUnreadCount: builder.query<{ data: { count: number } }, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  useGetNotificationsUnreadCountQuery,
} = notificationsApi;

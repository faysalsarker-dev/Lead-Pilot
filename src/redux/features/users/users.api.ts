import { baseApi } from "@/redux/baseApi";
import type { User } from "@/app/generated/prisma/browser";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query<
      {
        data: Pick<
          User,
          | "id"
          | "email"
          | "name"
          | "image"
          | "service"
          | "isActive"
          | "status"
          | "currentStreak"
          | "longestStreak"
          | "lastLoggedInAt"
          | "autoEnrich"
          | "defaultSendWindow"
          | "webPushEnabled"
          | "createdAt"
          | "updatedAt"
        >;
      },
      void
    >({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<
      {
        data: Pick<
          User,
          | "id"
          | "email"
          | "name"
          | "image"
          | "service"
          | "isActive"
          | "status"
          | "currentStreak"
          | "longestStreak"
          | "lastLoggedInAt"
          | "autoEnrich"
          | "defaultSendWindow"
          | "webPushEnabled"
          | "createdAt"
          | "updatedAt"
        >;
      },
      Partial<Pick<User, "name" | "image" | "service">>
    >({
      query: (data) => ({
        url: "/users",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Users"],
    }),

    // Update user profile with an uploaded image file
    updateUserProfileForm: builder.mutation<
      {
        data: Pick<
          User,
          | "id"
          | "email"
          | "name"
          | "image"
          | "service"
          | "isActive"
          | "status"
          | "currentStreak"
          | "longestStreak"
          | "lastLoggedInAt"
          | "autoEnrich"
          | "defaultSendWindow"
          | "webPushEnabled"
          | "createdAt"
          | "updatedAt"
        >;
      },
      FormData
    >({
      query: (data) => ({
        url: "/users",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Users"],
    }),

    // Get user settings
    getUserSettings: builder.query<
      { data: Pick<User, "autoEnrich" | "defaultSendWindow" | "webPushEnabled"> },
      void
    >({
      query: () => ({
        url: "/users/settings",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    // Update user settings
    updateUserSettings: builder.mutation<
      { data: Pick<User, "autoEnrich" | "defaultSendWindow" | "webPushEnabled"> },
      Partial<Pick<User, "autoEnrich" | "defaultSendWindow" | "webPushEnabled">>
    >({
      query: (data) => ({
        url: "/users/settings",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Users"],
    }),

    // Get unread count
    getUnreadCount: builder.query<
      { data: { unreadNotifications: number; unreadReplies: number } },
      void
    >({
      query: () => ({
        url: "/users/unread-count",
        method: "GET",
      }),
      providesTags: ["Users", "Notifications", "Replies"],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateUserProfileFormMutation,
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useGetUnreadCountQuery,
} = usersApi;

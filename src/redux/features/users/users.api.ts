import { baseApi } from "@/redux/baseApi";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  autoEnrich?: boolean;
  defaultSendWindow?: string;
  yourService?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  autoEnrich: boolean;
  defaultSendWindow: string;
  webPushEnabled: boolean;
  timezone?: string;
}

export interface UnreadCount {
  unreadNotifications: number;
  unreadReplies: number;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query<{ data: UserProfile }, void>({
      query: () => ({
        url: "/users",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<
      { data: UserProfile },
      Partial<UserProfile>
    >({
      query: (data) => ({
        url: "/users",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Users"],
    }),

    // Get user settings
    getUserSettings: builder.query<{ data: UserSettings }, void>({
      query: () => ({
        url: "/users/settings",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),

    // Update user settings
    updateUserSettings: builder.mutation<
      { data: UserSettings },
      Partial<UserSettings>
    >({
      query: (data) => ({
        url: "/users/settings",
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Users"],
    }),

    // Get unread count
    getUnreadCount: builder.query<{ data: UnreadCount }, void>({
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
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useGetUnreadCountQuery,
} = usersApi;

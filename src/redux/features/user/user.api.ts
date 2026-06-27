import type { Prisma } from "@/app/generated/prisma/client";
import type { UserModel as User } from "@/app/generated/prisma/models";
import { baseApi } from "@/redux/baseApi";

export type PublicUser = Omit<User, "password">;
export type UpdateUserProfileRequest = Pick<
  Prisma.UserUncheckedUpdateInput,
  | "name"
  | "image"
  | "service"
  | "autoEnrich"
  | "defaultSendWindow"
  | "webPushEnabled"
  | "webPushSubscription"
>;

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<{ data: PublicUser }, void>({
      query: () => ({
        url: "/user",
        method: "GET",
      }),
      providesTags: ["Users"],
    }),
    updateUserProfile: builder.mutation<
      { data: PublicUser },
      Partial<UpdateUserProfileRequest>
    >({
      query: (data) => ({
        url: "/user",
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Users", "Auth"],
    }),
    deleteUserProfile: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/user",
        method: "DELETE",
      }),
      invalidatesTags: ["Users", "Auth"],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useDeleteUserProfileMutation,
} = userApi;

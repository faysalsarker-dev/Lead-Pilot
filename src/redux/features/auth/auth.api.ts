import { signIn, signOut } from "next-auth/react";
import type { UserModel as User } from "@/app/generated/prisma/models";
import { baseApi } from "@/redux/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      { user: Omit<User, "password"> },
      Pick<User, "name" | "email" | "password"> & Partial<Pick<User, "service">>
    >({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Auth"],
    }),
    login: builder.mutation<
      { success: boolean; user: Omit<User, "password"> },
      Pick<User, "email" | "password">
    >({
      async queryFn({ email, password }, _api, _extraOptions, baseQuery) {
        const loginResult = await baseQuery({
          url: "/auth/login",
          method: "POST",
          data: { email, password },
        });

        if (loginResult.error) {
          return { error: loginResult.error };
        }

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          return {
            error: {
              status: 401,
              data: { error: result.error },
            },
          };
        }

        return {
          data: {
            success: Boolean(result?.ok),
            ...(loginResult.data as { user: Omit<User, "password"> }),
          },
        };
      },
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        await signOut({ redirect: false });

        const result = await baseQuery({
          url: "/auth/logout",
          method: "POST",
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as { success: boolean } };
      },
      invalidatesTags: ["Auth"],
    }),
    getMe: builder.query<{ user: Omit<User, "password"> }, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi;

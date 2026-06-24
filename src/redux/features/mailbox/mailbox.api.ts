import { baseApi } from "@/redux/baseApi";
import type { Prisma } from "@/app/generated/prisma/client";
import type { MailboxModel as Mailbox } from "@/app/generated/prisma/models";

export type { Mailbox };
export type CreateMailboxRequest = Omit<
  Prisma.MailboxUncheckedCreateInput,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateMailboxRequest = Omit<
  Prisma.MailboxUncheckedUpdateInput,
  "id" | "userId" | "createdAt" | "updatedAt" | "type"
>;

export type GetMailboxesRequest = {
  page?: number;
  limit?: number;
  search?: string;
  type?: Mailbox["type"];
  isActive?: boolean;
};

type TestMailboxResponse = {
  success: boolean;
  data: {
    id: string;
    connectionStatus: Mailbox["connectionStatus"];
    lastTestedAt: Date | null;
    lastError: string | null;
  };
  error?: string;
};

export const mailboxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMailboxes: builder.query<
      {
        data: Mailbox[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      },
      GetMailboxesRequest | void
    >({
      query: (params) => ({
        url: "/mailboxes",
        method: "GET",
        params,
      }),
      providesTags: ["Mailboxes"],
    }),
    getMailbox: builder.query<{ data: Mailbox }, string>({
      query: (id) => ({
        url: `/mailboxes/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Mailboxes", id }],
    }),
    createMailbox: builder.mutation<
      { data: Mailbox },
      CreateMailboxRequest
    >({
      query: (data) => ({
        url: "/mailboxes",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Mailboxes"],
    }),
    updateMailbox: builder.mutation<
      { data: Mailbox },
      { id: string; data: UpdateMailboxRequest }
    >({
      query: ({ id, data }) => ({
        url: `/mailboxes/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Mailboxes",
        { type: "Mailboxes", id },
      ],
    }),
    setDefaultMailbox: builder.mutation<{ data: Mailbox }, string>({
      query: (id) => ({
        url: `/mailboxes/${id}`,
        method: "PATCH",
        data: { isDefault: true },
      }),
      invalidatesTags: (_result, _error, id) => [
        "Mailboxes",
        { type: "Mailboxes", id },
      ],
    }),
    testMailbox: builder.mutation<TestMailboxResponse, string>({
      query: (id) => ({
        url: `/mailboxes/test/${id}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        "Mailboxes",
        { type: "Mailboxes", id },
      ],
    }),
    deleteMailbox: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/mailboxes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Mailboxes"],
    }),
  }),
});

export const {
  useGetMailboxesQuery,
  useLazyGetMailboxesQuery,
  useGetMailboxQuery,
  useLazyGetMailboxQuery,
  useCreateMailboxMutation,
  useUpdateMailboxMutation,
  useSetDefaultMailboxMutation,
  useTestMailboxMutation,
  useDeleteMailboxMutation,
} = mailboxApi;

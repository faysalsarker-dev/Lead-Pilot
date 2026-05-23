import { baseApi } from "@/redux/baseApi";
import type { Mailbox as PrismaMailbox, MailboxType } from "@/app/generated/prisma/browser";

export type Mailbox = PrismaMailbox & {
  email?: string;
};

export interface CreateGmailMailboxRequest {
  label: string;
  type: "GMAIL_OAUTH";
  gmailRefreshToken: string;
  isDefault?: boolean;
}

export interface CreateSmtpMailboxRequest {
  label: string;
  type: "CUSTOM_SMTP";
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassEnc: string;
  isDefault?: boolean;
}

export type CreateMailboxRequest = CreateGmailMailboxRequest | CreateSmtpMailboxRequest;

export interface UpdateMailboxRequest {
  label?: string;
  isActive?: boolean;
}

export interface MailboxListResponse {
  success: boolean;
  data: Mailbox[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MailboxListParams {
  page?: number;
  limit?: number;
}

export const mailboxesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get list of mailboxes
    getMailboxes: builder.query<MailboxListResponse, MailboxListParams>({
      query: (params) => ({
        url: "/mailboxes",
        method: "GET",
        params,
      }),
      providesTags: ["Mailboxes"],
    }),

    // Get single mailbox
    getMailbox: builder.query<{ data: Mailbox }, string>({
      query: (id) => ({
        url: `/mailboxes/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Mailboxes", id }],
    }),

    // Get default mailbox
    getDefaultMailbox: builder.query<{ data: Mailbox }, void>({
      query: () => ({
        url: "/mailboxes/default",
        method: "GET",
      }),
      providesTags: ["Mailboxes"],
    }),

    // Create mailbox
    createMailbox: builder.mutation<{ data: Mailbox }, CreateMailboxRequest>({
      query: (data) => ({
        url: "/mailboxes",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Mailboxes"],
    }),

    // Update mailbox
    updateMailbox: builder.mutation<
      { data: Mailbox },
      { id: string; data: UpdateMailboxRequest }
    >({
      query: ({ id, data }) => ({
        url: `/mailboxes/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Mailboxes", id },
        "Mailboxes",
      ],
    }),

    // Delete mailbox
    deleteMailbox: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/mailboxes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Mailboxes", id },
        "Mailboxes",
      ],
    }),

    // Set default mailbox
    setDefaultMailbox: builder.mutation<{ data: Mailbox }, string>({
      query: (id) => ({
        url: `/mailboxes/${id}/set-default`,
        method: "POST",
      }),
      invalidatesTags: ["Mailboxes"],
    }),
  }),
});

export const {
  useGetMailboxesQuery,
  useGetMailboxQuery,
  useGetDefaultMailboxQuery,
  useCreateMailboxMutation,
  useUpdateMailboxMutation,
  useDeleteMailboxMutation,
  useSetDefaultMailboxMutation,
} = mailboxesApi;

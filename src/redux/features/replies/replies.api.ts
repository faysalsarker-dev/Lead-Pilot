import { baseApi } from "@/redux/baseApi";

export interface Reply {
  id: string;
  leadId: string;
  mailboxId: string;
  fromEmail: string;
  subject: string;
  body: string;
  isRead: boolean;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReplyRequest {
  leadId: string;
  mailboxId: string;
  fromEmail: string;
  subject: string;
  body: string;
  receivedAt?: string;
}

export interface UpdateReplyRequest {
  isRead?: boolean;
}

export interface ReplyListResponse {
  success: boolean;
  data: Reply[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReplyListParams {
  page?: number;
  limit?: number;
  leadId?: string;
  mailboxId?: string;
  isRead?: boolean;
}

export const repliesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get list of replies
    getReplies: builder.query<ReplyListResponse, ReplyListParams>({
      query: (params) => ({
        url: "/replies",
        method: "GET",
        params,
      }),
      providesTags: ["Replies"],
    }),

    // Get single reply
    getReply: builder.query<{ data: Reply }, string>({
      query: (id) => ({
        url: `/replies/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Replies", id }],
    }),

    // Create reply
    createReply: builder.mutation<{ data: Reply }, CreateReplyRequest>({
      query: (data) => ({
        url: "/replies",
        method: "POST",
        data,
      }),
      invalidatesTags: (result) => [
        "Replies",
        "Notifications",
        { type: "Leads", id: result?.data.leadId },
        { type: "Conversations", id: result?.data.leadId },
      ],
    }),

    // Update reply
    updateReply: builder.mutation<
      { data: Reply },
      { id: string; data: UpdateReplyRequest }
    >({
      query: ({ id, data }) => ({
        url: `/replies/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Replies", id },
        "Replies",
      ],
    }),

    // Delete reply
    deleteReply: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/replies/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Replies", id },
        "Replies",
      ],
    }),

    // Mark reply as read
    markReplyAsRead: builder.mutation<{ data: Reply }, string>({
      query: (id) => ({
        url: `/replies/${id}/mark-as-read`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Replies", id },
        "Replies",
      ],
    }),
  }),
});

export const {
  useGetRepliesQuery,
  useGetReplyQuery,
  useCreateReplyMutation,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
  useMarkReplyAsReadMutation,
} = repliesApi;

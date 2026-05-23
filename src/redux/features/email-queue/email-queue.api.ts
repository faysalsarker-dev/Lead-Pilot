import { baseApi } from "@/redux/baseApi";
import type { EmailQueue as PrismaEmailQueue, Campaign, Lead, Mailbox, Template } from "@/app/generated/prisma/browser";

export type EmailQueueItem = PrismaEmailQueue & {
  campaign?: Campaign;
  lead?: Lead;
  mailbox?: Mailbox;
  template?: Template;
  toEmail?: string;
  attemptCount?: number;
  lastError?: string;
  scheduledFor?: string;
};

export interface QueueStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
}

export interface QueueListResponse {
  success: boolean;
  data: EmailQueueItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QueueListParams {
  page?: number;
  limit?: number;
  campaignId?: string;
  leadId?: string;
  status?: EmailQueueItem["status"];
}

export const emailQueueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get queue items
    getQueueItems: builder.query<QueueListResponse, QueueListParams>({
      query: (params) => ({
        url: "/email-queue",
        method: "GET",
        params,
      }),
      providesTags: ["EmailQueue"],
    }),

    // Get queue stats
    getQueueStats: builder.query<{ data: QueueStats }, void>({
      query: () => ({
        url: "/email-queue/stats",
        method: "GET",
      }),
      providesTags: ["EmailQueue"],
    }),

    // Get queue item detail
    getQueueItem: builder.query<{ data: EmailQueueItem }, string>({
      query: (id) => ({
        url: `/email-queue/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "EmailQueue", id }],
    }),

    // Mark email as sent
    markAsSent: builder.mutation<{ data: EmailQueueItem }, string>({
      query: (id) => ({
        url: `/email-queue/${id}/mark-sent`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "EmailQueue", id },
        "EmailQueue",
      ],
    }),

    // Mark email as failed
    markAsFailed: builder.mutation<
      { data: EmailQueueItem },
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/email-queue/${id}/mark-failed`,
        method: "POST",
        data: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EmailQueue", id },
        "EmailQueue",
      ],
    }),
  }),
});

export const {
  useGetQueueItemsQuery,
  useGetQueueStatsQuery,
  useGetQueueItemQuery,
  useMarkAsSentMutation,
  useMarkAsFailedMutation,
} = emailQueueApi;

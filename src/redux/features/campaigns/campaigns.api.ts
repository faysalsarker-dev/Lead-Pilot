import type { Prisma } from "@/app/generated/prisma/client";
import type { CampaignGetPayload } from "@/app/generated/prisma/models/Campaign";
import { baseApi } from "@/redux/baseApi";

type CampaignPayloadArgs = {
  select: {
    id: true;
    userId: true;
    name: true;
    status: true;
    category: true;
    country: true;
    city: true;
    mailboxId: true;
    initialTemplateId: true;
    followup1TemplateId: true;
    followup2TemplateId: true;
    finalTemplateId: true;
    followup1Days: true;
    followup2Days: true;
    finalDays: true;
    sendWindow: true;
    totalSent: true;
    totalBounced: true;
    autoPaused: true;
    launchedAt: true;
    completedAt: true;
    createdAt: true;
    updatedAt: true;
    mailbox: {
      select: {
        id: true;
        label: true;
        type: true;
        fromEmail: true;
      };
    };
    initialTemplate: {
      select: {
        id: true;
        name: true;
        type: true;
        subjectA: true;
      };
    };
    followup1Template: {
      select: {
        id: true;
        name: true;
        type: true;
        subjectA: true;
      };
    };
    followup2Template: {
      select: {
        id: true;
        name: true;
        type: true;
        subjectA: true;
      };
    };
    finalTemplate: {
      select: {
        id: true;
        name: true;
        type: true;
        subjectA: true;
      };
    };
    _count: {
      select: {
        campaignLeads: true;
        emailQueue: true;
      };
    };
  };
};

export type Campaign = CampaignGetPayload<CampaignPayloadArgs>;

export type CreateCampaignRequest = Omit<
  Prisma.CampaignUncheckedCreateInput,
  | "id"
  | "userId"
  | "status"
  | "totalSent"
  | "totalBounced"
  | "autoPaused"
  | "launchedAt"
  | "completedAt"
  | "createdAt"
  | "updatedAt"
>;
export type UpdateCampaignRequest = Omit<
  Prisma.CampaignUncheckedUpdateInput,
  | "id"
  | "userId"
  | "totalSent"
  | "totalBounced"
  | "autoPaused"
  | "launchedAt"
  | "completedAt"
  | "createdAt"
  | "updatedAt"
>;

export type GetCampaignsRequest = {
  page?: number;
  limit?: number;
  search?: string;
  status?: Campaign["status"];
};

export const campaignsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query<
      {
        data: Campaign[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      },
      GetCampaignsRequest | void
    >({
      query: (params) => ({
        url: "/campaigns",
        method: "GET",
        params,
      }),
      providesTags: ["Campaigns"],
    }),
    getCampaign: builder.query<{ data: Campaign }, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Campaigns", id }],
    }),
    createCampaign: builder.mutation<
      { data: Campaign },
      CreateCampaignRequest
    >({
      query: (data) => ({
        url: "/campaigns",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Campaigns"],
    }),
    updateCampaign: builder.mutation<
      { data: Campaign },
      { id: string; data: Partial<UpdateCampaignRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/campaigns/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Campaigns",
        { type: "Campaigns", id },
      ],
    }),
    launchCampaign: builder.mutation<{ data: Campaign }, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "PATCH",
        data: { status: "RUNNING" },
      }),
      invalidatesTags: (_result, _error, id) => [
        "Campaigns",
        { type: "Campaigns", id },
      ],
    }),
    pauseCampaign: builder.mutation<{ data: Campaign }, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "PATCH",
        data: { status: "PAUSED" },
      }),
      invalidatesTags: (_result, _error, id) => [
        "Campaigns",
        { type: "Campaigns", id },
      ],
    }),
    deleteCampaign: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Campaigns"],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useLazyGetCampaignsQuery,
  useGetCampaignQuery,
  useLazyGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useLaunchCampaignMutation,
  usePauseCampaignMutation,
  useDeleteCampaignMutation,
} = campaignsApi;

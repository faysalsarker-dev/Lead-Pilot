import { baseApi } from "@/redux/baseApi";

export interface Campaign {
  id: string;
  name: string;
  mailboxId: string;
  initialTemplateId: string;
  followup1TemplateId?: string;
  followup2TemplateId?: string;
  finalTemplateId?: string;
  status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED";
  sendWindow?: string;
  followup1Days?: number;
  followup2Days?: number;
  finalDays?: number;
  leadCount?: number;
  sentCount?: number;
  launchedAt?: string;
  subject?: string;
  bodyTemplate?: string;
  sendWindowStart?: number;
  sendWindowEnd?: number;
  followupDay1?: number;
  followupDay2?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  mailboxId: string;
  initialTemplateId: string;
  followup1TemplateId?: string;
  followup2TemplateId?: string;
  finalTemplateId?: string;
  sendWindow?: string;
  followup1Days?: number;
  followup2Days?: number;
  finalDays?: number;
  leadIds?: string[];
}

export type UpdateCampaignRequest = Partial<CreateCampaignRequest> & {
  subject?: string;
  bodyTemplate?: string;
  sendWindowStart?: number;
  sendWindowEnd?: number;
  followupDay1?: number;
  followupDay2?: number;
  notes?: string;
};

export interface CampaignListResponse {
  success: boolean;
  data: Campaign[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CampaignListParams {
  page?: number;
  limit?: number;
  status?: Campaign["status"];
  mailboxId?: string;
}

export const campaignsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get list of campaigns
    getCampaigns: builder.query<CampaignListResponse, CampaignListParams>({
      query: (params) => ({
        url: "/campaigns",
        method: "GET",
        params,
      }),
      providesTags: ["Campaigns"],
    }),

    // Get single campaign
    getCampaign: builder.query<{ data: Campaign }, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Campaigns", id }],
    }),

    // Create campaign
    createCampaign: builder.mutation<{ data: Campaign }, CreateCampaignRequest>({
      query: (data) => ({
        url: "/campaigns",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Campaigns"],
    }),

    // Update campaign
    updateCampaign: builder.mutation<
      { data: Campaign },
      { id: string; data: UpdateCampaignRequest }
    >({
      query: ({ id, data }) => ({
        url: `/campaigns/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Campaigns", id },
        "Campaigns",
      ],
    }),

    // Delete campaign
    deleteCampaign: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Campaigns", id },
        "Campaigns",
      ],
    }),

    // Launch campaign
    launchCampaign: builder.mutation<{ data: Campaign }, string>({
      query: (id) => ({
        url: `/campaigns/${id}/launch`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Campaigns", id },
        "Campaigns",
        "EmailQueue",
      ],
    }),

    // Pause campaign
    pauseCampaign: builder.mutation<{ data: Campaign }, string>({
      query: (id) => ({
        url: `/campaigns/${id}/pause`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Campaigns", id },
        "Campaigns",
      ],
    }),

    // Resume campaign
    resumeCampaign: builder.mutation<{ data: Campaign }, string>({
      query: (id) => ({
        url: `/campaigns/${id}/resume`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Campaigns", id },
        "Campaigns",
        "EmailQueue",
      ],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useLaunchCampaignMutation,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
} = campaignsApi;

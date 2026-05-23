import { baseApi } from "@/redux/baseApi";
import type { EnrichmentStatus, Lead, LeadStatus } from "@/app/generated/prisma/browser";

export type { Lead } from "@/app/generated/prisma/browser";

export interface LeadListResponse {
  success: boolean;
  data: Lead[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BulkCreateLeadsResponse {
  success: boolean;
  data: {
    created: number;
    failed: number;
    leads: Lead[];
  };
}

export interface ListLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  isActive?: boolean;
  isInterested?: boolean;
  enrichmentStatus?: EnrichmentStatus;
}

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get list of leads
    getLeads: builder.query<LeadListResponse, ListLeadsParams>({
      query: (params) => ({
        url: "/leads",
        method: "GET",
        params,
      }),
      providesTags: ["Leads"],
    }),

    // Get single lead
    getLead: builder.query<{ data: Lead }, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Leads", id }],
    }),

    // Create single lead
    createLead: builder.mutation<{ data: Lead }, Partial<Lead>>({
      query: (data) => ({
        url: "/leads",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Leads"],
    }),

    // Update lead
    updateLead: builder.mutation<
      { data: Lead },
      { id: string; data: Partial<Lead> }
    >({
      query: ({ id, data }) => ({
        url: `/leads/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Leads", id },
        "Leads",
      ],
    }),

    // Delete lead
    deleteLead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Leads", id },
        "Leads",
      ],
    }),

    // Bulk create leads
    bulkCreateLeads: builder.mutation<
      BulkCreateLeadsResponse,
      { leads: Partial<Lead>[] }
    >({
      query: (data) => ({
        url: "/leads/bulk/create",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Leads"],
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useBulkCreateLeadsMutation,
} = leadsApi;

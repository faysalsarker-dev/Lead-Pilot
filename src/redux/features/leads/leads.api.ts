import { baseApi } from "@/redux/baseApi";

export interface Lead {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  businessType?: string;
  website?: string;
  country?: string;
  timezone?: string;
  status: "NEW" | "CONTACTED" | "ACTIVE" | "INTERESTED" | "CONVERTED" | "REJECTED";
  isActive: boolean;
  isInterested: boolean;
  hasReplied?: boolean;
  aiEnriched?: boolean;
  aiScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  name: string;
  email: string;
  businessName?: string;
  businessType?: string;
  website?: string;
  country?: string;
  timezone?: string;
  notes?: string;
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
  status?: Lead["status"];
  isActive?: boolean;
  isInterested?: boolean;
}

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

export interface BulkCreateLeadsRequest {
  leads: CreateLeadRequest[];
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
  status?: Lead["status"];
  isActive?: boolean;
  isInterested?: boolean;
  aiEnriched?: boolean;
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
    createLead: builder.mutation<{ data: Lead }, CreateLeadRequest>({
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
      { id: string; data: UpdateLeadRequest }
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
      BulkCreateLeadsRequest
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

import type { Prisma } from "@/app/generated/prisma/client";
import type { Lead } from "@/app/generated/prisma/browser";
import { baseApi } from "@/redux/baseApi";

export type CreateLeadRequest = Omit<
  Prisma.LeadUncheckedCreateInput,
  "id" | "userId" | "createdAt" | "updatedAt" | "statusUpdatedAt"
>;

export type UpdateLeadRequest = Omit<
  Prisma.LeadUncheckedUpdateInput,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type GetLeadsRequest = {
  page?: number;
  limit?: number;
  search?: string;
  status?: Lead["status"];
  enrichmentStatus?: Lead["enrichmentStatus"];
};

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<
      {
        data: Lead[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      },
      GetLeadsRequest | void
    >({
      query: (params) => ({
        url: "/leads",
        method: "GET",
        params,
      }),
      providesTags: ["Leads"],
    }),
    getLead: builder.query<{ data: Lead }, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Leads", id }],
    }),
    createLead: builder.mutation<{ data: Lead }, CreateLeadRequest>({
      query: (data) => ({
        url: "/leads",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Leads"],
    }),
    updateLead: builder.mutation<
      { data: Lead },
      { id: string; data: Partial<UpdateLeadRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/leads/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Leads", { type: "Leads", id }],
    }),
    deleteLead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Leads"],
    }),
  }),
});

export const {
  useCreateLeadMutation,
  useDeleteLeadMutation,
  useGetLeadQuery,
  useGetLeadsQuery,
  useLazyGetLeadQuery,
  useLazyGetLeadsQuery,
  useUpdateLeadMutation,
} = leadsApi;

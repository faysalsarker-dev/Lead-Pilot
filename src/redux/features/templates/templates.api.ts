import type { Prisma } from "@/app/generated/prisma/client";
import type { TemplateModel as Template } from "@/app/generated/prisma/models";
import { baseApi } from "@/redux/baseApi";

export type { Template };

export type CreateTemplateRequest = Omit<
  Prisma.TemplateUncheckedCreateInput,
  "id" | "userId" | "usedVariables" | "createdAt" | "updatedAt"
>;
export type UpdateTemplateRequest = Omit<
  Prisma.TemplateUncheckedUpdateInput,
  "id" | "userId" | "usedVariables" | "createdAt" | "updatedAt"
>;

export type GetTemplatesRequest = {
  page?: number;
  limit?: number;
  search?: string;
  type?: Template["type"];
};

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<
      {
        data: Template[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      },
      GetTemplatesRequest | void
    >({
      query: (params) => ({
        url: "/templates",
        method: "GET",
        params,
      }),
      providesTags: ["Templates"],
    }),
    getTemplate: builder.query<{ data: Template }, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Templates", id }],
    }),
    createTemplate: builder.mutation<{ data: Template }, CreateTemplateRequest>({
      query: (data) => ({
        url: "/templates",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Templates"],
    }),
    updateTemplate: builder.mutation<
      { data: Template },
      { id: string; data: Partial<UpdateTemplateRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/templates/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Templates",
        { type: "Templates", id },
      ],
    }),
    deleteTemplate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Templates"],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useLazyGetTemplatesQuery,
  useGetTemplateQuery,
  useLazyGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
} = templatesApi;

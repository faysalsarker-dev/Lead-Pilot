import { baseApi } from "@/redux/baseApi";

export interface Template {
  id: string;
  name: string;
  type: "INITIAL" | "FOLLOWUP_1" | "FOLLOWUP_2" | "FINAL";
  subjectA: string;
  subjectB?: string;
  body: string;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  type: Template["type"];
  subjectA: string;
  subjectB?: string;
  body: string;
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {}

export interface TemplateListResponse {
  success: boolean;
  data: Template[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TemplateListParams {
  page?: number;
  limit?: number;
  type?: Template["type"];
}

export interface DuplicateTemplateRequest {
  name: string;
}

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get list of templates
    getTemplates: builder.query<TemplateListResponse, TemplateListParams>({
      query: (params) => ({
        url: "/templates",
        method: "GET",
        params,
      }),
      providesTags: ["Templates"],
    }),

    // Get single template
    getTemplate: builder.query<{ data: Template }, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Templates", id }],
    }),

    // Create template
    createTemplate: builder.mutation<
      { data: Template },
      CreateTemplateRequest
    >({
      query: (data) => ({
        url: "/templates",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Templates"],
    }),

    // Update template
    updateTemplate: builder.mutation<
      { data: Template },
      { id: string; data: UpdateTemplateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/templates/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Templates", id },
        "Templates",
        "Campaigns",
      ],
    }),

    // Delete template
    deleteTemplate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Templates", id },
        "Templates",
        "Campaigns",
      ],
    }),

    // Duplicate template
    duplicateTemplate: builder.mutation<
      { data: Template },
      { id: string; data: DuplicateTemplateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/templates/${id}/duplicate`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Templates"],
    }),
  }),
});

export const {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useDuplicateTemplateMutation,
} = templatesApi;

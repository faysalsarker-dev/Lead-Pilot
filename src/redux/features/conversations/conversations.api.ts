import { baseApi } from "@/redux/baseApi";

export interface Message {
  role: "user" | "lead";
  body: string;
  subject?: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  leadId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface AddMessageRequest {
  role: "user" | "lead";
  body: string;
  subject?: string;
}

export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get conversation by lead ID
    getConversation: builder.query<{ data: Conversation }, string>({
      query: (leadId) => ({
        url: `/conversations/${leadId}`,
        method: "GET",
      }),
      providesTags: (result, error, leadId) => [
        { type: "Conversations", id: leadId },
      ],
    }),

    // Add message to conversation
    addMessage: builder.mutation<
      { data: Conversation },
      { leadId: string; data: AddMessageRequest }
    >({
      query: ({ leadId, data }) => ({
        url: `/conversations/${leadId}/messages`,
        method: "POST",
        data,
      }),
      invalidatesTags: (result, error, { leadId }) => [
        { type: "Conversations", id: leadId },
        { type: "Leads", id: leadId },
      ],
    }),
  }),
});

export const { useGetConversationQuery, useAddMessageMutation } =
  conversationsApi;

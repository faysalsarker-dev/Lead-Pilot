import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "Auth",
    "Users",
    "Leads",
    "Campaigns",
    "Templates",
    "Mailboxes",
    "Conversations",
    "Replies",
    "Notifications",
    "EmailQueue",
  ],
  keepUnusedDataFor: 60 * 60,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});


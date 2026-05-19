import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// ============================================================================
// RTK Query API Hooks - Auto-generated from resource API slices
// ============================================================================

// Users API Hooks
export {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateUserProfileFormMutation,
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useGetUnreadCountQuery,
} from "./features/users/users.api";

// Leads API Hooks
export {
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useBulkCreateLeadsMutation,
} from "./features/leads/leads.api";

// Campaigns API Hooks
export {
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useLaunchCampaignMutation,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
} from "./features/campaigns/campaigns.api";

// Templates API Hooks
export {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useDuplicateTemplateMutation,
} from "./features/templates/templates.api";

// Mailboxes API Hooks
export {
  useGetMailboxesQuery,
  useGetMailboxQuery,
  useGetDefaultMailboxQuery,
  useCreateMailboxMutation,
  useUpdateMailboxMutation,
  useDeleteMailboxMutation,
  useSetDefaultMailboxMutation,
} from "./features/mailboxes/mailboxes.api";

// Conversations API Hooks
export {
  useGetConversationQuery,
  useAddMessageMutation,
} from "./features/conversations/conversations.api";

// Replies API Hooks
export {
  useGetRepliesQuery,
  useGetReplyQuery,
  useCreateReplyMutation,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
  useMarkReplyAsReadMutation,
} from "./features/replies/replies.api";

// Notifications API Hooks
export {
  useGetNotificationsQuery,
  useGetNotificationQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  useGetNotificationsUnreadCountQuery,
} from "./features/notifications/notifications.api";

// Email Queue API Hooks
export {
  useGetQueueItemsQuery,
  useGetQueueStatsQuery,
  useGetQueueItemQuery,
  useMarkAsSentMutation,
  useMarkAsFailedMutation,
} from "./features/email-queue/email-queue.api";

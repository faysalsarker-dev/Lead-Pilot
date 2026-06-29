import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();


export {
  useLoginMutation,
  useRegisterMutation,
} from "@/redux/features/auth/auth.api";

export {
  useCreateMailboxMutation,
  useDeleteMailboxMutation,
  useGetMailboxQuery,
  useGetMailboxesQuery,
  useLazyGetMailboxQuery,
  useLazyGetMailboxesQuery,
  useSetDefaultMailboxMutation,
  useUpdateMailboxMutation,
  useTestMailboxMutation,
} from "@/redux/features/mailbox/mailbox.api";

export {
  useDeleteUserProfileMutation,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/redux/features/user/user.api";

export {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  useGetTemplateQuery,
  useGetTemplatesQuery,
  useLazyGetTemplateQuery,
  useLazyGetTemplatesQuery,
  useUpdateTemplateMutation,
} from "@/redux/features/templates/templates.api";

export {
  useCreateCampaignMutation,
  useDeleteCampaignMutation,
  useGetCampaignQuery,
  useGetCampaignsQuery,
  useLaunchCampaignMutation,
  useLazyGetCampaignQuery,
  useLazyGetCampaignsQuery,
  usePauseCampaignMutation,
  useUpdateCampaignMutation,
} from "@/redux/features/campaigns/campaigns.api";

export {
  useCreateLeadMutation,
  useDeleteLeadMutation,
  useGetLeadQuery,
  useGetLeadsQuery,
  useLazyGetLeadQuery,
  useLazyGetLeadsQuery,
  useUpdateLeadMutation,
} from "@/redux/features/leads/leads.api";

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

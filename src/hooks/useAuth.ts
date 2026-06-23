import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { toast } from "sonner";

import {
  useLazyGetMeQuery,
  useLogoutMutation,
} from "@/redux/features/auth/auth.api";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const [logoutUser] = useLogoutMutation();
  const [loadMe] = useLazyGetMeQuery();

  const logout = useCallback(async () => {
    try {
      await logoutUser().unwrap();
      window.location.href = "/login";
    } catch {
      toast.error("Logout failed", { description: "An error occurred" });
    }
  }, [logoutUser]);

  const getMe = useCallback(async () => {
    try {
      const result = await loadMe().unwrap();
      return result.user;
    } catch {
      toast.error("Failed to fetch user", {
        description: "Unable to load user",
      });
      return null;
    }
  }, [loadMe]);

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    logout,
    getMe,
  };
};

export default useAuth;

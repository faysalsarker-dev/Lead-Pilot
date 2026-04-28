import { useSession, signOut } from "next-auth/react";
import { useCallback } from "react";
import { authAPI } from "@/lib/authAPI";
import { toast } from "sonner";

export const useAuth = () => {
  const { data: session, status } = useSession();

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/login" });
      const result = await authAPI.logout();
      if (!result.success) {
        toast.error("Logout failed", { description: result.error });
      }
    } catch (error) {
      toast.error("Logout failed", { description: "An error occurred" });
    }
  }, []);

  const getMe = useCallback(async () => {
    const result = await authAPI.getMe();
    if (result.success) {
      return result.user;
    } else {
      toast.error("Failed to fetch user", { description: result.error });
      return null;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const result = await authAPI.forgotPassword(email);
    if (result.success) {
      toast.success("Password reset email sent", {
        description: "Check your email for instructions",
      });
      return true;
    } else {
      toast.error("Failed to send reset email", { description: result.error });
      return false;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    const result = await authAPI.resetPassword(token, password);
    if (result.success) {
      toast.success("Password reset successfully");
      return true;
    } else {
      toast.error("Failed to reset password", { description: result.error });
      return false;
    }
  }, []);

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    logout,
    getMe,
    forgotPassword,
    resetPassword,
  };
};

export default useAuth;

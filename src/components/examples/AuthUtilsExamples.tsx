/**
 * Example Components showing how to use Auth Utils
 * These components demonstrate various ways to display and manage user info
 */

"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLogoutMutation, useGetMeQuery } from "@/redux/features/auth";
import {
  getUser,
  getUserEmail,
  getUserName,
  getUserId,
  isAuthenticated,
  clearAuthData,
} from "@/redux/features/auth";

/**
 * Component 1: Display user info from localStorage
 * This loads immediately without making API calls
 */
export const UserHeaderFromStorage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage (instant, no API call)
    const currentUser = getUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) return <div className="h-10 bg-muted rounded animate-pulse" />;

  if (!user) return <div>No user data</div>;

  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-primary" />
      <div>
        <p className="text-sm font-medium">{getUserName() || "User"}</p>
        <p className="text-xs text-muted-foreground">{getUserEmail()}</p>
      </div>
    </div>
  );
};

/**
 * Component 2: Display user info from API
 * This fetches from server, useful for fresh/verified data
 */
export const UserProfileFromAPI = () => {
  const { data, isLoading, error } = useGetMeQuery();

  if (isLoading) return <div>Loading user profile...</div>;
  if (error) return <div>Failed to load user profile</div>;
  if (!data?.user) return <div>No user data</div>;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{data.user.name}</h2>
      <p className="text-sm text-muted-foreground">{data.user.email}</p>
      <p className="text-xs text-gray-500">ID: {data.user.id}</p>
      {data.user.emailVerified && (
        <p className="text-xs text-green-600">Email verified</p>
      )}
    </div>
  );
};

/**
 * Component 3: User info with logout button
 * Combines display and action
 */
export const UserMenuWithLogout = () => {
  const user = getUser();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      clearAuthData();
      
      // NextAuth is handling redirect, but you can also do:
      // window.location.href = "/login";
      
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium">{getUserName()}</p>
          <p className="text-sm text-muted-foreground">{getUserEmail()}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary" />
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isLoading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
};

/**
 * Component 4: Authentication status checker
 * Shows if user is authenticated
 */
export const AuthStatusBadge = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
      isAuth
        ? "bg-green-100 text-green-800"
        : "bg-gray-100 text-gray-800"
    }`}>
      <div className={`h-2 w-2 rounded-full ${isAuth ? "bg-green-600" : "bg-gray-600"}`} />
      {isAuth ? "Authenticated" : "Not Authenticated"}
    </div>
  );
};

/**
 * Component 5: User info with fallback
 * Tries to get user from localStorage first, then API
 */
export const UserInfoWithFallback = () => {
  const [user, setUser] = useState<any>(null);
  const [source, setSource] = useState<"storage" | "api" | "none">("none");

  // First check localStorage
  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
      setSource("storage");
      return;
    }
    setSource("api");
  }, []);

  // If not in storage, fetch from API
  const { data: apiData } = useGetMeQuery(source === "api" ? undefined : null, {
    skip: source !== "api",
  });

  useEffect(() => {
    if (source === "api" && apiData?.user) {
      setUser(apiData.user);
    }
  }, [apiData, source]);

  if (!user) return <div>No user information available</div>;

  return (
    <div className="space-y-1">
      <p className="font-medium">{user.name || "User"}</p>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      <p className="text-xs text-gray-500">Source: {source}</p>
    </div>
  );
};

/**
 * Component 6: User greeting message
 * Personalized greeting based on user data
 */
export const UserGreeting = () => {
  const userName = getUserName();
  const email = getUserEmail();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    let greetingText = "Hello";

    if (hour < 12) greetingText = "Good morning";
    else if (hour < 18) greetingText = "Good afternoon";
    else greetingText = "Good evening";

    setGreeting(greetingText);
  }, []);

  return (
    <div className="text-2xl font-bold">
      {greeting}, {userName || email?.split("@")[0] || "Guest"}! 👋
    </div>
  );
};

/**
 * Component 7: Authentication redirect wrapper
 * Protects routes and shows loading state
 */
export const ProtectedComponent = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuth) {
    // In real app, use router.push("/login")
    return <div>Please log in to access this page</div>;
  }

  return <>{children}</>;
};

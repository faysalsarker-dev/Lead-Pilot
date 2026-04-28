/**
 * Authentication Utilities
 * Helper functions for managing cookies, tokens, and user information
 */

/**
 * Get a specific cookie by name
 * @param name - Cookie name to retrieve
 * @returns Cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i]?.trim();
    if (cookie?.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Get all authentication-related cookies
 * @returns Object containing all auth cookies
 */
export const getAuthCookies = () => {
  return {
    sessionToken: getCookie("next-auth.session-token"),
    csrfToken: getCookie("next-auth.csrf-token"),
    callbackUrl: getCookie("next-auth.callback-url"),
  };
};

/**
 * Get the NextAuth session token
 * @returns Session token or null
 */
export const getSessionToken = (): string | null => {
  return getCookie("next-auth.session-token");
};

/**
 * Check if user is authenticated
 * @returns true if session token exists, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getSessionToken();
};

/**
 * Set a cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Days until expiration (default: 7)
 * @param options - Additional cookie options
 */
export const setCookie = (
  name: string,
  value: string,
  days = 7,
  options: { path?: string; domain?: string; secure?: boolean; sameSite?: string } = {}
) => {
  if (typeof document === "undefined") return;

  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

  const expires = `expires=${date.toUTCString()}`;
  const path = options.path ? `path=${options.path}` : "path=/";
  const domain = options.domain ? `domain=${options.domain}` : "";
  const secure = options.secure ? "secure" : "";
  const sameSite = options.sameSite ? `SameSite=${options.sameSite}` : "SameSite=Strict";

  const cookieString = `${name}=${encodeURIComponent(
    value
  )};${expires};${path};${domain};${secure};${sameSite}`;

  document.cookie = cookieString;
};

/**
 * Delete a cookie
 * @param name - Cookie name to delete
 */
export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * Delete all authentication cookies
 */
export const deleteAuthCookies = () => {
  deleteCookie("next-auth.session-token");
  deleteCookie("next-auth.csrf-token");
  deleteCookie("next-auth.callback-url");
};

/**
 * Get user info from localStorage (if stored after login)
 * @returns Stored user object or null
 */
export const getStoredUser = (): {
  id?: string | number;
  email?: string;
  name?: string;
} | null => {
  if (typeof localStorage === "undefined") return null;

  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error reading user from localStorage:", error);
    return null;
  }
};

/**
 * Set user info in localStorage
 * @param user - User object to store
 */
export const setStoredUser = (user: {
  id?: string | number;
  email?: string;
  name?: string;
}) => {
  if (typeof localStorage === "undefined") return;

  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error storing user in localStorage:", error);
  }
};

/**
 * Clear stored user from localStorage
 */
export const clearStoredUser = () => {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem("user");
};

/**
 * Get user from either localStorage or session
 * This is useful for displaying user info before session is fully loaded
 * @returns User object or null
 */
export const getUser = (): {
  id?: string | number;
  email?: string;
  name?: string;
} | null => {
  // First try to get from localStorage
  const storedUser = getStoredUser();
  if (storedUser) return storedUser;

  // If not in localStorage, check if authenticated
  if (isAuthenticated()) {
    // In a real app, you might want to fetch from /api/auth/me here
    return null;
  }

  return null;
};

/**
 * Get user email from stored data or session
 * @returns User email or null
 */
export const getUserEmail = (): string | null => {
  const user = getUser();
  return user?.email || null;
};

/**
 * Get user name from stored data or session
 * @returns User name or null
 */
export const getUserName = (): string | null => {
  const user = getUser();
  return user?.name || null;
};

/**
 * Get user ID from stored data or session
 * @returns User ID or null
 */
export const getUserId = (): string | number | null => {
  const user = getUser();
  return user?.id || null;
};

/**
 * Check if a specific user is authenticated
 * @param email - Email to check
 * @returns true if authenticated user matches email
 */
export const isUserAuthenticated = (email: string): boolean => {
  const userEmail = getUserEmail();
  return !!userEmail && userEmail === email;
};

/**
 * Initialize user data in localStorage after login
 * Call this after successful login
 * @param userData - User data from login response
 */
export const initializeUserData = (userData: {
  id?: string | number;
  email?: string;
  name?: string;
}) => {
  setStoredUser(userData);
};

/**
 * Clear all authentication data (called on logout)
 */
export const clearAuthData = () => {
  deleteAuthCookies();
  clearStoredUser();
};

/**
 * Get token expiration time from session
 * @returns Expiration date or null
 */
export const getTokenExpiration = (): Date | null => {
  // NextAuth stores session info in cookie which includes expiration
  // This would need to be extracted from the JWT token
  // For now, returning null - implement if needed
  return null;
};

/**
 * Check if token is expired
 * @returns true if token is expired or doesn't exist
 */
export const isTokenExpired = (): boolean => {
  const sessionToken = getSessionToken();
  if (!sessionToken) return true;

  // In a real app, you would decode the JWT and check exp claim
  // For now, we rely on NextAuth's automatic token refresh
  return false;
};

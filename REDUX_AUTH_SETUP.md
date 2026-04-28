# Redux Authentication Setup

Complete Redux/RTK Query integration for authentication with utilities for cookie and user management.

## 📁 File Structure

```
src/redux/
├── features/
│   └── auth/
│       ├── auth.api.ts          # RTK Query endpoints and hooks
│       ├── auth.utils.ts        # Cookie and user utilities
│       └── index.ts             # Barrel export
├── baseApi.ts                   # Base API configuration
├── store.ts                     # Redux store
├── hooks.ts                     # Redux hooks
└── axiosBaseQuery.ts            # Axios base query
```

## 🚀 Usage Examples

### 1. User Registration

```typescript
"use client";
import { useRegisterMutation } from "@/redux/features/auth";

export function RegisterForm() {
  const [register, { isLoading, error }] = useRegisterMutation();

  const handleRegister = async (email: string, password: string) => {
    try {
      const result = await register({
        email,
        password,
        name: "John Doe",
      }).unwrap();
      console.log("Registered:", result);
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      // Call handleRegister with form values
    }}>
      {/* Form fields */}
      <button disabled={isLoading}>Register</button>
      {error && <p>{(error as any).data?.error}</p>}
    </form>
  );
}
```

### 2. User Login

```typescript
"use client";
import { useLoginMutation } from "@/redux/features/auth";
import { initializeUserData } from "@/redux/features/auth";

export function LoginForm() {
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password }).unwrap();
      
      // Store user info for quick access
      initializeUserData({ email });
      
      // Redirect to dashboard
      window.location.href = "/";
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div>
      {/* Login form */}
    </div>
  );
}
```

### 3. Get Current User

```typescript
"use client";
import { useGetMeQuery } from "@/redux/features/auth";

export function UserProfile() {
  const { data, isLoading, error } = useGetMeQuery();

  if (isLoading) return <p>Loading user...</p>;
  if (error) return <p>Failed to load user</p>;

  return (
    <div>
      <h1>Welcome, {data?.user.name}</h1>
      <p>Email: {data?.user.email}</p>
    </div>
  );
}
```

### 4. Display User Info from Local Storage

```typescript
"use client";
import { useEffect, useState } from "react";
import { getUser, getUserEmail, getUserName } from "@/redux/features/auth";

export function UserHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user info from localStorage (immediately available)
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  return (
    <div>
      <p>User: {getUserName() || "Guest"}</p>
      <p>Email: {getUserEmail()}</p>
    </div>
  );
}
```

### 5. Logout

```typescript
"use client";
import { useLogoutMutation } from "@/redux/features/auth";
import { clearAuthData } from "@/redux/features/auth";

export function LogoutButton() {
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      
      // Clear all auth data
      clearAuthData();
      
      // Redirect to login
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <button onClick={handleLogout} disabled={isLoading}>
      Logout
    </button>
  );
}
```

### 6. Forgot Password

```typescript
"use client";
import { useForgotPasswordMutation } from "@/redux/features/auth";

export function ForgotPasswordForm() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleForgotPassword = async (email: string) => {
    try {
      const result = await forgotPassword({ email }).unwrap();
      console.log("Password reset email sent");
      
      // In development, you'll get the reset token
      if (result.resetToken) {
        console.log("Reset token:", result.resetToken);
      }
    } catch (err) {
      console.error("Failed to send reset email:", err);
    }
  };

  return (
    <div>
      {/* Forgot password form */}
    </div>
  );
}
```

### 7. Reset Password

```typescript
"use client";
import { useResetPasswordMutation } from "@/redux/features/auth";

export function ResetPasswordForm() {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleResetPassword = async (token: string, password: string) => {
    try {
      await resetPassword({ token, password }).unwrap();
      console.log("Password reset successfully");
      
      // Redirect to login
      window.location.href = "/login";
    } catch (err) {
      console.error("Password reset failed:", err);
    }
  };

  return (
    <div>
      {/* Reset password form */}
    </div>
  );
}
```

### 8. Check Authentication Status

```typescript
"use client";
import { isAuthenticated, getSessionToken } from "@/redux/features/auth";

export function AuthStatus() {
  const isAuth = isAuthenticated();
  const token = getSessionToken();

  return (
    <div>
      <p>Authenticated: {isAuth ? "Yes" : "No"}</p>
      <p>Has Token: {token ? "Yes" : "No"}</p>
    </div>
  );
}
```

## 📚 Available Hooks

### Mutations

- `useRegisterMutation()` - Register new user
- `useLoginMutation()` - Login user
- `useLogoutMutation()` - Logout user
- `useForgotPasswordMutation()` - Request password reset
- `useResetPasswordMutation()` - Reset password with token

### Queries

- `useGetMeQuery()` - Get current authenticated user

## 🛠️ Available Utilities

### Cookie Management

```typescript
import {
  getCookie,                 // Get single cookie
  getAuthCookies,           // Get all auth cookies
  getSessionToken,          // Get NextAuth session token
  setCookie,                // Set a cookie
  deleteCookie,             // Delete a cookie
  deleteAuthCookies,        // Delete all auth cookies
  isAuthenticated,          // Check if authenticated
} from "@/redux/features/auth";
```

### User Data Management

```typescript
import {
  getStoredUser,            // Get user from localStorage
  setStoredUser,            // Set user in localStorage
  clearStoredUser,          // Clear user from localStorage
  getUser,                  // Get user (localStorage first, then session)
  getUserEmail,             // Get user email
  getUserName,              // Get user name
  getUserId,                // Get user ID
  isUserAuthenticated,      // Check if specific user is authenticated
  initializeUserData,       // Initialize user after login
  clearAuthData,            // Clear all auth data (logout)
} from "@/redux/features/auth";
```

### Token Management

```typescript
import {
  getTokenExpiration,       // Get token expiration
  isTokenExpired,           // Check if token is expired
} from "@/redux/features/auth";
```

## 🎯 Common Patterns

### Redirect Based on Auth Status

```typescript
"use client";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/redux/features/auth";

export function ProtectedComponent() {
  const router = useRouter();
  const { data, isLoading, error } = useGetMeQuery();

  if (isLoading) return <p>Loading...</p>;
  
  if (error) {
    router.push("/login");
    return null;
  }

  return <div>Welcome, {data?.user.name}</div>;
}
```

### Combined Authentication Form

```typescript
"use client";
import { useLoginMutation } from "@/redux/features/auth";
import { initializeUserData } from "@/redux/features/auth";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();

  const handleSubmit = async (email: string, password: string) => {
    try {
      const result = await login({ email, password }).unwrap();
      
      // Store user data
      initializeUserData({ email });
      
      // Redirect
      router.push("/");
    } catch (err) {
      console.error("Auth failed:", err);
    }
  };

  return (
    <div>
      {error && <p>{(error as any).data?.error}</p>}
      {/* Form JSX */}
    </div>
  );
}
```

## 🔄 Automatic Cache Invalidation

The auth hooks automatically invalidate cached data when mutations occur:

- **useRegisterMutation** → invalidates Auth cache
- **useLoginMutation** → invalidates Auth cache
- **useLogoutMutation** → invalidates Auth cache
- **useGetMeQuery** → provides Auth tag (auto-refetched on invalidation)

This ensures your user data stays in sync across the app.

## ⚙️ Configuration

### In Redux Store

Auth API is already registered in your store. The baseApi now includes:

```typescript
tagTypes: ["Auth"],  // Added for cache management
```

### In Components

All hooks are available from:

```typescript
import {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  // ... and all utilities
} from "@/redux/features/auth";
```

## 📝 TypeScript Support

Full TypeScript types are provided:

```typescript
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  User,
  GetMeResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/redux/features/auth";

const handleRegister = async (data: RegisterRequest) => {
  const response: RegisterResponse = await register(data).unwrap();
};
```

## 🎯 Next Steps

1. Update your existing components to use the new Redux auth hooks
2. Replace standalone authAPI calls with RTK Query hooks
3. Use utilities for quick user info display
4. Implement proper error handling and loading states

# Redux Auth Quick Reference 🚀

## 📦 Import Everything You Need

```typescript
// All-in-one import
import {
  // Hooks - Mutations
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  
  // Hooks - Queries
  useGetMeQuery,
  
  // Types
  User,
  LoginRequest,
  RegisterRequest,
  
  // Utilities
  getCookie,
  getUser,
  getUserEmail,
  getUserName,
  getUserId,
  isAuthenticated,
  getSessionToken,
  getAuthCookies,
  initializeUserData,
  clearAuthData,
  setStoredUser,
  getStoredUser,
} from "@/redux/features/auth";
```

## 🎯 Common Tasks

### Display User Info
```typescript
// Option 1: From localStorage (instant, no API call)
const name = getUserName();
const email = getUserEmail();

// Option 2: From API (fresh data)
const { data } = useGetMeQuery();
const user = data?.user;

// Option 3: Combined
const cachedUser = getUser();
```

### User Login
```typescript
const [login, { isLoading, error }] = useLoginMutation();

const handleLogin = async (email: string, password: string) => {
  try {
    await login({ email, password }).unwrap();
    initializeUserData({ email });
    // Redirect...
  } catch (err) {
    console.error(err);
  }
};
```

### User Logout
```typescript
const [logout, { isLoading }] = useLogoutMutation();

const handleLogout = async () => {
  try {
    await logout().unwrap();
    clearAuthData();
    // Redirect to login...
  } catch (err) {
    console.error(err);
  }
};
```

### Check Authentication Status
```typescript
// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Get token
const token = getSessionToken();

// Get auth cookies
const cookies = getAuthCookies();
```

### Register User
```typescript
const [register, { isLoading, error }] = useRegisterMutation();

await register({
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
}).unwrap();
```

### Password Reset
```typescript
// Step 1: Request reset
const [forgotPassword] = useForgotPasswordMutation();
const result = await forgotPassword({ email: "user@example.com" }).unwrap();

// Step 2: Reset password
const [resetPassword] = useResetPasswordMutation();
await resetPassword({
  token: result.resetToken,
  password: "newPassword123"
}).unwrap();
```

## 🔧 Utility Functions Cheat Sheet

| Function | Returns | Use Case |
|----------|---------|----------|
| `getUser()` | User Object \| null | Get user from storage |
| `getUserEmail()` | string \| null | Get user email |
| `getUserName()` | string \| null | Get user name |
| `getUserId()` | string \| number \| null | Get user ID |
| `isAuthenticated()` | boolean | Check if logged in |
| `getSessionToken()` | string \| null | Get auth token |
| `getAuthCookies()` | Object | Get all auth cookies |
| `getCookie(name)` | string \| null | Get specific cookie |
| `getStoredUser()` | User Object \| null | Get from localStorage |
| `setStoredUser(user)` | void | Save to localStorage |
| `initializeUserData(user)` | void | Initialize after login |
| `clearAuthData()` | void | Clear all auth data |
| `deleteAuthCookies()` | void | Delete auth cookies |
| `isTokenExpired()` | boolean | Check token validity |

## 🪝 Hook Usage Examples

### useLoginMutation
```typescript
const [login, { isLoading, error, data, isSuccess }] = useLoginMutation();

await login({ email, password }).unwrap();
// or
login({ email, password }).then(...).catch(...);
```

### useGetMeQuery
```typescript
// Auto-fetch on component mount
const { data, isLoading, error, refetch } = useGetMeQuery();

// Manual control with skip
const { data } = useGetMeQuery(undefined, { 
  skip: !isAuthenticated() // Skip if not authenticated
});

// Manual refetch
<button onClick={() => refetch()}>Refresh User</button>
```

### Mutation State
```typescript
const [mutation, { isLoading, isSuccess, isError, error, data }] = 
  useRegisterMutation();

// All states available:
isLoading   // Request in progress
isSuccess   // Request succeeded
isError     // Request failed
error       // Error object
data        // Response data
```

## 📍 Component Patterns

### Protected Component
```typescript
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/redux/features/auth";

export function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  return <div>Protected content</div>;
}
```

### User Header
```typescript
import { getUserName, getUserEmail } from "@/redux/features/auth";

export function Header() {
  return (
    <header>
      <p>Welcome, {getUserName() || "Guest"}</p>
      <p>{getUserEmail()}</p>
    </header>
  );
}
```

### Auth-Aware Button
```typescript
import { isAuthenticated } from "@/redux/features/auth";

export function MyButton() {
  const isAuth = isAuthenticated();
  
  return (
    <button disabled={!isAuth}>
      {isAuth ? "Logged in" : "Please log in"}
    </button>
  );
}
```

## ⚙️ Configuration

### Store Setup (already done)
```typescript
// In store.ts, baseApi is registered with tagTypes: ["Auth"]
// This enables automatic cache invalidation on mutations
```

### RTK Query Features Enabled
```typescript
keepUnusedDataFor: 60 * 60        // 1 hour cache
refetchOnFocus: true              // Refetch when window focused
refetchOnReconnect: true          // Refetch on reconnect
tagTypes: ["Auth"]                // Cache invalidation
```

## 🚨 Error Handling

```typescript
try {
  await login({ email, password }).unwrap();
} catch (error: any) {
  // Error types:
  // error.data?.error          - Backend error message
  // error.status               - HTTP status code
  // error.data?.message        - Alternative error field
  
  console.error(error.data?.error);
}
```

## 🔄 Cache Management

RTK Query automatically handles caching. Mutations trigger invalidation:

```typescript
// Automatic cache invalidation:
useLoginMutation()          // → invalidates Auth
useLogoutMutation()         // → invalidates Auth
useRegisterMutation()       // → invalidates Auth

// useGetMeQuery automatically re-fetches on invalidation
```

## 🛡️ TypeScript Types

```typescript
// API Request/Response types
import {
  RegisterRequest,      // { email, password, name? }
  RegisterResponse,     // { message, user }
  LoginRequest,         // { email, password }
  LoginResponse,        // { message? }
  User,                 // Full user type
  GetMeResponse,        // { user }
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/redux/features/auth";
```

## 📞 Need Help?

- **Full API Docs**: See `REDUX_AUTH_SETUP.md`
- **Integration Guide**: See `REDUX_AUTH_INTEGRATION.md`
- **Examples**: See `src/components/examples/`
- **Backend**: See `AUTHENTICATION.md`

---

**Pro Tips:**
- 💡 Use `getUser()` for instant display in headers
- 💡 Use `useGetMeQuery()` for protected pages needing fresh data
- 💡 Call `initializeUserData()` after login for quick access
- 💡 Call `clearAuthData()` on logout to clean everything
- 💡 All hooks handle loading/error states automatically

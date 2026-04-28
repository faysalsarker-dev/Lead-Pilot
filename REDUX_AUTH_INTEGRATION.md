# Redux Authentication Integration - Complete Setup

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Redux Store                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              baseApi (RTK Query)                      │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │    authApi (injected endpoints)              │    │   │
│  │  │  - register                                   │    │   │
│  │  │  - login                                      │    │   │
│  │  │  - getMe                                      │    │   │
│  │  │  - logout                                     │    │   │
│  │  │  - forgotPassword                            │    │   │
│  │  │  - resetPassword                             │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
         ┌─────────────────────────────────────┐
         │    Redux Hooks & Utilities          │
         │  ┌──────────────────────────────┐   │
         │  │  API Hooks                    │   │
         │  │  - useLoginMutation()        │   │
         │  │  - useRegisterMutation()     │   │
         │  │  - useGetMeQuery()           │   │
         │  │  - etc...                    │   │
         │  └──────────────────────────────┘   │
         │  ┌──────────────────────────────┐   │
         │  │  Auth Utilities               │   │
         │  │  - getCookie()               │   │
         │  │  - getUser()                 │   │
         │  │  - clearAuthData()           │   │
         │  │  - etc...                    │   │
         │  └──────────────────────────────┘   │
         └─────────────────────────────────────┘
                          ↓
         ┌─────────────────────────────────────┐
         │      Components                      │
         │  - LoginFormWithRedux                │
         │  - UserHeaderFromStorage             │
         │  - UserProfileFromAPI                │
         │  - AuthStatusBadge                   │
         └─────────────────────────────────────┘
```

## 📁 Directory Structure

```
src/
├── redux/
│   ├── features/
│   │   └── auth/
│   │       ├── auth.api.ts           # RTK Query endpoints
│   │       │   ├── register mutation
│   │       │   ├── login mutation
│   │       │   ├── getMe query
│   │       │   ├── logout mutation
│   │       │   ├── forgotPassword mutation
│   │       │   ├── resetPassword mutation
│   │       │   └── hooks exports
│   │       │
│   │       ├── auth.utils.ts         # Cookie & user utilities
│   │       │   ├── getCookie()
│   │       │   ├── getUser()
│   │       │   ├── getStoredUser()
│   │       │   ├── initializeUserData()
│   │       │   ├── clearAuthData()
│   │       │   └── etc...
│   │       │
│   │       └── index.ts              # Barrel export
│   │
│   ├── axiosBaseQuery.ts             # RTK Query adapter for axios
│   ├── baseApi.ts                    # Base API with tagTypes
│   ├── store.ts                      # Redux store config
│   └── hooks.ts                      # Redux typed hooks
│
├── components/
│   ├── examples/
│   │   ├── LoginFormReduxExample.tsx     # Login form using Redux
│   │   └── AuthUtilsExamples.tsx         # Example auth utility components
│   └── login-form.tsx                    # Original login form (NextAuth)
│
└── lib/
    ├── auth.ts                       # NextAuth configuration
    └── authAPI.ts                    # Standalone API (legacy)
```

## 🔌 How It All Works Together

### 1. **RTK Query Layer** (auth.api.ts)
   - Defines API endpoints using baseApi
   - Provides typed hooks for mutations and queries
   - Handles caching and cache invalidation
   - Communicates with backend via axiosBaseQuery

### 2. **Axios Adapter** (axiosBaseQuery.ts)
   - Converts axios calls to RTK Query format
   - Integrates with existing axios instance
   - Handles error responses

### 3. **Utilities Layer** (auth.utils.ts)
   - Cookie management (get, set, delete)
   - Local storage user data management
   - Quick access functions for common operations
   - No API calls needed

### 4. **Components**
   - Use Redux hooks for mutations and queries
   - Use utilities for quick user info display
   - Combined approach: RTK Query for fresh data, utilities for cached/local data

## 🎯 Data Flow Examples

### Login Flow
```
User Input → LoginForm Component
           ↓
useLoginMutation() hook called
           ↓
Redux action → axiosBaseQuery
           ↓
axios request to /api/auth/signin
           ↓
Backend validates & returns session
           ↓
RTK Query caches response
           ↓
Component calls initializeUserData()
           ↓
User info stored in localStorage
           ↓
Component redirects to dashboard
```

### Get User Info Flow (Two Approaches)

**Approach 1: Instant from Storage**
```
Component mounts
           ↓
useEffect → calls getUser()
           ↓
Reads from localStorage (instant)
           ↓
Renders user info immediately
```

**Approach 2: Fresh from API**
```
Component mounts
           ↓
useGetMeQuery() hook called
           ↓
RTK Query checks cache
           ↓
If expired → axios request to /api/auth/me
           ↓
Backend returns fresh user data
           ↓
RTK Query caches it
           ↓
Component renders with fresh data
```

## 💡 Best Practices

### When to Use What

| Use Case | Solution | Example |
|----------|----------|---------|
| Display user name in header | `getUser()`, `getUserName()` | Header component |
| Check if logged in | `isAuthenticated()` | Route guards |
| Show "Welcome, [Name]" | `getUserEmail()` | Dashboard greeting |
| Verify fresh user data | `useGetMeQuery()` | User profile page |
| Handle login action | `useLoginMutation()` | Login form |
| Manage logout | `useLogoutMutation()` + `clearAuthData()` | Logout button |
| Get session token | `getSessionToken()` | API calls |
| Get all auth cookies | `getAuthCookies()` | Debugging |

### Performance Tips

1. **Use localStorage for quick displays**
   ```typescript
   // Good: No API call, instant render
   const name = getUserName();
   ```

2. **Use RTK Query for critical/fresh data**
   ```typescript
   // Good: Gets fresh data from server
   const { data: user } = useGetMeQuery();
   ```

3. **Combine both approaches**
   ```typescript
   // Best: Show cached data, fetch fresh data in background
   const cachedUser = getUser();
   const { data: freshUser } = useGetMeQuery();
   
   useEffect(() => {
     if (freshUser) setUser(freshUser);
   }, [freshUser]);
   ```

4. **Avoid unnecessary queries**
   ```typescript
   // Bad: Multiple queries for same data
   const { data: user1 } = useGetMeQuery();
   const { data: user2 } = useGetMeQuery();
   
   // Good: RTK Query automatically deduplicates
   ```

## 🔐 Security Considerations

### Cookies
- NextAuth session tokens stored in secure, httpOnly cookies
- Cannot be accessed from JavaScript (XSS protection)
- Automatically sent with requests

### localStorage
- User data stored in localStorage for quick access
- **DO NOT store sensitive data** (passwords, tokens)
- Used only for display purposes

### API Requests
- All requests go through axiosBaseQuery
- Cookies sent automatically
- JWT tokens in Authorization header

## 🚀 Common Workflows

### 1. Complete Authentication Flow

```typescript
// Step 1: User registers
const [register] = useRegisterMutation();
await register({ email, password, name });

// Step 2: User logs in
const [login] = useLoginMutation();
await login({ email, password });

// Step 3: Store user data
initializeUserData({ email, name });

// Step 4: Display user info
const userName = getUserName();

// Step 5: Logout
const [logout] = useLogoutMutation();
await logout();
clearAuthData();
```

### 2. Protected Route with User Info

```typescript
export function DashboardPage() {
  const router = useRouter();
  
  // Check auth status
  const isAuth = isAuthenticated();
  const user = getUser();
  
  // Get fresh user data
  const { data: freshUser } = useGetMeQuery();

  if (!isAuth) {
    router.push("/login");
    return null;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### 3. User Menu with Quick Access

```typescript
export function UserMenu() {
  const [logout] = useLogoutMutation();
  const email = getUserEmail();
  const name = getUserName();

  return (
    <DropdownMenu>
      <DropdownTrigger>{name}</DropdownTrigger>
      <DropdownContent>
        <DropdownItem>{email}</DropdownItem>
        <DropdownSeparator />
        <DropdownItem onClick={handleLogout}>
          Logout
        </DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  );
}
```

## 📋 Migration Checklist

If migrating from standalone authAPI to Redux:

- [ ] Import hooks from `@/redux/features/auth`
- [ ] Replace `authAPI.login()` with `useLoginMutation()`
- [ ] Replace `authAPI.getMe()` with `useGetMeQuery()`
- [ ] Replace localStorage checks with `getUser()` or `getUserEmail()`
- [ ] Update logout logic to use `useLogoutMutation()` + `clearAuthData()`
- [ ] Test cache invalidation on mutations
- [ ] Verify API requests use new redux layer

## 🐛 Debugging Tips

### Check Redux State
```typescript
// In Redux DevTools
// Look for baseApi/queries/getMe to see cached user data
// Look for baseApi/mutations/login to see request/response
```

### Check localStorage
```typescript
// In browser console
localStorage.getItem("user")
```

### Check Cookies
```typescript
// In browser console
document.cookie
// Or use utility:
import { getAuthCookies } from "@/redux/features/auth";
console.log(getAuthCookies());
```

### Monitor API Calls
```typescript
// In network tab
// POST /api/auth/login
// GET /api/auth/me
// POST /api/auth/logout
```

## 📞 Support & Examples

- See `LoginFormReduxExample.tsx` for full login form implementation
- See `AuthUtilsExamples.tsx` for various utility usage examples
- See `REDUX_AUTH_SETUP.md` for detailed API documentation
- See `AUTHENTICATION.md` for backend API details

---

**Status**: ✅ Complete and ready to use!

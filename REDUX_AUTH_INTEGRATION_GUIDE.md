# Redux Auth Integration Step-by-Step Guide

## 🎯 Complete Integration Tutorial

### Step 1: Update Your Login Component

**Before (using NextAuth):**
```typescript
"use client";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const handleLogin = async (email, password) => {
    await signIn("credentials", { email, password });
  };
  // ...
}
```

**After (using Redux):**
```typescript
"use client";
import { useLoginMutation, initializeUserData } from "@/redux/features/auth";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password }).unwrap();
      initializeUserData({ email });
      router.push("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };
  // ...
}
```

### Step 2: Create a User Header Component

**New File: `src/components/UserHeader.tsx`**

```typescript
"use client";
import { getUserName, getUserEmail, isAuthenticated } from "@/redux/features/auth";
import { useEffect, useState } from "react";

export function UserHeader() {
  const [hydrated, setHydrated] = useState(false);
  const name = getUserName();
  const email = getUserEmail();

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || !isAuthenticated()) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full bg-primary" />
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}
```

### Step 3: Create a Logout Button Component

**New File: `src/components/LogoutButton.tsx`**

```typescript
"use client";
import { useLogoutMutation, clearAuthData } from "@/redux/features/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      clearAuthData();
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
      disabled={isLoading}
      variant="destructive"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
```

### Step 4: Update Your Layout with User Components

**Update: `src/app/(pages)/layout.tsx`**

```typescript
import { UserHeader } from "@/components/UserHeader";
import { LogoutButton } from "@/components/LogoutButton";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <h1>Lead Pilot</h1>
        <div className="flex items-center gap-4">
          <UserHeader />
          <LogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
```

### Step 5: Create a Protected Page Wrapper

**New File: `src/components/ProtectedPage.tsx`**

```typescript
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetMeQuery } from "@/redux/features/auth";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data, isLoading, error } = useGetMeQuery();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && error) {
      router.push("/login");
    }
  }, [error, router, mounted]);

  if (!mounted || isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return null;
  }

  return <>{children}</>;
}
```

**Usage:**
```typescript
export default function DashboardPage() {
  return (
    <ProtectedPage>
      <div>Dashboard content here</div>
    </ProtectedPage>
  );
}
```

### Step 6: Create User Profile Component

**New File: `src/components/UserProfile.tsx`**

```typescript
"use client";
import { useGetMeQuery } from "@/redux/features/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserProfile() {
  const { data, isLoading, error } = useGetMeQuery();

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Failed to load profile</div>;
  if (!data?.user) return <div>No user data</div>;

  const { user } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <p className="text-lg">{user.name || "N/A"}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <p className="text-lg">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium">User ID</label>
          <p className="text-lg">{user.id}</p>
        </div>
        {user.emailVerified && (
          <div className="text-green-600">✓ Email Verified</div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 7: Middleware Integration (Optional but Recommended)

**Update: `src/middleware.ts`**

```typescript
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = request.nextUrl.pathname === "/login";
  const isPublic = ["/login", "/api/auth"].some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect authenticated users away from login page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### Step 8: Create Auth Context (Optional, for deep nesting)

**New File: `src/contexts/AuthContext.tsx`**

```typescript
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMeQuery } from "@/redux/features/auth";
import { getUser, isAuthenticated } from "@/redux/features/auth";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const { data, isLoading, refetch } = useGetMeQuery();

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data]);

  return (
    <AuthContext.Provider
      value={{
        user: user || getUser(),
        isAuthenticated: isAuthenticated(),
        isLoading,
        refetchUser: () => refetch(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

**Usage in Layout:**
```typescript
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* App content */}
    </AuthProvider>
  );
}

// In any component:
const { user, isAuthenticated } = useAuth();
```

### Step 9: Update Navigation with Auth Status

**New File: `src/components/Navigation.tsx`**

```typescript
"use client";
import Link from "next/link";
import { isAuthenticated } from "@/redux/features/auth";
import { useEffect, useState } from "react";
import { UserHeader } from "./UserHeader";
import { LogoutButton } from "./LogoutButton";

export function Navigation() {
  const [isAuth, setIsAuth] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="border-b">
      <div className="flex justify-between items-center px-4 py-2">
        <Link href="/">
          <h1 className="text-2xl font-bold">Lead Pilot</h1>
        </Link>
        
        {isAuth ? (
          <div className="flex items-center gap-4">
            <UserHeader />
            <LogoutButton />
          </div>
        ) : (
          <Link href="/login">
            <button>Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
```

### Step 10: Testing Your Integration

**Test Checklist:**

1. ✅ **Login Works**
   - User can log in
   - User data stored in localStorage
   - Redirects to dashboard

2. ✅ **User Info Displays**
   - User name shows in header
   - User email shows in header
   - No API calls needed for display

3. ✅ **Protected Pages**
   - Unauthenticated users redirected to login
   - Authenticated users can access

4. ✅ **Logout Works**
   - Clears all auth data
   - Redirects to login
   - localStorage cleared

5. ✅ **Cache Works**
   - useGetMeQuery returns cached data
   - No repeated API calls
   - Refetch on demand works

6. ✅ **RTK DevTools**
   - Redux DevTools shows auth mutations/queries
   - Cache invalidation works
   - Error handling works

## 🎉 Complete! You Now Have:

- ✅ Redux-based authentication
- ✅ RTK Query hooks for all auth endpoints
- ✅ Utility functions for user data and cookies
- ✅ Protected components and pages
- ✅ User header and logout functionality
- ✅ Automatic cache management
- ✅ TypeScript support throughout
- ✅ Error handling and loading states

## 📚 Next Steps

1. Review `REDUX_AUTH_CHEATSHEET.md` for quick reference
2. Check `REDUX_AUTH_SETUP.md` for advanced usage
3. See example components in `src/components/examples/`
4. Test with different user scenarios
5. Customize styling and behavior as needed

---

**Congratulations! Your Redux auth system is fully integrated! 🎊**

# 🔐 Complete Authentication System Setup

Your Lead Pilot application now has a complete JWT-based authentication system with NextAuth and Bcrypt!

## ✅ What's Implemented

### Authentication Features
- ✅ **User Registration** - Create accounts with email/password
- ✅ **User Login** - JWT-based session management
- ✅ **Get Current User** - Retrieve authenticated user info
- ✅ **User Logout** - Clear session and tokens
- ✅ **Forgot Password** - Initiate password reset
- ✅ **Reset Password** - Complete password reset with token

### Security
- ✅ **Bcrypt Hashing** - 10-round password hashing
- ✅ **JWT Tokens** - Secure stateless sessions
- ✅ **Reset Token Expiration** - 1-hour token expiration
- ✅ **Route Protection** - Middleware guards all protected routes
- ✅ **CSRF Protection** - NextAuth built-in CSRF tokens

## 📋 Configuration Checklist

### 1. **Environment Variables** (.env.local)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lead_pilot"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. **Database Setup**
```bash
# Run migration
npm run db:migrate

# Or manually
npx prisma migrate dev --name add_auth_fields

# View database in Prisma Studio
npm run db:studio
```

### 3. **Start the Application**
```bash
npm run dev
```

Visit: `http://localhost:3000/login`

## 🔌 API Endpoints

### Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

### Login
Use the form at `/login` or use NextAuth:
```typescript
import { signIn } from "next-auth/react";

await signIn("credentials", {
  email: "user@example.com",
  password: "password123"
});
```

### Get Current User
```bash
GET /api/auth/me
# Requires valid session
```

### Logout
```bash
POST /api/auth/logout
# Or use NextAuth
await signOut();
```

### Forgot Password
```bash
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}
# Returns reset token in development
```

### Reset Password
```bash
POST /api/auth/reset-password
{
  "token": "reset-token-from-email",
  "password": "newPassword123"
}
```

## 🎯 Usage in Components

### Using useAuth Hook
```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";

export function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Using Auth API Directly
```typescript
import { authAPI } from "@/lib/authAPI";

// Register
const result = await authAPI.register("user@example.com", "pass123", "John");

// Forgot Password
const result = await authAPI.forgotPassword("user@example.com");

// Reset Password
const result = await authAPI.resetPassword(token, "newPass123");
```

## 📁 Files Created

### Core Authentication
- `src/lib/auth.ts` - NextAuth configuration with JWT
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth route handler

### API Endpoints
- `src/app/api/auth/register/route.ts` - User registration
- `src/app/api/auth/me/route.ts` - Get current user
- `src/app/api/auth/logout/route.ts` - Logout
- `src/app/api/auth/forgot-password/route.ts` - Forgot password
- `src/app/api/auth/reset-password/route.ts` - Reset password

### Utilities & Hooks
- `src/lib/authAPI.ts` - API client wrapper
- `src/hooks/useAuth.ts` - Custom authentication hook
- `src/middleware.ts` - Route protection middleware

### Configuration
- `.env.local` - Environment variables template
- `prisma/schema.prisma` - Updated with User model
- `AUTHENTICATION.md` - Complete documentation

## 🔐 Database Schema

```prisma
model User {
  id                    Int       @id @default(autoincrement())
  email                 String    @unique
  name                  String?
  password              String?
  emailVerified         DateTime?
  resetToken            String?   @unique
  resetTokenExpires     DateTime?
  passwordChangedAt     DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

## 🚀 Quick Start

1. **Update .env.local** with your database credentials
2. **Run migration**: `npm run db:migrate`
3. **Start dev server**: `npm run dev`
4. **Visit login page**: `http://localhost:3000/login`
5. **Register a user** using the register endpoint
6. **Login** with the form
7. **Explore** the protected routes

## 📖 More Information

See `AUTHENTICATION.md` for:
- Detailed API documentation
- Testing examples with curl
- Troubleshooting guide
- Production checklist
- Security best practices

## 🎨 Login Page

The existing login page at `(auth)/login/page.tsx` has been updated to:
- Use NextAuth's `signIn` function
- Show loading state during authentication
- Display error messages with toast notifications
- Automatically redirect to home on success
- Redirect to login on logout

## ⚡ Next Steps

1. ✅ Authentication system is ready
2. 📧 (Optional) Integrate email service for password reset links
3. 🔐 (Optional) Add email verification
4. 🛡️ (Optional) Add role-based access control (RBAC)
5. 📱 (Optional) Add social login providers

---

**Questions?** Check `AUTHENTICATION.md` for comprehensive documentation!

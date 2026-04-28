# Authentication Setup Documentation

## Overview
This project uses **NextAuth.js v4** with **JWT** strategy and **Bcrypt** for password hashing to provide complete authentication functionality.

## Features Implemented

### 1. **User Registration** (`POST /api/auth/register`)
- Create new user accounts with email and password
- Passwords are hashed with bcrypt (10 rounds)
- Email validation and uniqueness checking
- Returns user data without password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe" // optional
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-04-28T...",
    "updatedAt": "2026-04-28T..."
  }
}
```

### 2. **User Login** (`POST /api/auth/signin`)
- Uses NextAuth credentials provider
- Email and password validation
- JWT token generation for session management
- Redirect to login page on error
- Redirect to home page on success

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### 3. **Get Current User** (`GET /api/auth/me`)
- Retrieve authenticated user information
- Requires valid session/JWT token
- Returns user data without sensitive fields

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": null,
    "createdAt": "2026-04-28T...",
    "updatedAt": "2026-04-28T..."
  }
}
```

### 4. **User Logout** (`POST /api/auth/logout`)
- Clear session and JWT tokens
- Remove authentication cookies
- Simple post-logout redirect

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### 5. **Forgot Password** (`POST /api/auth/forgot-password`)
- Request password reset
- Generates secure reset token (expires in 1 hour)
- Returns success message regardless of whether email exists (security best practice)
- **Note:** In development, token is returned for testing. Remove in production.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists with this email, you will receive a password reset link",
  "resetToken": "abc123..." // Only in development
}
```

### 6. **Reset Password** (`POST /api/auth/reset-password`)
- Validate reset token and expiration
- Update password with bcrypt hashing
- Clear reset token after successful reset

**Request:**
```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

## Installation & Setup

### Prerequisites
- Node.js 16+
- PostgreSQL database
- npm or yarn

### Step 1: Environment Variables
Create `.env.local` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lead_pilot"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**To generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Run Migrations
```bash
npm run db:migrate
# or
npx prisma migrate dev --name add_auth_fields
```

### Step 4: Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage in Components

### Using the `useAuth` Hook
```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";

export function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Using the Auth API Directly
```typescript
import { authAPI } from "@/lib/authAPI";
import { toast } from "sonner";

// Register
const registerResult = await authAPI.register(
  "user@example.com",
  "password123",
  "John Doe"
);

// Forgot Password
const forgotResult = await authAPI.forgotPassword("user@example.com");

// Reset Password
const resetResult = await authAPI.resetPassword(token, "newPassword123");
```

### Using NextAuth signIn/signOut
```typescript
import { signIn, signOut } from "next-auth/react";

// Login
await signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  redirect: true,
  callbackUrl: "/",
});

// Logout
await signOut({ redirect: true, callbackUrl: "/login" });
```

## Database Schema

### User Model
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

**Fields:**
- `id` - Primary key, auto-incremented
- `email` - Unique identifier, used for login
- `name` - Optional user display name
- `password` - Bcrypt hashed password
- `emailVerified` - Email verification timestamp (for future use)
- `resetToken` - Hashed password reset token
- `resetTokenExpires` - Reset token expiration time
- `passwordChangedAt` - Last password change timestamp
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

## Security Features

✅ **Password Hashing:** Bcrypt with 10 rounds  
✅ **JWT Authentication:** Secure token-based sessions  
✅ **Reset Token:** SHA256 hashed, 1-hour expiration  
✅ **HTTPS Ready:** Supports secure cookies in production  
✅ **CSRF Protection:** NextAuth built-in CSRF token  
✅ **Email Enumeration Prevention:** Generic response for forgot password  
✅ **Middleware Protection:** Route-level authentication guards  

## Protected Routes

The middleware automatically protects all routes except:
- `/login` - Login page (public)
- `/api/auth/*` - Authentication endpoints (public)

Unauthenticated users trying to access protected routes will be redirected to `/login`.

## Testing the Authentication

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 2. Login
Use the login form at `http://localhost:3000/login` or:
```bash
# Using NextAuth
curl http://localhost:3000/api/auth/signin?error=Callback
```

### 3. Get Current User
```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: next-auth.session-token=<your-token>"
```

### 4. Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 5. Reset Password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<reset-token-from-forgot-password>",
    "password": "newpassword123"
  }'
```

### 6. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

## Troubleshooting

### Issue: "Callback should be a URL"
**Solution:** Ensure `NEXTAUTH_URL` is set correctly in `.env.local`

### Issue: "Password compare failed"
**Solution:** Check that the password is being hashed with bcrypt during registration

### Issue: "Invalid or expired reset token"
**Solution:** Reset tokens expire after 1 hour. Request a new reset token.

### Issue: "Unauthorized" on /api/auth/me
**Solution:** Ensure you're logged in and have a valid session token

## Production Checklist

- [ ] Change `NEXTAUTH_SECRET` to a secure random string
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Configure database for production (ensure SSL connection)
- [ ] Remove `NODE_ENV="development"` from `.env`
- [ ] Set up email service for password reset emails
- [ ] Remove password reset token from response (currently returned for dev)
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Configure CORS if needed
- [ ] Set up monitoring and logging for authentication failures
- [ ] Implement rate limiting on authentication endpoints

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...]nextauth]/
│   │       │   └── route.ts          # NextAuth handler
│   │       ├── register/
│   │       │   └── route.ts          # User registration
│   │       ├── me/
│   │       │   └── route.ts          # Get current user
│   │       ├── logout/
│   │       │   └── route.ts          # Logout endpoint
│   │       ├── forgot-password/
│   │       │   └── route.ts          # Request password reset
│   │       └── reset-password/
│   │           └── route.ts          # Reset password
│   └── (auth)/
│       └── login/
│           └── page.tsx              # Login page
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   └── authAPI.ts                    # API client utilities
├── hooks/
│   └── useAuth.ts                    # useAuth hook
└── middleware.ts                     # Route protection
```

## References

- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Bcrypt npm](https://www.npmjs.com/package/bcrypt)
- [JWT Introduction](https://jwt.io/introduction)

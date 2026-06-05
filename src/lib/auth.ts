import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { NextAuthOptions } from "next-auth";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

function getUtcDayStart(value: Date) {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

function getNextStreak(currentStreak: number, longestStreak: number, lastLoggedInAt: Date | null) {
  const now = new Date();
  const today = getUtcDayStart(now);

  if (!lastLoggedInAt) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(longestStreak, 1),
      lastLoggedInAt: now,
    };
  }

  const lastLoginDay = getUtcDayStart(lastLoggedInAt);
  const daysSinceLastLogin = Math.floor((today - lastLoginDay) / 86_400_000);
  const nextCurrentStreak =
    daysSinceLastLogin === 0 ? Math.max(currentStreak, 1) : daysSinceLastLogin === 1 ? currentStreak + 1 : 1;

  return {
    currentStreak: nextCurrentStreak,
    longestStreak: Math.max(longestStreak, nextCurrentStreak),
    lastLoggedInAt: now,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@leadpilot.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        const streak = getNextStreak(
          user.currentStreak,
          user.longestStreak,
          user.lastLoggedInAt
        );

        await prisma.user.update({
          where: { id: user.id },
          data: streak,
        });

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          service: user.service,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // token validity window
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  jwt: {
    secret: JWT_SECRET,
    maxAge: 24 * 60 * 60, // token validity window
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.service = user.service;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.service = token.service;
      }
      return session;
    },
  },
  secret: JWT_SECRET,
};

// Helper function to generate JWT token
export const generateJWT = (payload: Record<string, unknown>) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

// Helper function to verify JWT token
export const verifyJWT = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

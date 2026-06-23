import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import type { UserModel as User } from "@/app/generated/prisma/models";
import prisma from "@/lib/prisma";

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  service: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  status: true,
  currentStreak: true,
  longestStreak: true,
  lastLoggedInAt: true,
  autoEnrich: true,
  defaultSendWindow: true,
  webPushEnabled: true,
  webPushSubscription: true,
} satisfies Record<keyof Omit<User, "password">, true>;

export async function getUserByCredentials(
  credentials: Partial<Pick<User, "email" | "password">>,
) {
  const email = credentials.email?.trim().toLowerCase();
  const password = credentials.password;

  if (!email || !password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return null;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { lastLoggedInAt: new Date() },
    select: publicUserSelect,
  });
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await getUserByCredentials(credentials ?? {});

        return user;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.service = user.service;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.service = token.service;
      }

      return session;
    },
  },
};

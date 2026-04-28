import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { email, password } = parsed.data;

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          console.error("[auth] credentials error:", err);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    // 🔐 GOOGLE USER UPSERT (SAFE)
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        try {
          const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name ?? undefined,
              image: user.image ?? undefined,
            },
            create: {
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
              role: "USER",
            },
          });

          user.id = dbUser.id;
        } catch (err) {
          console.error("[auth] Google signIn upsert failed:", err);
          return false;
        }
      }

      return true;
    },

    // 🧠 JWT SAFE GUARD (THIS FIXES YOUR 500 ERROR)
    async jwt({ token, user }) {
      try {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role ?? "USER";
        }

        // Only fetch from DB if needed
        if (token.id && !token.role) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          });

          token.role = dbUser?.role ?? "USER";
        }
      } catch (err) {
        console.error("[auth] jwt callback error:", err);

        // fallback so session NEVER breaks
        token.role = "USER";
      }

      return token;
    },

    // 📦 SESSION SAFE MAPPING
    async session({ session, token }) {
      try {
        if (session.user) {
          (session.user as any).id = token.id;
          (session.user as any).role = token.role ?? "USER";
        }
      } catch (err) {
        console.error("[auth] session callback error:", err);
      }

      return session;
    },
  },
});
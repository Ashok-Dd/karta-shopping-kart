import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret:    process.env.AUTH_SECRET,   // ← explicitly set
  trustHost: true,                      // ← required for Vercel deployments

  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;

          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (err) {
          console.error("[auth] credentials error:", err);
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: { signIn: "/login", error: "/login" },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        try {
          const dbUser = await prisma.user.upsert({
            where:  { email: user.email },
            update: { name: user.name ?? undefined, image: user.image ?? undefined },
            create: { email: user.email, name: user.name ?? null, image: user.image ?? null, role: "USER" },
          });
          user.id = dbUser.id;
        } catch (err) {
          console.error("[auth] Google signIn upsert failed:", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      try {
        if (user) {
          token.id   = user.id;
          token.role = (user as { role?: string }).role ?? "USER";
        }
        if (token.id && !token.role) {
          const dbUser = await prisma.user.findUnique({
            where:  { id: token.id as string },
            select: { role: true },
          });
          token.role = dbUser?.role ?? "USER";
        }
      } catch (err) {
        console.error("[auth] jwt callback error:", err);
        token.role = "USER";
      }
      return token;
    },

    async session({ session, token }) {
      try {
        if (session.user) {
          (session.user as { id?: string; role?: string }).id   = token.id as string;
          (session.user as { id?: string; role?: string }).role = token.role as string ?? "USER";
        }
      } catch (err) {
        console.error("[auth] session callback error:", err);
      }
      return session;
    },
  },
});
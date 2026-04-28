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

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    /**
     * Runs immediately after successful provider sign-in.
     * For Google users we upsert them into the DB so their DB id
     * exists before the JWT is minted — this prevents the FK error
     * when they try to add items to cart.
     */
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        try {
          const dbUser = await prisma.user.upsert({
            where:  { email: user.email },
            update: {
              name:  user.name  ?? undefined,
              image: user.image ?? undefined,
            },
            create: {
              email: user.email,
              name:  user.name  ?? null,
              image: user.image ?? null,
              role:  "USER",
            },
          });
          // Override with the real DB id so jwt() encodes it
          user.id = dbUser.id;
        } catch (err) {
          console.error("[auth] Google upsert failed:", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      // Re-hydrate role if missing (e.g. after server restart with existing cookie)
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages:   { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
});
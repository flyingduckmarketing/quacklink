import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) return null;
        if (user.suspended) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.username,
          username: user.username,
          plan: user.plan,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username;
        token.plan = (user as any).plan;
        token.role = (user as any).role;
        token.suspended = false;
        return token;
      }

      // Re-check the DB on every request that touches the session (not just
      // on an explicit update() call), so a suspension or role change takes
      // effect on the user's very next request instead of waiting out a
      // 30-day JWT. See PROJECT.md §9 for the tradeoffs of this approach.
      if (token.id) {
        const fresh = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (!fresh) {
          token.suspended = true;
        } else {
          token.plan = fresh.plan;
          token.role = fresh.role;
          token.suspended = fresh.suspended;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).plan = token.plan;
        (session.user as any).role = token.role;
        (session.user as any).suspended = token.suspended;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

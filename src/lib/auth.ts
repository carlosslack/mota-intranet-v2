import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const ALLOWED_HD = process.env.GOOGLE_HD ?? "mota.adv.br";
const ADMIN_EMAIL = process.env.GOOGLE_ADMIN_EMAIL ?? "ti@mota.adv.br";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          hd: ALLOWED_HD,
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/entrar",
  },
  callbacks: {
    async signIn({ user, profile }) {
      const email = user?.email ?? profile?.email;
      if (!email) return false;

      const domain = email.split("@")[1]?.toLowerCase();
      if (domain !== ALLOWED_HD.toLowerCase()) return false;

      const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "TI" : "USER";

      await db.user.upsert({
        where: { email },
        create: {
          email,
          name: user?.name ?? profile?.name ?? null,
          image: user?.image ?? (profile?.picture as string | undefined) ?? null,
          role,
        },
        update: {
          name: user?.name ?? profile?.name ?? undefined,
          image: user?.image ?? (profile?.picture as string | undefined) ?? undefined,
        },
      });

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const role = (user as { role?: "USER" | "TI" | "ADMIN" }).role ?? "USER";
        session.user.role = role;
      }
      return session;
    },
  },
});

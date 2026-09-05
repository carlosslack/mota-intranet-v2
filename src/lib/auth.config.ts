import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

const HD = process.env.GOOGLE_HD ?? 'mota.adv.br';

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { hd: HD, prompt: 'select_account' } }
    })
  ],
  pages: { signIn: '/entrar' },
  callbacks: {
    async signIn({ profile }) {
      const email = (profile?.email ?? '').toLowerCase();
      return email.endsWith('@' + HD);
    },
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as any).id = (user as any).id;
        (session.user as any).role = (user as any).role;
      }
      return session;
    }
  },
  trustHost: true
} satisfies NextAuthConfig;

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import authConfig from '@/lib/auth.config';

const ADMIN_TI = (process.env.GOOGLE_ADMIN_EMAIL ?? 'ti@mota.adv.br').toLowerCase();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  events: {
    async createUser({ user }) {
      const email = (user.email ?? '').toLowerCase();
      const role = email === ADMIN_TI ? 'TI' : 'USER';
      await prisma.user.update({ where: { id: user.id! }, data: { role: role as any } });
    }
  }
});

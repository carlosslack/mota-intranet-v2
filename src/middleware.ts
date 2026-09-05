import NextAuth from 'next-auth';
import authConfig from '@/lib/auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  const isAuth = !!req.auth;
  const url = req.nextUrl;
  const isPublic = url.pathname.startsWith('/entrar') || url.pathname.startsWith('/api/auth');
  if (!isAuth && !isPublic) {
    const to = new URL('/entrar', req.url);
    to.searchParams.set('callbackUrl', url.pathname);
    return Response.redirect(to);
  }
});

export const config = {
  matcher: ['/((?!api/auth|_next|assets|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)']
};

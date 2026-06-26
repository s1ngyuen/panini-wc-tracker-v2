import { auth } from '@/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isProtected =
    pathname.startsWith('/collection') ||
    pathname.startsWith('/swaps')      ||
    pathname.startsWith('/api/collection') ||
    pathname.startsWith('/api/trades');

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL('/', req.nextUrl));
  }
});

export const config = {
  matcher: ['/collection/:path*', '/swaps/:path*', '/api/:path*'],
};

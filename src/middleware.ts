export { auth as middleware } from '@/auth';

export const config = {
  // Only protect page routes — API routes handle auth themselves (return 401)
  matcher: ['/collection/:path*', '/swaps/:path*'],
};

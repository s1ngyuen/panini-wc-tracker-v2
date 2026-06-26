// Auth temporarily disabled for UI inspection — re-enable before going live
export default function middleware() {}

export const config = {
  matcher: ['/collection/:path*', '/swaps/:path*', '/api/:path*'],
};

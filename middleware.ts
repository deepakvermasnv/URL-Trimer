import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');

  // Redirect from url-trimer.vercel.app to www.urltrim.online
  if (host === 'url-trimer.vercel.app') {
    url.host = 'www.urltrim.online';
    url.protocol = 'https';
    return NextResponse.redirect(url, 301);
  }

  // Optional: Also redirect non-www to www if desired, 
  // but keeping it simple for the user's specific request first.
  if (host === 'urltrim.online') {
    url.host = 'www.urltrim.online';
    url.protocol = 'https';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

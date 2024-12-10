import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Load allowed client subdomains from environment variables
const ALLOWED_CLIENTS = process.env.ALLOWED_CLIENTS?.split(',') || [];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];

  console.log('🚀 Middleware executed!');
  console.log('🌐 Full hostname:', hostname);
  console.log('🏠 Detected subdomain:', subdomain);

  // Skip check for localhost
  if (hostname.startsWith('localhost')) {
    console.log('✅ Localhost detected - skipping check');
    return NextResponse.next();
  }

  if (!ALLOWED_CLIENTS.includes(subdomain)) {
    console.log('❌ Unauthorized subdomain');
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  console.log('✅ Access granted');
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and unauthorized page
    '/((?!unauthorized|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};

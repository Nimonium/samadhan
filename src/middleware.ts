import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply RBAC to /api routes (except auth routes)
  if (!pathname.startsWith('/api/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No access token' }, { status: 401 });
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or expired access token' }, { status: 401 });
  }

  const role = payload.role;

  // RBAC checks based on URL paths
  if (pathname.startsWith('/api/citizen') && role !== 'citizen') {
    return NextResponse.json({ error: 'Forbidden: Requires citizen role' }, { status: 403 });
  }

  if (pathname.startsWith('/api/officer') && role !== 'officer') {
    return NextResponse.json({ error: 'Forbidden: Requires officer role' }, { status: 403 });
  }

  if (pathname.startsWith('/api/admin') && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Requires admin role' }, { status: 403 });
  }

  if (pathname.startsWith('/api/cm') && role !== 'cm') {
    return NextResponse.json({ error: 'Forbidden: Requires cm role' }, { status: 403 });
  }

  // Inject user info into headers for downstream API routes to consume
  const requestHeaders = new Headers(request.headers);
  // Security: Explicitly delete any client-provided values for these headers before setting the verified ones
  requestHeaders.delete('x-user-id');
  requestHeaders.delete('x-user-role');
  requestHeaders.delete('x-user-department');

  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-role', payload.role);
  if (payload.department) {
    requestHeaders.set('x-user-department', payload.department);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/:path*'],
};

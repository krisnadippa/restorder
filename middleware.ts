import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/auth';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // 1. Define guarded paths
  const isProtectedRoute = path.startsWith('/admin') && !path.startsWith('/admin/login');
  
  // APIs that shouldn't be accessed by public
  // GET requests are allowed (e.g for fetching menu) but mutations are blocked
  const isPublicOrderMutation = path === '/api/orders' || 
                                (path.startsWith('/api/orders/') && path.endsWith('/pay'));

  const isProtectedApi = path.startsWith('/api/') && 
                         !path.startsWith('/api/auth/') &&
                         req.method !== 'GET' && 
                         !isPublicOrderMutation && // Allow public order creation and payment
                         !path.startsWith('/api/webhooks/'); // Allow Xendit Webhook POST

  if (isProtectedRoute || isProtectedApi) {
    // 2. Retrieve secure cookie
    const token = req.cookies.get('admin_session')?.value;
    
    // 3. Decrypt and Verify
    const session = token ? await decrypt(token) : null;
    
    // 4. Handle Redirection / Rejection
    if (!session) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
    }
  }

  // Allow through if valid or public route
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

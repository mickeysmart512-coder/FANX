import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect live session rooms
  if (req.nextUrl.pathname.startsWith('/live/')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based access control can be implemented here by checking user metadata or profile
    const userRole = session.user.user_metadata.role;

    // Example logic: Only celebrities can access the "publish" views
    if (req.nextUrl.pathname.endsWith('/publish') && userRole !== 'celebrity') {
      return NextResponse.redirect(new URL('/live', req.url));
    }
  }

  // Protect admin dashboard
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (session?.user.user_metadata.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/live/:path*', '/admin/:path*', '/dashboard/:path*'],
};

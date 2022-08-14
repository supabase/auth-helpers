import { withMiddlewareAuth } from '@supabase/auth-helpers-nextjs';

export const middleware = withMiddlewareAuth({ redirectTo: '/' });

export const config = {
  matcher: ['/middleware-protected/:path*']
};

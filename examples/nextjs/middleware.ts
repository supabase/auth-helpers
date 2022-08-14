import { withMiddlewareAuth } from '@supabase/auth-helpers-nextjs';

export const middleware = withMiddlewareAuth({
  redirectTo: '/login',
  authGuard: {
    isPermitted: async (user) => user.email?.endsWith('@example.com') ?? false,
    redirectTo: '/insufficient-permissions'
  }
});

export const config = {
  matcher: ['/middleware-protected/:path*']
};

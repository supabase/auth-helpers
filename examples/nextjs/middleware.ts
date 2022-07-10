import { withMiddlewareAuth } from '@supabase/auth-helpers-nextjs/middleware';

export const middleware = withMiddlewareAuth([{
  redirectTo: '/',
  matcher: ['/middleware-protected/:path*'],
  authGuard: {
    isPermitted: async (user) => user.email?.endsWith('@example.com') ?? false,
    redirectTo: '/insufficient-permissions'
  }
}, {
  redirectTo: '/',
  matcher: ['/middleware-protected-page'],
}]);
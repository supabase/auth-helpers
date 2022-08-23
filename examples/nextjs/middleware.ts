import { withMiddlewareAuth } from '@supabase/auth-helpers-nextjs/dist/middleware';

export const middleware = withMiddlewareAuth({
  redirectTo: '/login',
  authGuard: {
    isPermitted: async (user) => {
      return user.email.endsWith('@example.com') ?? false;
    },
    redirectTo: '/insufficient-permissions'
  }
});

export const config = {
  matcher: '/middleware-protected'
};

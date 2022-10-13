import { withMiddlewareAuth } from '@supabase/auth-helpers-nextjs';

export const middleware = withMiddlewareAuth({
  redirectTo: '/',
  authGuard: {
    isPermitted: async (user) => {
      return user.email?.endsWith('@gmail.com') ?? false;
    },
    redirectTo: '/insufficient-permissions'
  }
});

export const config = {
  matcher: '/middleware-protected'
};

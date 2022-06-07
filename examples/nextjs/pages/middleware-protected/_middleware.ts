import { withMiddlewareAuth } from '@supabase/auth-helpers-nextjs/dist/middleware';

export const middleware = withMiddlewareAuth({
  redirectTo: '/login',
  permissionGuard: {
    isPermitted: async (user) => user.email?.endsWith('@example.com') || false,
    redirectTo: '/insufficient-permissions'
  }
});

import { withMiddlewareAuth } from '@supabase/supabase-auth-helpers/nextjs/middleware';

export const middleware = withMiddlewareAuth({
  redirectTo: "/login",
  permissionGuard: {
    isPermitted: async (user) => user.email?.endsWith('@example.com') || false,
    redirectTo: '/insufficient-permissions'
  }
});

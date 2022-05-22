import { withMiddlewareAuth } from '@supabase/supabase-auth-helpers/nextjs/middleware';
import { createClient } from '@supabase/supabase-js';

const getServerClientWithEnvCheck = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SERVICE_ROLE_KEY) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SERVICE_ROLE_KEY env variables are required!'
    );
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_ROLE_KEY!,
    { autoRefreshToken: false, persistSession: false }
  );
};

const serverClient = getServerClientWithEnvCheck();

export const middleware = withMiddlewareAuth({
  permissionGuard: {
    isPermitted: async (user) => {
      const { data } = await serverClient
        .from('admin')
        .select('*')
        .eq('id', user.id)
        .single();
      return !!data;
    },
    redirectTo: '/insufficient-permissions'
  }
});

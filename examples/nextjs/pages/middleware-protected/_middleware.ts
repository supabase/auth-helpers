import { withMiddlewareAuth } from '@supabase/supabase-auth-helpers/nextjs/middleware';

export const middleware = withMiddlewareAuth();

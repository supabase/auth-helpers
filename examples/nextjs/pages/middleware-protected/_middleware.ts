import { withMiddlewareAuthRequired } from '@supabase/auth-helpers-nextjs';

export const middleware = withMiddlewareAuthRequired();

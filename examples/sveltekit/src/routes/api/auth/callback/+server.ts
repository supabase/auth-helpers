import type { RequestHandler } from './$types';
import { handleCallbackSession } from '@supabase/auth-helpers-sveltekit/server';

// TODO: remove this when the cookie bug if fixed
export const POST: RequestHandler = handleCallbackSession;

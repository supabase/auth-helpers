import { COOKIE_OPTIONS as SHARED_COOKIE_OPTIONS } from '@supabase/auth-helpers-shared';
import type { CookieOptions } from './types';
export {
  TOKEN_REFRESH_MARGIN,
  ENDPOINT_PREFIX
} from '@supabase/auth-helpers-shared';

export const COOKIE_OPTIONS: Required<CookieOptions> = {
  ...SHARED_COOKIE_OPTIONS,
  secure: true
};

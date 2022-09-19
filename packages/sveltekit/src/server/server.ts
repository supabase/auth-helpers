import {
  COOKIE_OPTIONS,
  ENDPOINT_PREFIX,
  TOKEN_REFRESH_MARGIN
} from '../constants';
import type { SetupServerOptions } from '../types';
import { setServerConfig } from './config';

export function setupSupabaseServer({
  supabaseClient,
  cookieName = 'sb',
  cookieOptions = {},
  tokenRefreshMargin = TOKEN_REFRESH_MARGIN,
  endpointPrefix = ENDPOINT_PREFIX,
  getSessionFromLocals = (locals) => locals.session,
  setSessionToLocals = (locals, session) => (locals.session = session)
}: SetupServerOptions) {
  setServerConfig({
    supabaseClient,
    cookieName,
    cookieOptions: { ...COOKIE_OPTIONS, ...cookieOptions },
    tokenRefreshMargin,
    endpointPrefix,
    getSessionFromLocals,
    setSessionToLocals
  });
}

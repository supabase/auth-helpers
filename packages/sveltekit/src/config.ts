import type { Config, SetupOptions } from './types';
import {
  ENDPOINT_PREFIX,
  TOKEN_REFRESH_MARGIN,
  COOKIE_OPTIONS
} from './constants';

let config: Config;

/**
 * Setup the global client configuration
 */
export function setupSupabaseHelpers({
  supabaseClient,
  tokenRefreshMargin = TOKEN_REFRESH_MARGIN,
  endpointPrefix = ENDPOINT_PREFIX,
  cookieOptions = {},
  getSessionFromPageData = (data) => data.session,
  getSessionFromLocals = (locals) => locals.session,
  setSessionToLocals = (locals, session) => (locals.session = session)
}: SetupOptions) {
  if (config) throw new Error('`setupSupabaseHelpers` called multiple times');

  if (!supabaseClient) {
    throw new Error(
      'You need to pass the your supabase instance to `setupSupabaseHelpers`'
    );
  }

  config = {
    supabaseClient,
    tokenRefreshMargin,
    endpointPrefix,
    cookieOptions: {
      ...COOKIE_OPTIONS,
      ...cookieOptions
    },
    getSessionFromPageData,
    getSessionFromLocals,
    setSessionToLocals
  };
}

export function getConfig(): Config {
  if (!config) {
    throw new Error(
      'Not initialized, make sure to call `setupSupabaseHelpers({ supabaseClient })`'
    );
  }
  return config;
}

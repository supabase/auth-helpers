import {
  MAX_RETRIES,
  RETRY_INTERVAL,
  TOKEN_REFRESH_MARGIN
} from '$lib/shared/utils/constants';
import type { UserFetcher } from '$lib/shared/types';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { setUser, setAccessToken, setError, type UserExtra } from '$lib/store';

let networkRetries = 0;
let refreshTokenTimer: number;

const handleError = async (error: Response) => {
  if (typeof error.json !== 'function') {
    return String(error);
  }
  const err = await error.json();
  return {
    message:
      err.msg ||
      err.message ||
      err.error_description ||
      err.error ||
      JSON.stringify(err),
    status: error?.status || 500
  };
};

export const userFetcher: UserFetcher = async (url) => {
  const response = await fetch(url, { method: 'POST' }).catch(
    () => undefined
  );
  if (!response) {
    return { user: null, accessToken: null, error: 'Request failed' };
  }
  return response.ok
    ? response.json()
    : { user: null, accessToken: null, error: await handleError(response) };
};

export interface Session {
  user: User;
  accessToken?: string;
}

interface CheckSessionArgs {
  profileUrl: string;
  autoRefreshToken: boolean;
  supabaseClient: SupabaseClient;
}

let profileUrl: CheckSessionArgs["profileUrl"];
let autoRefreshToken: CheckSessionArgs["autoRefreshToken"];
let supabaseClient: CheckSessionArgs["supabaseClient"];

export const checkSession = async (props: CheckSessionArgs): Promise<void> => {
  if (!profileUrl || !autoRefreshToken || !supabaseClient) {
    profileUrl = props.profileUrl;
    autoRefreshToken = props.autoRefreshToken;
    supabaseClient = props.supabaseClient;
  }

  try {
    networkRetries++;
    const { user, accessToken, error } = await userFetcher(profileUrl);
    if (error) {
      if (error === 'Request failed' && networkRetries < MAX_RETRIES) {
        if (refreshTokenTimer) clearTimeout(refreshTokenTimer);
        refreshTokenTimer = setTimeout(
          checkSession,
          RETRY_INTERVAL ** networkRetries * 100 // exponential backoff
        );
        return;
      }
      setError(new Error(error));
    }
    networkRetries = 0;
    if (accessToken) {
      supabaseClient.auth.setAuth(accessToken);
      setAccessToken(accessToken);
    }
    setUser(user);

    // Set up auto token refresh
    if (autoRefreshToken) {
      const expiresAt = (user as UserExtra).exp;
      let timeout = 20 * 1000;
      if (expiresAt) {
        const timeNow = Math.round(Date.now() / 1000);
        const expiresIn = expiresAt - timeNow;
        const refreshDurationBeforeExpires =
          expiresIn > TOKEN_REFRESH_MARGIN ? TOKEN_REFRESH_MARGIN : 0.5;
        timeout = (expiresIn - refreshDurationBeforeExpires) * 1000;
      }
      setTimeout(checkSession, timeout);
    }
  } catch (_e) {
    const err = new Error(`The request to ${profileUrl} failed`);
    setError(err);
  }
};
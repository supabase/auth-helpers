import { beforeNavigate } from '$app/navigation';
import type { SupabaseClient, Subscription, User } from '@supabase/supabase-js';
import type { UserFetcher } from 'shared/types';
import {
  MAX_RETRIES,
  RETRY_INTERVAL,
  TOKEN_REFRESH_MARGIN
} from 'shared/utils/constants';
import { writable, type Writable } from 'svelte/store';
import { redirect } from './helpers';

let networkRetries = 0;
let refreshTokenTimer: ReturnType<typeof setTimeout>;

interface UserData {
  user: User | null;
  accessToken: string | null;
}

const handleError = async (error: any) => {
  console.log(error);
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

const userFetcher: UserFetcher = async (url) => {
  const response = await fetch(url, { method: 'POST' }).catch(() => undefined);
  if (!response) {
    return { user: null, accessToken: null, error: 'Request failed' };
  }
  return response.ok
    ? response.json()
    : { user: null, accessToken: null, error: await handleError(response) };
};

export interface Props {
  supabaseClient: SupabaseClient;
  callbackUrl?: string;
  profileUrl?: string;
  redirectUrl?: string;
  autoRefreshToken?: boolean;
  [propName: string]: any;
}

interface UserStore {
  isLoading: Writable<boolean>;
  error: Writable<Error>;
  checkAuthState: () => Subscription | null;
}

const createUserStore = (props: Props) => {
  const {
    supabaseClient,
    callbackUrl = '/api/auth/callback',
    profileUrl = '/api/auth/user',
    redirectUrl = '/',
    autoRefreshToken = true
  } = props;

  const isLoading = writable<boolean>(false);
  const error = writable<Error>();

  const checkSession = async (): Promise<UserData> => {
    try {
      networkRetries++;
      const { user, accessToken, error: err } = await userFetcher(profileUrl);
      if (err) {
        if (err === 'Request failed' && networkRetries < MAX_RETRIES) {
          if (refreshTokenTimer) clearTimeout(refreshTokenTimer);
          refreshTokenTimer = setTimeout(
            checkSession,
            RETRY_INTERVAL ** networkRetries * 100 // exponential backoff
          );
          return { user: null, accessToken: null };
        }
        error.set(new Error(err));
      }
      networkRetries = 0;
      if (accessToken) {
        supabaseClient.auth.setAuth(accessToken);
      }
      // Set up auto token refresh
      if (autoRefreshToken) {
        const expiresAt = (user as any).exp;
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
      if (!user) isLoading.set(false);
      return {
        user,
        accessToken
      };
    } catch (_e) {
      const err = new Error(`The request to ${profileUrl} failed`);
      error.set(err);
      return { user: null, accessToken: null };
    }
  };

  const handleVisibilityChange = async () => {
    if (document?.visibilityState === 'visible') {
      isLoading.set(true);
      await checkSession();
      isLoading.set(false);
    }
  };

  const checkAuthState = () => {
    handleVisibilityChange();
    if (autoRefreshToken)
      window?.addEventListener('visibilitychange', handleVisibilityChange);
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') return;
        isLoading.set(true);
        // Forward session from client to server where it is set in a Cookie.
        // NOTE: this will eventually be removed when the Cookie can be set differently.
        await fetch(callbackUrl, {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session })
        }).then((res) => {
          if (!res.ok) {
            const err = new Error(`The request to ${callbackUrl} failed`);
            error.set(err);
          }
        });
        // Fetch the user from the API route
        const { user } = await checkSession();
        isLoading.set(false);
        redirect(redirectUrl)(user);
      }
    );

    return authListener;
  };

  beforeNavigate(({ from, to }) => {
    checkSession();
  });

  return {
    isLoading,
    error,
    checkAuthState
  };
};

let user: UserStore;

export const UserStore = (props: Props) => {
  if (user === undefined) {
    user = createUserStore(props);
  }
  return user;
};

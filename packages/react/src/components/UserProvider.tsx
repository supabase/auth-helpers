import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback
} from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import {
  CallbackUrlFailed,
  ErrorPayload,
  UserFetcher,
  UserState
} from '@supabase/auth-helpers-shared';
import {
  TOKEN_REFRESH_MARGIN,
  RETRY_INTERVAL,
  MAX_RETRIES
} from '@supabase/auth-helpers-shared';

let networkRetries = 0;
let refreshTokenTimer: ReturnType<typeof setTimeout>;

const UserContext = createContext<UserState | undefined>(undefined);

const handleError = async (error: any) => {
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
  const response = await fetch(url).catch(() => undefined);
  if (!response)
    return { user: null, accessToken: null, error: 'Request failed' };
  return response.ok
    ? response.json()
    : { user: null, accessToken: null, error: await handleError(response) };
};

export interface Props {
  supabaseClient: SupabaseClient;
  callbackUrl?: string;
  profileUrl?: string;
  user?: User;
  fetcher?: UserFetcher;
  autoRefreshToken?: boolean;
  [propName: string]: any;
}

export const UserProvider = (props: Props) => {
  const {
    supabaseClient,
    callbackUrl = '/api/auth/callback',
    profileUrl = '/api/auth/user',
    user: initialUser = null,
    fetcher = userFetcher,
    autoRefreshToken = true
  } = props;
  const [user, setUser] = useState<User | null>(initialUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<ErrorPayload | string>();

  const checkSession = useCallback(async (): Promise<void> => {
    try {
      networkRetries++;
      const { user, accessToken, error } = await fetcher(profileUrl);
      if (error) {
        if (error === 'Request failed' && networkRetries < MAX_RETRIES) {
          if (refreshTokenTimer) clearTimeout(refreshTokenTimer);
          refreshTokenTimer = setTimeout(
            checkSession,
            RETRY_INTERVAL ** networkRetries * 100 // exponential backoff
          );
          return;
        }
        setError(new Error(error).message);
      }
      networkRetries = 0;
      if (accessToken) {
        supabaseClient.auth.setAuth(accessToken);
        setAccessToken(accessToken);
      }
      setUser(user);
      // Set up auto token refresh
      if (autoRefreshToken) {
        let timeout = 20 * 1000;
        const expiresAt = (user as any)?.exp;
        if (expiresAt) {
          const timeNow = Math.round(Date.now() / 1000);
          const expiresIn = expiresAt - timeNow;
          const refreshDurationBeforeExpires =
            expiresIn > TOKEN_REFRESH_MARGIN ? TOKEN_REFRESH_MARGIN : 0.5;
          timeout = (expiresIn - refreshDurationBeforeExpires) * 1000;
        }
        setTimeout(checkSession, timeout);
      }
      if (!user) setIsLoading(false);
    } catch (_e) {
      const error = new CallbackUrlFailed(profileUrl);
      setError(error.toObj());
    }
  }, [profileUrl]);

  const handleVisibilityChange = async () => {
    if (document?.visibilityState === 'visible') {
      setIsLoading(true);
      await checkSession();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleVisibilityChange();
    if (autoRefreshToken)
      window?.addEventListener('visibilitychange', handleVisibilityChange);
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') return; // ignore this as we're refreshing tokens server-side.
        setIsLoading(true);
        // Forward session from client to server where it is set in a Cookie.
        // NOTE: this will eventually be removed when the Cookie can be set differently.
        await fetch(callbackUrl, {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session })
        }).then((res) => {
          if (!res.ok) {
            const error = new CallbackUrlFailed(callbackUrl);
            setError(error.message);
          }
        });
        // Fetch the user from the API route
        await checkSession();
        setIsLoading(false);
      }
    );

    return () => {
      window?.removeEventListener('visibilitychange', handleVisibilityChange);
      authListener?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    isLoading,
    user,
    accessToken,
    error,
    checkSession
  };
  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserProvider.`);
  }
  return context;
};

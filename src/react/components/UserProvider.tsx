import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback
} from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { UserFetcher, UserState } from '../types';

const UserContext = createContext<UserState | undefined>(undefined);

const userFetcher: UserFetcher = async (url) => {
  const response = await fetch(url);
  return response.ok ? response.json() : { user: null, accessToken: null };
};

export interface Props {
  supabaseClient: SupabaseClient;
  callbackUrl?: string;
  profileUrl?: string;
  user?: User;
  fetcher?: UserFetcher;
  [propName: string]: any;
}

export const UserProvider = (props: Props) => {
  const {
    supabaseClient,
    callbackUrl = '/api/auth/callback',
    profileUrl = '/api/auth/user',
    user: initialUser = null,
    fetcher = userFetcher
  } = props;
  const [user, setUser] = useState<User | null>(initialUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<Error>();

  const checkSession = useCallback(async (): Promise<void> => {
    try {
      const { user, accessToken } = await fetcher(profileUrl);
      if (accessToken) {
        supabaseClient.auth.setAuth(accessToken);
        setAccessToken(accessToken);
      }
      setUser(user);
      if (!user) setIsLoading(false);
    } catch (_e) {
      const error = new Error(`The request to ${profileUrl} failed`);
      setError(error);
    }
  }, [profileUrl]);

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      setIsLoading(true);
      checkSession();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    window?.addEventListener('visibilitychange', handleVisibilityChange);
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED') return; // ignore this as it also emits a SIGNED_IN event.
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
            const error = new Error(`The request to ${callbackUrl} failed`);
            setError(error);
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

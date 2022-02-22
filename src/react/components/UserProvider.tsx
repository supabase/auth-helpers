import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback
} from 'react';
import { useRouter } from 'next/router';
import { SupabaseClient, User } from '@supabase/supabase-js';

export type UserState = {
  user: User | null;
  onUserLoadedData: any | null;
  accessToken: string | null;
  error?: Error;
  isLoading: boolean;
};

const UserContext = createContext<UserState>({
  user: null,
  onUserLoadedData: null,
  accessToken: null,
  isLoading: true
});

type UserFetcher = (
  url: string
) => Promise<{ user: User | null; accessToken: string | null }>;
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
  onUserLoaded?: (supabaseClient: SupabaseClient) => Promise<any>;
  [propName: string]: any;
}

export const UserProvider = (props: Props) => {
  const {
    supabaseClient,
    callbackUrl = '/api/auth/callback',
    profileUrl = '/api/auth/user',
    user: initialUser = null,
    fetcher = userFetcher,
    onUserLoaded
  } = props;
  const [user, setUser] = useState<User | null>(initialUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<Error>();
  const [onUserLoadedData, setOnUserLoadedData] = useState<any>(null);
  const { pathname } = useRouter();

  const checkSession = useCallback(async (): Promise<void> => {
    try {
      const { user, accessToken } = await fetcher(profileUrl);
      if (accessToken) {
        supabaseClient.auth.setAuth(accessToken);
        setAccessToken(accessToken);
      }
      setUser(user);
    } catch (_e) {
      const error = new Error(`The request to ${profileUrl} failed`);
      setError(error);
    }
  }, [profileUrl]);

  // Get cached user on every page render.
  useEffect(() => {
    async function runOnPathChange() {
      setIsLoading(true);
      await checkSession();
      if (onUserLoadedData || !onUserLoaded) {
        setIsLoading(false);
      }
    }
    runOnPathChange();
  }, [pathname]);

  // Only load user Data the first time after user is loaded.
  useEffect(() => {
    async function loadUserData() {
      if (onUserLoaded && !onUserLoadedData) {
        try {
          const response = await onUserLoaded(supabaseClient);
          setOnUserLoadedData(response);
          setIsLoading(false);
        } catch (error) {
          console.log('Error in your `onUserLoaded` method:', error);
        }
      }
    }
    if (user) {
      loadUserData();
    } else {
      setOnUserLoadedData(null);
    }
  }, [user, accessToken]);

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
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
      authListener?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    isLoading,
    user,
    onUserLoadedData,
    accessToken,
    error
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

import { SupabaseClient, User } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

export type UserState = {
  user: User | null;
  accessToken: string | null;
  error?: Error;
  isLoading: boolean;
};

const UserContext = createContext<UserState | undefined>(undefined);

type UserFetcher = (url: string) => Promise<{
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}>;
const userFetcher: UserFetcher = async (url) => {
  const response = await fetch(url);
  return response.ok ? response.json() : { user: null, accessToken: null };
};

type RefreshToken = {
  token: string;
  expiresAt: number;
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
  const [refreshToken, setRefreshToken] = useState<RefreshToken | null>(null);
  const refreshTimer = useRef<NodeJS.Timeout | undefined>();
  const { pathname } = useRouter();

  const checkSession = useCallback(async (): Promise<void> => {
    try {
      const { user, accessToken, refreshToken, expiresAt } = await fetcher(
        profileUrl
      );
      if (accessToken) {
        supabaseClient.auth.setAuth(accessToken);
        setAccessToken(accessToken);
      }
      if (refreshToken && expiresAt) {
        setRefreshToken({ token: refreshToken, expiresAt });
      }
      setUser(user);
      if (!user) setIsLoading(false);
    } catch (_e) {
      const error = new Error(`The request to ${profileUrl} failed`);
      setError(error);
    }
  }, [fetcher, profileUrl, supabaseClient]);

  useEffect(() => {
    if (!refreshToken) return;

    if (refreshTimer.current !== undefined) {
      clearTimeout(refreshTimer.current);
    }

    const timeNow = Math.round(Date.now() / 1000);
    const expiresIn = refreshToken.expiresAt - timeNow;
    const refreshDurationBeforeExpires = expiresIn > 60 ? 60 : 0.5;
    const ms = (expiresIn - refreshDurationBeforeExpires) * 1000;

    const timer = setTimeout(async () => {
      // setSession triggers a refresh of the token
      await supabaseClient.auth.setSession(refreshToken.token);
      refreshTimer.current = undefined;
    }, ms);

    refreshTimer.current = timer;

    return () => {
      if (refreshTimer.current !== undefined) {
        clearTimeout(refreshTimer.current);
      }
    };
  }, [refreshToken, supabaseClient]);

  // Get cached user on every page render.
  useEffect(() => {
    async function runOnPathChange() {
      setIsLoading(true);
      await checkSession();
      setIsLoading(false);
    }
    runOnPathChange();
  }, [checkSession, pathname]);

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

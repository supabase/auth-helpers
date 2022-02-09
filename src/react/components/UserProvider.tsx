import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback
} from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';

export type UserState = {
  user?: User;
  error?: Error;
  isLoading: boolean;
};

const UserContext = createContext<UserState>({
  user: undefined,
  isLoading: false
});

type UserFetcher = (url: string) => Promise<User | undefined>;
const userFetcher: UserFetcher = async (url) => {
  const response = await fetch(url);
  return response.ok ? response.json() : undefined;
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
    user: initialUser,
    fetcher = userFetcher
  } = props;
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<Error>();

  const checkSession = useCallback(async (): Promise<void> => {
    try {
      const user = await fetcher(profileUrl);
      setUser(user);
    } catch (_e) {
      const error = new Error(`The request to ${profileUrl} failed`);
      setError(error);
    }
  }, [profileUrl]);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await checkSession();
      setIsLoading(false);
    }
    init();
  }, []);

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

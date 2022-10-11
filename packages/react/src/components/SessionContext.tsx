import { AuthError, Session, SupabaseClient } from '@supabase/supabase-js';
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

export type SessionContext<SB = SupabaseClient> =
  | {
      isLoading: true;
      session: null;
      error: null;
      supabaseClient: SB;
    }
  | {
      isLoading: false;
      session: Session;
      error: null;
      supabaseClient: SB;
    }
  | {
      isLoading: false;
      session: null;
      error: AuthError;
      supabaseClient: SB;
    }
  | {
      isLoading: false;
      session: null;
      error: null;
      supabaseClient: SB;
    };

const SessionContext = createContext<SessionContext>({
  isLoading: true,
  session: null,
  error: null,
  supabaseClient: {} as any
});

interface _SessionContextProviderProps {
  supabaseClient: SupabaseClient;
  initialSession?: Session | null;
}

export type SessionContextProviderProps = Pick<
  _SessionContextProviderProps,
  'initialSession'
>;

const _SessionContextProvider = ({
  supabaseClient,
  initialSession = null,
  children
}: PropsWithChildren<_SessionContextProviderProps>) => {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSession);
  const [error, setError] = useState<AuthError>();

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      const {
        data: { session },
        error
      } = await supabaseClient.auth.getSession();

      // only update the react state if the component is still mounted
      if (mounted) {
        if (error) {
          setError(error);
          setIsLoading(false);
          return;
        }

        setSession(session);
        setIsLoading(false);
      }
    }

    getSession();
  }, []);

  useEffect(() => {
    const {
      data: { subscription }
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setSession(session);
      }

      if (event === 'SIGNED_OUT') {
        setSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value: SessionContext = useMemo(() => {
    if (isLoading) {
      return {
        isLoading: true,
        session: null,
        error: null,
        supabaseClient
      };
    }

    if (error) {
      return {
        isLoading: false,
        session: null,
        error,
        supabaseClient
      };
    }

    return {
      isLoading: false,
      session,
      error: null,
      supabaseClient
    };
  }, [isLoading, session, error]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export function createSessionContext(supabaseClient: SupabaseClient) {
  const SessionContextProvider = ({
    initialSession,
    children
  }: PropsWithChildren<SessionContextProviderProps>) => {
    return (
      <_SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={initialSession}
      >
        {children}
      </_SessionContextProvider>
    );
  };

  const useSessionContext = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
      throw new Error(
        `useSessionContext must be used within a SessionContextProvider.`
      );
    }

    return context as SessionContext<typeof supabaseClient>;
  };

  const useSupabaseClient = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
      throw new Error(
        `useSupabaseClient must be used within a SessionContextProvider.`
      );
    }

    return context.supabaseClient as typeof supabaseClient;
  };

  const useSession = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
      throw new Error(
        `useSession must be used within a SessionContextProvider.`
      );
    }

    return context.session;
  };

  const useUser = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
      throw new Error(`useUser must be used within a SessionContextProvider.`);
    }

    return context.session?.user ?? null;
  };

  return {
    SessionContextProvider,
    useSessionContext,
    useSupabaseClient,
    useSession,
    useUser
  };
}

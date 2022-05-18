import { beforeNavigate } from '$app/navigation';
import type { SupabaseClient, Subscription, User } from '@supabase/supabase-js';
import { writable, type Writable } from 'svelte/store';
import { redirect } from './helpers';

interface UserData {
  user: User | null;
  accessToken: string | null;
}

type UserFetcher = (url: string) => Promise<UserData>;
const userFetcher: UserFetcher = async (url) => {
  const response = await fetch(url, { method: 'POST' });
  return response.ok ? response.json() : { user: null, accessToken: null };
};

export interface Props {
  supabaseClient: SupabaseClient;
  callbackUrl?: string;
  profileUrl?: string;
  redirectUrl?: string;
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
    redirectUrl = '/'
  } = props;

  const isLoading = writable<boolean>(false);
  const error = writable<Error>();

  const checkSession = async (): Promise<UserData> => {
    try {
      const { user, accessToken } = await userFetcher(profileUrl);
      if (accessToken) {
        supabaseClient.auth.setAuth(accessToken);
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

  const checkAuthState = () => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
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

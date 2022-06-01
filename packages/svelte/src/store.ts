import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

export type UserExtra = User & { exp?: number };

interface Props {
    user: UserExtra | null;
    accessToken: string | null;
    isLoading: boolean;
    error: Error | null;
}

const initialValues: Props = {
    user: null,
    accessToken: null,
    isLoading: false,
    error: null
};

const userStore = writable<User | null>(initialValues.user);
const setUser = (usr: User | null) => userStore.set(usr);

const accessTokenStore = writable<string>(initialValues.accessToken);
const setAccessToken = (token: string) => accessTokenStore.set(token);

const isLoadingStore = writable(initialValues.isLoading);
const setIsLoading = (loading: boolean) => isLoadingStore.set(loading);

const errorStore = writable<Error | null>(initialValues.error);
const setError = (err: Error) => errorStore.set(err);

const resetAll = () => {
    setUser(initialValues.user);
    setAccessToken(initialValues.accessToken);
    setIsLoading(initialValues.isLoading);
    setError(initialValues.error);
};

const user = { subscribe: userStore.subscribe };
const accessToken = { subscribe: accessTokenStore.subscribe };
const isLoading = { subscribe: isLoadingStore.subscribe };
const error = { subscribe: errorStore.subscribe };

export {
    user,
    setUser,
    accessToken,
    setAccessToken,
    isLoading,
    setIsLoading,
    error,
    setError,
    resetAll
}
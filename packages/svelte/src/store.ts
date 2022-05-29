import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

export type UserExtra = User & { exp?: number };

interface Props {
    user: UserExtra | null;
    accessToken: string | null;
    isLoading: boolean;
    error: Error | null;
}

function createStore() {
    const initialValues = {
        user: null,
        accessToken: null,
        isLoading: false,
        error: null
    };

    const { subscribe, set, update } = writable<Props>(initialValues);

    const setUser = (user: User | null) => update(prop => ({
        ...prop,
        user,
        error: null
    }));

    const setAccessToken = (accessToken: string) => update(prop => ({
        ...prop,
        accessToken,
        error: null
    }));

    const setIsLoading = (isLoading: boolean) => update(prop => ({
        ...prop,
        isLoading,
        error: null
    }));

    const setError = (error: Error) => update(prop => ({
        ...prop,
        error
    }));

    return {
        set,
        subscribe,
        setUser,
        setAccessToken,
        setIsLoading,
        setError,
        reset: () => set(initialValues)
    }
}

export const store = createStore();
declare module "@supabase/auth-helpers-svelte" {
	import { SupabaseClient, User } from "@supabase/supabase-js";

	export default class UserContext {
		$$prop_def: {
			supabaseClient: SupabaseClient,
			callbackUrl?: string,
			profileUrl?: string,
			autoRefreshToken?: boolean,
			cbRedirect?: (user: User | null) => void
		};
	}
}

declare module "@supabase/auth-helpers-svelte/store" {
	import * as svelte_store from "svelte/store";
	import { User } from "@supabase/supabase-js";

	declare type UserExtra = User & {
		exp?: number;
	};
	interface Props {
		user: UserExtra | null;
		accessToken: string | null;
		isLoading: boolean;
		error: Error;
	}
	declare const store: {
		subscribe: (this: void, run: svelte_store.Subscriber<Props>, invalidate?: ((value?: Props | undefined) => void) | undefined) => svelte_store.Unsubscriber;
		setUser: (user: User | null) => void;
		setAccessToken: (accessToken: string) => void;
		setIsLoading: (isLoading: boolean) => void;
		setError: (error: Error) => void;
		reset: () => void;
	};

	export { UserExtra, store };
}

declare module "@supabase/auth-helpers-svelte/helpers" {
	import { SupabaseClient } from "@supabase/supabase-js";
	import { UserFetcher } from "shared/types";

	declare const key: {};
	declare const userFetcher: UserFetcher;
	interface CheckSessionArgs {
		profileUrl: string;
		autoRefreshToken: boolean;
		supabaseClient: SupabaseClient;
	}
	declare const checkSession: ({ profileUrl, autoRefreshToken, supabaseClient }: CheckSessionArgs) => Promise<void>;

	export { checkSession, key, userFetcher };
}
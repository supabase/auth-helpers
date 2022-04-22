/// <reference types="@sveltejs/kit" />
/// <reference types="@supabase/supabase-js" />

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare namespace App {
	interface Locals {
		user: User;
		accessToken: string | null;
		error: ApiError;
	}

	interface Platform {}

	interface Session {
		user: User;
		accessToken: string;
	}

	interface Stuff {}
}

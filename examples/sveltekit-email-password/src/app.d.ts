/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare namespace App {
	type AuthSession = import('@supabase/auth-helpers-svelte').Session;
	interface Locals {
		user: import('@supabase/supabase-js').User;
		accessToken: string | null;
		error: string | null;
	}

	interface Platform {}

	interface Session extends AuthSession {
	}

	interface Stuff {}
}

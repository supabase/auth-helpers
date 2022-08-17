/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare namespace App {
	interface Locals {
		user: import('@supabase/supabase-js').User;
		accessToken: string | null;
		error: string | null;
	}

	// interface Platform {}

	interface Session {
		user: import('@supabase/supabase-js').User;
		accessToken: string | null;
		error: string | null;
	}

	// interface Stuff {}
}

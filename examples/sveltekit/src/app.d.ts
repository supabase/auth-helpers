/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface Locals {
		session: import('@supabase/auth-helpers-sveltekit').SupabaseSession;
	}
	interface PageData {
		session: import('@supabase/auth-helpers-sveltekit').SupabaseSession;
	}
	// interface Error {}
	// interface Platform {}
}

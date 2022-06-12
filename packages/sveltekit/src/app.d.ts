/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare namespace App {
	type AuthSession = import('./types').Locals
	interface Locals extends AuthSession {
	}
}

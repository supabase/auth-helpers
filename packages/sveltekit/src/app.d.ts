// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  interface Locals {
    session: import('./').SupabaseSession;
  }

  interface PageData {
    session: import('./').SupabaseSession;
  }
  // interface PageError {}
  // interface Platform {}
}

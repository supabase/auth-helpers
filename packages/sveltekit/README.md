# @supabase/auth-helpers-sveltekit (BETA)

This submodule provides convenience helpers for implementing user authentication in [SvelteKit](https://kit.svelte.dev/) applications.

## Installation

Using [npm](https://npmjs.org):

```sh
npm install @supabase/auth-helpers-sveltekit
```

Using [yarn](https://yarnpkg.com/):

```sh
yarn add @supabase/auth-helpers-sveltekit
```

This library supports the following tooling versions:

- Node.js: `^16.15.0`

## Getting Started

### Configuration

Set up the fillowing env vars. For local development you can set them in a `.env` file. See an example [here](../../examples/sveltekit/.env.example).

```bash
# Find these in your Supabase project settings > API
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### SupabaseClient setup

We will start off by creating a `db.ts` file inside of our `src/lib` directory. Now lets instantiate our `supabaseClient`.

```ts
// src/lib/db.ts
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';
// or use the static env
// import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabaseClient = createClient(
  env.PUBLIC_SUPABASE_URL,
  env.PUBLIC_SUPABASE_ANON_KEY,
  {
    persistSession: false,
    autoRefreshToken: false
  }
);
```

Edit your `+layout.svelte` file and set up the client side.

```html
<!-- src/routes/+layout.svelte -->
<script lang="ts" context="module">
  // set global the client instance
  // this must happen in module context
  import { supabaseClient } from '$lib/db';
  import { setupSupabaseClient } from '@supabase/auth-helpers-sveltekit';

  setupSupabaseClient({ supabaseClient });
</script>

<script lang="ts">
  import { startSupabaseSessionSync } from '@supabase/auth-helpers-sveltekit';

  // start automatic token refreshing
  startSupabaseSessionSync();
</script>

<slot />
```

### Hooks setup

Our `hooks.ts` file is where the heavy lifting of this library happens, we need to import our function to handle the session syncronization.

```ts
// src/hooks.server.ts
import { dev } from '$app/environment';
import { supabaseClient } from '$lib/db';
import { setupSupabaseServer } from '@supabase/auth-helpers-sveltekit/server';
import { auth } from '@supabase/auth-helpers-sveltekit/server';

setupSupabaseServer({
	supabaseClient,
	cookieOptions: {
		secure: !dev
	}
});

export const handle = auth;

// use the sequence helper if you have additional Handle methods
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
  auth,
  yourHandler
);
```

### Session sync

Set up the `handleCallbackSession` helper to save the session on the server when the auth state changes on the client.

```ts
// src/routes/api/auth/callback/+server.ts
import type { RequestHandler } from './$types';
import { handleCallbackSession } from '@supabase/auth-helpers-sveltekit/server';

export const POST: RequestHandler = handleCallbackSession;
```

<!-- TODO: Add this when the cookie issue is resolved
These will create the handlers under the hood that perform different parts of the authentication flow:

- `/api/auth/callback`: The `client` forwards the session details here every time `onAuthStateChange` fires on the client side. This is needed to set up the cookies for your application so that SSR works seamlessly. -->

### Typings

In order to get the most out of TypeScript and its intellisense, you should import our types into the `app.d.ts` type definition file that comes with your SvelteKit project.

```ts
// src/app.d.ts

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
  // interface PageError {}
  // interface Platform {}
}
```

### Basic Setup

You can now determine if a user is authenticated on the client-side by checking that the `session` object returned by `$page.data` is defined.

```html
<!-- example -->
<script>
  import { page } from '$app/stores';
</script>

{#if !$page.data.session}
  <h1>I am not logged in</h1>
{:else}
  <h1>Welcome {$page.data.session.user.email}</h1>
  <p>I am logged in!</p>
{/if}
```

## Client-side data fetching with RLS

For [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) to work properly when fetching data client-side, you need to make sure to import the `{ supabaseClient }` from `$lib/db` and only run your query once the session is defined client-side in `$page.data`:

```html
<script>
  import Auth from 'supabase-ui-svelte';
  import { supabaseClient } from '$lib/db';
  import { page } from '$app/stores';

  let loadedData = [];
  async function loadData() {
    const { data } = await supabaseClient.from('test').select('*').limit(20);
    loadedData = data;
  }

  $: if ($page.data.session) {
    loadData();
  }

  function signout() {
    supabaseClient.auth.signOut();
  }
</script>

{#if !$page.data.session}
  <Auth
    supabaseClient={supabaseClient}
    providers={['google', 'github']}
  />
{:else}
  <button on:click={signout}>Sign out</button>
  <p>user:</p>
  <pre>{JSON.stringify($page.data.session.user, null, 2)}</pre>
  <p>client-side data fetching with RLS</p>
  <pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
```

### Server-side data fetching with RLS

```html
<!-- src/routes/profile/+page.svelte -->
<script>
  /** @type {import('./$types').PageData} */
  export let data;
  $: ({ user, tableData } = data);
</script>

<div>Protected content for {user.email}</div>
<pre>{JSON.stringify(tableData, null, 2)}</pre>
<pre>{JSON.stringify(user, null, 2)}</pre>
```

For [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) to work in a server environment, you need to use the `withAuth` helper to check if the user is authenticated. The helper extends the event with `session` and `getSupabaseClient()`:

```ts
// src/routes/profile/+page.ts
import type { PageLoad } from './$types';
import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';

interface TestTable {
  id: string;
  created_at: string;
}

export const load: PageLoad = withAuth(async ({ getSupabaseClient, session }) => {
  if (!session) {
    throw redirect(303, '/');
  }
  const { data: tableData } = await getSupabaseClient()
    .from<TestTable>('test')
    .select('*');

  return {
    user: session.user,
    tableData
  };
);
```

**Caution:**

Always use the instance returned by `getSupabaseClient()` directly!

```ts
// Bad
const supabaseClient = getSupabaseClient();

await supabaseClient.from('table1').select();
await supabaseClient.from('table2').select();

// Good
await getSupabaseClient().from('table1').select();
await getSupabaseClient().from('table2').select();
```

## Protecting API routes

Wrap an API Route to check that the user has a valid session. If they're not logged in the handler will redirect using the status and location.

```ts
// src/routes/api/protected-route/+server.ts
import type { RequestHandler } from './$types';
import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { json, redirect } from '@sveltejs/kit';

interface TestTable {
  id: string;
  created_at: string;
}

export const GET: RequestHandler = withAuth(async ({ getSupabaseClient }) => {
  if (!session) {
    throw redirect(303, '/');
  }
  const { data } = await getSupabaseClient()
    .from<TestTable>('test')
    .select('*');

  return json({ data });
);
```

If you visit `/api/protected-route` without a valid session cookie, you will get a 303 response.

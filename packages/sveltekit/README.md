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

### SupabaseClient and SupaAuthHelper component setup

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
  import { setupSupabase } from '@supabase/auth-helpers-sveltekit';

  setupSupabase({ supabaseClient });
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
import { auth } from '@supabase/auth-helpers-sveltekit/server';
import { dev } from '$app/environment';
import { supabaseClient } from '$lib/db';

export const handle = auth({
  supabaseClient,
  cookieOptions: {
    secure: !dev
  }
});

// use the sequence helper if you have additional Handle methods
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
  auth({
    supabaseClient,
    cookieOptions: {
      secure: !dev
    }
  }),
  yourHandler
);
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

You can now determine if a user is authenticated on the client-side by checking that the `user` object returned by the `$session` store is defined.

```html
<!-- example -->
<script>
  import { page } from '$app/stores';
</script>

{#if !$page.data.session.user}
<h1>I am not logged in</h1>
{:else}
<h1>Welcome {$page.data.session.user.email}</h1>
<p>I am logged in!</p>
{/if}
```

## Client-side data fetching with RLS

For [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) to work properly when fetching data client-side, you need to make sure to import the `{ supabaseClient }` from `$lib/db` and only run your query once the user is defined client-side in the `$page.data.session`:

```html
<script>
  import Auth from 'supabase-ui-svelte';
  import { supabaseClient } from '$lib/db';
  import { session } from '$app/stores';
  import { enhanceAndInvalidate } from '@supabase/auth-helpers-sveltekit';

  let loadedData = [];
  async function loadData() {
    const { data } = await supabaseClient.from('test').select('*').single();
    loadedData = data;
  }

  $: if ($page.data.session.user?.id) {
    loadData();
  }
</script>

{#if !$page.data.session.user} <Auth supabaseClient={supabaseClient}
providers={['google', 'github']} /> {:else}
<form action="/logout" method="post" use:enhanceAndInvalidate>
  <button type="submit">Sign out</button>
</form>
<p>user:</p>
<pre>{JSON.stringify($page.data.session.user, null, 2)}</pre>
<p>client-side data fetching with RLS</p>
<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
```

### Server-side data fetching with RLS

For [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) to work in a server environment, you need to inject the request context into the supabase client:

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

```ts
// src/routes/profile/+page.ts
import {
  supabaseServerClient,
  withApiAuth
} from '@supabase/auth-helpers-sveltekit';
import type { PageLoad } from './$types';

interface TestTable {
  id: string;
  created_at: string;
}

export const load: PageLoad = withAuth(
  { status: 303, location: '/' },

  async ({ getSupabaseClient, session }) => {
    const { data: tableData } = await getSupabaseClient()
      .from<TestTable>('test')
      .select('*');

    return {
      user: session.user,
      tableData
    };
  }
);
```

## Protecting API routes

Wrap an API Route to check that the user has a valid session. If they're not logged in the handler will redirect using the status and location.

```ts
// src/routes/api/protected-route/+server.ts
import {
  supabaseServerClient,
  withApiAuth
} from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

interface TestTable {
  id: string;
  created_at: string;
}

export const GET: RequestHandler = withAuth(
  { status: 303, location: '/' },
  async ({ getSupabaseClient }) => {
    const { data } = await getSupabaseClient()
      .from<TestTable>('test')
      .select('*');

    return json({ data });
  }
);
```

If you visit `/api/protected-route` without a valid session cookie, you will get a 303 response.

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
import { createClient } from '@supabase/auth-helpers-sveltekit';
import { env } from '$env/dynamic/public';
// or use the static env
// import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabaseClient = createClient(
  env.PUBLIC_SUPABASE_URL,
  env.PUBLIC_SUPABASE_ANON_KEY
);
```

To make sure the client is initialized on the server and the client we include this file in `src/hooks.server.js` and `src/hooks.client.js`:

```ts
import '$lib/db';
```

### Synchronizing the page store

Edit your `+layout.svelte` file and set up the client side.

```html
<!-- src/routes/+layout.svelte -->
<script>
  import { supabaseClient } from '$lib/db';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    const {
      data: { subscription }
    } = supabaseClient.auth.onAuthStateChange(() => {
      invalidate('supabase:auth');
    });

    return () => {
      subscription.unsubscribe();
    };
  });
</script>

<slot />
```

Every `PageLoad` or `LayoutLoad` using `getSupabase()` will update when `invalidate('supabase:auth')` is called.

If some data is not updated on signin/signout you can fall back to `invalidateAll()`.

### Send session to client

In order to make the session available to the UI (pages, layouts) we need to pass the session in the root layout server load function:

```ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { getServerSession } from '@supabase/auth-helpers-sveltekit';

export const load: LayoutServerLoad = async (event) => {
  return {
    session: await getServerSession(event)
  };
};
```

In addition you can create a layout load function if you are using `invalidate('supabase:auth')`:

```ts
// src/routes/+layout.ts
import type { LayoutLoad } from './$types';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';

export const load: LayoutLoad = async (event) => {
  const { session } = await getSupabase(event);
  return { session };
};
```

This results in less server calls as the client manages the session on it´s own.

### Typings

In order to get the most out of TypeScript and it´s intellisense, you should import our types into the `app.d.ts` type definition file that comes with your SvelteKit project.

```ts
// src/app.d.ts

/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  interface Supabase {
    Database: import('./DatabaseDefinitions').Database;
    SchemaName: 'public';
  }

  // interface Locals {}
  interface PageData {
    session: import('@supabase/supabase-js').Session | null;
  }
  // interface Error {}
  // interface Platform {}
}
```

### Basic Setup

You can now determine if a user is authenticated on the client-side by checking that the `session` object in `$page.data` is defined.

```html
<!-- src/routes/+page.svelte -->
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
</script>

{#if $page.data.session}
<p>client-side data fetching with RLS</p>
<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
```

## Server-side data fetching with RLS

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

For [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) to work in a server environment, you need to use the `getSupabase` helper to check if the user is authenticated. The helper requires the `event` and returns `session` and `supabaseClient`:

```ts
// src/routes/profile/+page.ts
import type { PageLoad } from './$types';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
  const { session, supabaseClient } = await getSupabase(event);
  if (!session) {
    throw redirect(303, '/');
  }
  const { data: tableData } = await supabaseClient.from('test').select('*');

  return {
    user: session.user,
    tableData
  };
};
```

## Protecting API routes

Wrap an API Route to check that the user has a valid session. If they're not logged in the session is `null`.

```ts
// src/routes/api/protected-route/+server.ts
import type { RequestHandler } from './$types';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { json, redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
  const { session, supabaseClient } = await getSupabase(event);
  if (!session) {
    throw redirect(303, '/');
  }
  const { data } = await supabaseClient.from('test').select('*');

  return json({ data });
};
```

If you visit `/api/protected-route` without a valid session cookie, you will get a 303 response.

## Protecting Actions

Wrap an Action to check that the user has a valid session. If they're not logged in the session is `null`.

```ts
// src/routes/posts/+page.server.ts
import type { Actions } from './$types';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { error, invalid } from '@sveltejs/kit';

export const actions: Actions = {
  createPost: async (event) => {
    const { request } = event;
    const { session, supabaseClient } = await getSupabase(event);
    if (!session) {
      // the user is not signed in
      throw error(403, { message: 'Unauthorized' });
    }
    // we are save, let the user create the post
    const formData = await request.formData();
    const content = formData.get('content');

    const { error: createPostError, data: newPost } = await supabaseClient
      .from('posts')
      .insert({ content });

    if (createPostError) {
      return invalid(500, {
        supabaseErrorMessage: createPostError.message
      });
    }
    return {
      newPost
    };
  }
};
```

If you try to submit a form with the action `?/createPost` without a valid session cookie, you will get a 403 error response.

## Saving and deleting the session

```ts
import type { Actions } from './$types';
import { invalid, redirect } from '@sveltejs/kit';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';

export const actions: Actions = {
  signin: async (event) => {
    const { request, cookies, url } = event;
    const { session, supabaseClient } = await getSupabase(event);
    const formData = await request.formData();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error instanceof AuthApiError && error.status === 400) {
        return invalid(400, {
          error: 'Invalid credentials.',
          values: {
            email
          }
        });
      }
      return invalid(500, {
        error: 'Server error. Try again later.',
        values: {
          email
        }
      });
    }

    throw redirect(303, '/dashboard');
  },

  signout: async (event) => {
    const { supabaseClient } = await getSupabase(event);
    await supabaseClient.auth.signOut();
    throw redirect(303, '/');
  }
};
```

## Protecting multiple routes

To avoid writing the same auth logic in every single route you can use the handle hook to
protect multiple routes at once.

```ts
// src/hooks.server.ts
import type { RequestHandler } from './$types';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { redirect, error } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // protect requests to all routes that start with /protected-routes
  if (event.url.pathname.startsWith('/protected-routes')) {
    const { session, supabaseClient } = await getSupabase(event);

    if (!session) {
      throw redirect(303, '/');
    }
  }

  // protect POST requests to all routes that start with /protected-posts
  if (
    event.url.pathname.startsWith('/protected-posts') &&
    event.request.method === 'POST'
  ) {
    const { session, supabaseClient } = await getSupabase(event);

    if (!session) {
      throw error(303, '/');
    }
  }

  return resolve(event);
};
```

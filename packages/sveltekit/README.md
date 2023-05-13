# @supabase/auth-helpers-sveltekit (BETA)

This submodule provides convenience helpers for implementing user authentication in [SvelteKit](https://kit.svelte.dev/) applications.

## Installation

Using [npm](https://npmjs.org):

```sh
npm install @supabase/auth-helpers-sveltekit
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

Create a server supabase client in a handle hook:

```ts
// src/hooks.server.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event
  });

  /**
   * a little helper that is written for convenience so that instead
   * of calling `const { data: { session } } = await supabase.auth.getSession()`
   * you just call this `await getSession()`
   */
  event.locals.getSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();
    return session;
  };

  return resolve(event, {
    /**
     * There´s an issue with `filterSerializedResponseHeaders` not working when using `sequence`
     *
     * https://github.com/sveltejs/kit/issues/8061
     */
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    }
  });
};
```

> Note that we are specifying `filterSerializedResponseHeaders` here. We need to tell SvelteKit that supabase needs the `content-range` header.

### Send session to client

In order to make the session available to the UI (pages, layouts) we need to pass the session in the root layout server load function:

```ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
  return {
    session: getSession()
  };
};
```

### Shared Load functions and pages

To be able to use Supabase in shared load functions and inside pages you need to create a Supabase client in the root layout load:

```ts
// src/routes/+layout.ts
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import type { LayoutLoad } from './$types';
import type { Database } from '../DatabaseDefinitions';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth');

  const supabase = createSupabaseLoadClient<Database>({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event: { fetch },
    serverSession: data.session
  });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return { supabase, session };
};
```

The client can be accessed inside pages by `$page.data.supabase` or `data.supabase` when using `export let data: PageData`.

The usage of `depends` tells sveltekit that this load function should be executed whenever `invalidate` is called to keep the page store in sync.

`createSupabaseLoadClient` caches the client when running in a browser environment and therefore does not create a new client for every time the load function runs.

### Setting up the event listener on the client side

We need to create an event listener in the root `+layout.svelte` file in order catch supabase events being triggered.

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';

  export let data: LayoutData;

  $: ({ supabase, session } = data);

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (_session?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => subscription.unsubscribe();
  });
</script>

<slot />
```

The usage of `invalidate` tells sveltekit that the root `+layout.ts` load function should be executed whenever the session updates to keep the page store in sync.

### Generate types from your database

In order to get the most out of TypeScript and it´s intellisense, you should import the generated Database types into the `app.d.ts` type definition file that comes with your SvelteKit project, where `import('./DatabaseDefinitions')` points to the generated types file outlined in [v2 docs here](https://supabase.com/docs/reference/javascript/release-notes#typescript-support) after you have logged in, linked, and generated types through the Supabase CLI.

```ts
// src/app.d.ts

import { SupabaseClient, Session } from '@supabase/supabase-js';
import { Database } from './DatabaseDefinitions';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      getSession(): Promise<Session | null>;
    }
    interface PageData {
      session: Session | null;
    }
    // interface Error {}
    // interface Platform {}
  }
}
```

## Client-side data fetching with RLS

For [row level security](https://supabase.com/docs/guides/auth/row-level-security) to work properly when fetching data client-side, you need to use supabaseClient from `PageData` and only run your query once the session is defined client-side:

```html
<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  $: ({ supabase, session } = data);

  let loadedData = [];
  async function loadData() {
    const { data } = await supabase.from('test').select('*').limit(20);
    loadedData = data;
  }

  $: if (session) {
    loadData();
  }
</script>

{#if session}
<p>client-side data fetching with RLS</p>
<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
```

## Server-side data fetching with RLS

```html
<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ user, tableData } = data);
</script>

<div>Protected content for {user.email}</div>
<pre>{JSON.stringify(tableData, null, 2)}</pre>
<pre>{JSON.stringify(user, null, 2)}</pre>
```

```ts
// src/routes/profile/+page.ts
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }) => {
  const { supabase, session } = await parent();
  if (!session) {
    throw redirect(303, '/');
  }
  const { data: tableData } = await supabase.from('test').select('*');

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
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals: { supabase, getSession } }) => {
  const session = await getSession();
  if (!session) {
    // the user is not signed in
    throw error(401, { message: 'Unauthorized' });
  }
  const { data } = await supabase.from('test').select('*');

  return json({ data });
};
```

If you visit `/api/protected-route` without a valid session cookie, you will get a 401 response.

## Protecting Actions

Wrap an Action to check that the user has a valid session. If they're not logged in the session is `null`.

```ts
// src/routes/posts/+page.server.ts
import type { Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

export const actions: Actions = {
  createPost: async ({ request, locals: { supabase, getSession } }) => {
    const session = await getSession();

    if (!session) {
      // the user is not signed in
      throw error(401, { message: 'Unauthorized' });
    }
    // we are save, let the user create the post
    const formData = await request.formData();
    const content = formData.get('content');

    const { error: createPostError, data: newPost } = await supabase
      .from('posts')
      .insert({ content });

    if (createPostError) {
      return fail(500, {
        supabaseErrorMessage: createPostError.message
      });
    }
    return {
      newPost
    };
  }
};
```

If you try to submit a form with the action `?/createPost` without a valid session cookie, you will get a 401 error response.

## Saving and deleting the session

```ts
import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';

export const actions: Actions = {
  signin: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error instanceof AuthApiError && error.status === 400) {
        return fail(400, {
          error: 'Invalid credentials.',
          values: {
            email
          }
        });
      }
      return fail(500, {
        error: 'Server error. Try again later.',
        values: {
          email
        }
      });
    }

    throw redirect(303, '/dashboard');
  },

  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut();
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
    const session = await event.locals.getSession();
    if (!session) {
      // the user is not signed in
      throw redirect(303, '/');
    }
  }

  // protect POST requests to all routes that start with /protected-posts
  if (event.url.pathname.startsWith('/protected-posts') && event.request.method === 'POST') {
    const session = await event.locals.getSession();
    if (!session) {
      // the user is not signed in
      throw error(303, '/');
    }
  }

  return resolve(event);
};
```

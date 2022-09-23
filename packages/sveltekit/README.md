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
import { setupSupabaseClient } from '@supabase/auth-helpers-sveltekit';
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

setupSupabaseClient({
  supabaseClient
});
```

### Initialize the client

Edit your `+layout.svelte` file and set up the client side.

```html
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  // make sure the supabase instance is initialized on the client
  import '$lib/db';
  import { startSupabaseSessionSync } from '@supabase/auth-helpers-sveltekit';

  // this sets up automatic token refreshing
  startSupabaseSessionSync();
</script>

<slot />
```

### Hooks setup

Our `hooks.ts` file is where the heavy lifting of this library happens:

```ts
// src/hooks.server.ts
import { dev } from '$app/environment';
import { supabaseClient } from '$lib/db';
import {
  setupSupabaseServer,
  auth
} from '@supabase/auth-helpers-sveltekit/server';

setupSupabaseServer({
  supabaseClient,
  cookieOptions: {
    secure: !dev
  }
});

export const handle = auth();

// use the sequence helper if you have additional Handle methods
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(auth(), yourHandler);
```

There are three handle methods available:

- `callback()`:

  This will create a handler for `/api/auth/callback`. The `client` forwards the session details here every time `onAuthStateChange` fires on the client side. This is needed to set up the cookies for your application so that SSR works seamlessly.

- `session()`:

  This will parse the session from the cookie and populate it in locals

- `auth()`:

  a shorthand for `sequence(callback(), session())` that uses both handlers

### Send session to client

In order to make the session available to the UI (pages, layouts) we need to pass the session in the root layout load function:

```ts
// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    session: locals.session
  };
};
```

### Typings

In order to get the most out of TypeScript and it´s intellisense, you should import our types into the `app.d.ts` type definition file that comes with your SvelteKit project.

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
  // interface Error {}
  // interface Platform {}
}
```

### Basic Setup

You can now determine if a user is authenticated on the client-side by checking that the `session` object returned by `$page.data` is defined.

```html
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

Wrap an API Route to check that the user has a valid session. If they're not logged in the session is `null`.

```ts
// src/routes/api/protected-route/+server.ts
import type { RequestHandler } from './$types';
import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { json, redirect } from '@sveltejs/kit';

interface TestTable {
  id: string;
  created_at: string;
}

export const GET: RequestHandler = withAuth(async ({ session, getSupabaseClient }) => {
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

## Protecting Actions

Wrap an Action to check that the user has a valid session. If they're not logged in the session is `null`.

```ts
// src/routes/posts/+page.server.ts
import type { Actions } from './$types';
import { withAuth } from '@supabase/auth-helpers-sveltekit';
import { error, invalid } from '@sveltejs/kit';

export const actions: Actions = {
  createPost: withAuth(async ({ session, getSupabaseClient, request }) => {
    if (!session) {
      // the user is not signed in
      throw error(403, { message: 'Unauthorized' });
    }
    // we are save, let the user create the post
    const formData = await request.formData();
    const content = formData.get('content');

    const { error: createPostError, data: newPost } = await getSupabaseClient()
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
  })
};
```

If you try to submit a form with the action `?/createPost` without a valid session cookie, you will get a 403 error response.

## Saving and deleting the session

Use `saveSession` to save the session cookies:

```ts
import type { Actions } from './$types';
import { supabaseClient } from '$lib/db';
import { invalid, redirect } from '@sveltejs/kit';
import { saveSession } from '@supabase/auth-helpers-sveltekit/server';

export const actions: Actions = {
  async signin({ request, cookies, url }) {
    const formData = await request.formData();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data, error } = await supabaseClient.auth.api.signInWithEmail(
      email,
      password,
      {
        redirectTo: `${url.origin}/logging-in`
      }
    );

    if (error || !data) {
      if (error?.status === 400) {
        return invalid(400, {
          error: 'Invalid credentials',
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

    saveSession(cookies, data);
    throw redirect(303, '/dashboard');
  }
};
```

Use `deleteSession` to delete the session cookies:

```ts
import type { Actions } from './$types';
import { deleteSession } from '@supabase/auth-helpers-sveltekit/server';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
  async logout({ cookies }) {
    deleteSession(cookies);
    throw redirect(303, '/');
  }
};
```

## Custom session namespace

If you wan´t to use something else than `locals.session` and `$page.data.session` you can do so by updating the types and creating three helper functions:

```ts
// src/app.d.ts
declare namespace App {
  interface Locals {
    mySupabaseSession: import('@supabase/auth-helpers-sveltekit').SupabaseSession;
  }
  interface PageData {
    mySupabaseSession: import('@supabase/auth-helpers-sveltekit').SupabaseSession;
  }
}

// src/hooks.server.ts
setupSupabaseServer({
  supabaseClient,
  cookieOptions: {
    secure: !dev
  },
  // --- change location within locals ---
  getSessionFromLocals: (locals) => locals.mySupabaseSession,
  setSessionToLocals: (locals, session) => (locals.mySupabaseSession = session)
});

// src/lib/db.ts
setupSupabaseClient({
  supabaseClient,
  // --- change location within pageData ---
  getSessionFromPageData: (data) => data.mySupabaseSession
});
```

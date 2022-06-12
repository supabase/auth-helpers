# @supabase/auth-helpers-sveltekit

This submodule provides convenience helpers for implementing user authentication in [SvelteKit](https://kit.svelte.dev/) applications.

## Installation

Using [npm](https://npmjs.org):

```sh
npm install @supabase/auth-helpers-sveltekit
```

This library supports the following tooling versions:

- Node.js: `^16.15.0`

You should also install `@supabase/auth-helpers-svelte` to use with this library.

## Getting Started

### Configuration

Set up the fillowing env vars. For local development you can set them in a `.env` file. See an example [here](../../examples/sveltekit/example.env)).

```bash
# Find these in your Supabase project settings > API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Basic Setup

- Create an `auth` directory under the `/src/routes/api/` directory.

- Create a `callback.ts` and `user.ts` file under the newly created `auth` directory.

The path to your dynamic API route files would be `/src/routes/api/auth/user.ts` and `/src/routes/api/auth/callback.ts`. Populate both files as follows:

```ts
// src/routes/api/auth/user.ts
export async function post({ locals }) {
  const { user, accessToken, error } = locals;
  return {
    status: 200,
    body: {
      user,
      accessToken,
      error
    }
  };
}
```

```ts
// src/routes/api/auth/callback.ts
export async function post() {
  return {
    status: 200,
    body: {}
  };
}
```

We need to add the `handleCallback()` and `handleUser()` hooks to your `hooks.ts` file.

```ts
// src/hooks.ts
import { handleUser, handleCallback } from '@supabase/auth-helpers-sveltekit';
import type { GetSession, Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

export const handle: Handle = sequence(handleCallback(), handleUser());

export const getSession: GetSession = async (event) => {
  const { user, accessToken, error } = event.locals;
  return {
    user,
    accessToken,
    error
  };
};
```

These will create the handlers under the hood that perform different parts of the authentication flow:

- `/api/auth/callback`: The `UserHelper` forwards the session details here every time `onAuthStateChange` fires on the client side. This is needed to set up the cookies for your application so that SSR works seamlessly.

- `/api/auth/user`: You can fetch user profile information in JSON format.

Create a file in your `src/lib` directory to get the `supabaseClient` from `@supabase/auth-helpers-sveltekit`

```ts
// src/lib/db.ts
import { skHelper } from '@supabase/auth-helpers-sveltekit';

const { supabaseClient } = skHelper(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

export { supabaseClient };
```

Wrap your `src/routes/__layout.svelte` component with the `SupaAuthHelper` component:

```html
// src/routes/__layout.svelte
<script>
  import { goto } from '$app/navigation';
  import { session } from '$app/stores';
  import { supabaseClient } from '$lib/db';
  import { SupaAuthHelper } from '@supabase/auth-helpers-svelte';

  const onUserUpdate = async (user) => {
    if (user) await goto('/');
  };
</script>

<SupaAuthHelper {supabaseClient} {session} {onUserUpdate}>
  <slot />
</SupaAuthHelper>
```

You can now determine if a user is authenticated by checking that the `user` object returned by the `$session` store is defined.

```html
// example
<script>
  import { session } from '$app/stores';
</script>

{#if !$session.user}
<h1>I am not logged in</h1>
{:else}
<h1>Welcome {$session.user.email}</h1>
<p>I am logged in!</p>
{/if}
```

## Client-side data fetching with RLS

For [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) to work properly when fetching data client-side, you need to make sure to import the `{ supabaseClient }` from `@supabase/auth-helpers-nextjs` and only run your query once the user is defined client-side in the `$session`:

```html
<script>
  import Auth from 'supabase-ui-svelte';
  import { error, isLoading } from '@supabase/auth-helpers-svelte';
  import { supabaseClient } from '$lib/db';
  import { session } from '$app/stores';

  let loadedData = [];
  async function loadData() {
    const { data } = await supabaseClient.from('test').select('*').single();
    loadedData = data
  }

  $: {
    if ($session.user && $session.user.id) {
      loadData();
    }
  }
</script>

{#if !$session.user}
  {#if $error}
		<p>{$error.message}</p>
	{/if}
  <h1>{$isLoading ? `Loading...` : `Loaded!`}</h1>
  <Auth
    supabaseClient={supabaseClient}
    providers={['google', 'github']}
  />
{:else}
  <button on:click={() => supabaseClient.auth.signOut()}>Sign out</button>
  <p>user:</p>
  <pre>{JSON.stringify($session.user, null, 2)}</pre>
  <p>client-side data fetching with RLS</p>
  <pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if}
```

### Server-side data fetching with RLS

For [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) to work in a server environment, you need to inject the request context into the supabase client:

```html
<script context="module">
  import {
    supabaseServerClient,
    withPageAuth
  } from '@supabase/auth-helpers-sveltekit';

  export const load = async ({ session }) =>
    withPageAuth(
      {
        redirectTo: '/',
        user: session.user
      },
      async () => {
        const { data } = await supabaseServerClient(session.accessToken)
          .from('test')
          .select('*');
        return { props: { data, user: session.user } };
      }
    );
</script>

<script>
  export let user;
  export let data;
</script>

<div>Protected content for {user.email}</div>
<pre>{JSON.stringify(data, null, 2)}</pre>
<pre>{JSON.stringify(user, null, 2)}</pre>
```

## Protecting API routes

Wrap an API Route to check that the user has a valid session. If they're not logged in the handler will return a
303 and redirect header.

```ts
// src/routes/api/protected-route.ts
import {
  supabaseServerClient,
  withApiAuth
} from '@supabase/auth-helpers-sveltekit';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = ({ locals, request }) =>
  withApiAuth({ user: locals.user }, async () => {
    // Run queries with RLS on the server
    const { data } = await supabaseServerClient(request)
      .from('test')
      .select('*');

    return {
      status: 200,
      body: data
    };
  });
```

If you visit `/api/protected-route` without a valid session cookie, you will get a 303 response.

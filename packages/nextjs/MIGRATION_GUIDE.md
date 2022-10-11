## Migrating to `0.4.X`

- With the update to `supabase-js` v2 the `auth` API routes are no longer required, therefore you can go ahead and delete your `auth` directory under the `/pages/api/` directory.

- The `/api/auth/logout` API route has been removed, please use the `signout` method instead:

```js
<button
  onClick={async () => {
    await supabaseClient.auth.signOut();
    router.push('/');
  }}
>
  Logout
</button>
```

- The `supabaseClient` and `supabaseServerClient` have been removed in favor of the `createBrowserSupabaseClient` and `createServerSupabaseClient` methods. This is so that you can provide the CLI generated types to the client, e.g.

```js
// client-side
import type { Database } from 'types_db';
const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );

// server-side API route
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from 'types_db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({ req, res })
  const { data:{ user } } = await supabaseServerClient.auth.getUser()

  res.status(200).json({ name: user?.name ?? '' })
}
```

- The `UserProvider` has been replaced by the `SessionContextProvider`. Make sure to wrap your `pages/_app.js` componenent with the `SessionContextProvider`. Then, throughout your application you can use the `useSessionContext` hook to get the `session` and the `useSupabaseClient` hook to get an authenticated `supabaseClient`.

- The `useUser` hook now returns the `user` object or `null`.

- Usage with TypeScript: You can pass types that were [generated with the Supabase CLI](https://supabase.com/docs/reference/javascript/next/typescript-support#generating-types) to the Supabase Client to get enhanced type safety and auto completion:

```js
// Creating a new supabase client object:
import { Database } from '../db_types';

const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );
```

```js
// Retrieving a supabase client object from the SessionContext:
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../db_types';

const supabaseClient = useSupabaseClient<Database>();
```

## Migrating from @supabase/supabase-auth-helpers to @supabase/auth-helpers

This is a step by step guide on migrating away from the `@supabase/supabase-auth-helpers` to the newly released `@supabase/auth-helpers`.

1. Install `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs` and `@supabase/auth-helpers-react` libraries from npm.
2. Replace all imports of `@supabase/supabase-auth-helpers/nextjs` in your project with `@supabase/auth-helpers-nextjs`.
3. Replace all imports of `@supabase/supabase-auth-helpers/react` in your project with `@supabase/auth-helpers-react`.
4. Replace all instances of `withAuthRequired` in any of your NextJS pages with `withPageAuth`.
5. Replace all instances of `withAuthRequired` in any of your NextJS API endpoints with `withApiAuth`.
6. Uninstall `@supabase/supabase-auth-helpers`.

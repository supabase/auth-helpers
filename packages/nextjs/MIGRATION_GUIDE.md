## Migrating to `0.5.X`

To make these helpers more flexible as well as more maintainable and easier to upgrade for new versions of Next.js, we're stripping them down to the most useful part which is managing the cookies and giving you an authenticated supabase-js client in any environment (client, server, middleware/edge).

Therefore we're marking the `withApiAuth`, `withPageAuth`, and `withMiddlewareAuth` higher order functions as deprectaed and they will be removed in the next **minor** release (v0.6.X).

Please follow the steps below to update your API routes, pages, and middleware handlers. Thanks!

### `withApiAuth` deprecated!

Use `createServerSupabaseClient` within your `NextApiHandler`:

#### Before

```tsx
// pages/api/protected-route.ts
import { withApiAuth } from '@supabase/auth-helpers-nextjs';

export default withApiAuth(async function ProtectedRoute(req, res, supabase) {
  // Run queries with RLS on the server
  const { data } = await supabase.from('test').select('*');
  res.json(data);
});
```

#### After

```tsx
// pages/api/protected-route.ts
import { NextApiHandler } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const ProtectedRoute: NextApiHandler = async (req, res) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient({ req, res });
  // Check if we have a session
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session)
    return res.status(401).json({
      error: 'not_authenticated',
      description: 'The user does not have an active session or is not authenticated'
    });

  // Run queries with RLS on the server
  const { data } = await supabase.from('test').select('*');
  res.json(data);
};

export default ProtectedRoute;
```

### `withPageAuth` deprecated!

Use `createServerSupabaseClient` within `getServerSideProps`:

#### Before

```tsx
// pages/profile.js
import { withPageAuth, User } from '@supabase/auth-helpers-nextjs';

export default function Profile({ user }: { user: User }) {
  return <pre>{JSON.stringify(user, null, 2)}</pre>;
}

export const getServerSideProps = withPageAuth({ redirectTo: '/' });
```

#### After

```tsx
// pages/profile.js
import { createServerSupabaseClient, User } from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';

export default function Profile({ user }: { user: User }) {
  return <pre>{JSON.stringify(user, null, 2)}</pre>;
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };

  return {
    props: {
      initialSession: session,
      user: session.user
    }
  };
};
```

### `withMiddlewareAuth` deprecated!

#### Before

```tsx
import { withMiddlewareAuth } from '@supabase/auth-helpers-nextjs';

export const middleware = withMiddlewareAuth({
  redirectTo: '/',
  authGuard: {
    isPermitted: async (user) => {
      return user.email?.endsWith('@gmail.com') ?? false;
    },
    redirectTo: '/insufficient-permissions'
  }
});

export const config = {
  matcher: '/middleware-protected'
};
```

#### After

```tsx
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // We need to create a response and hand it to the supabase client to be able to modify the response headers.
  const res = NextResponse.next();
  // Create authenticated Supabase Client.
  const supabase = createMiddlewareSupabaseClient({ req, res });
  // Check if we have a session
  const {
    data: { session }
  } = await supabase.auth.getSession();

  // Check auth condition
  if (session?.user.email?.endsWith('@gmail.com')) {
    // Authentication successful, forward request to protected route.
    return res;
  }

  // Auth condition not met, redirect to home page.
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = '/';
  redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: '/middleware-protected'
};
```

## Migrating to `0.4.X` and supabase-js v2

- With the update to `supabase-js` v2 the `auth` API routes are no longer required, therefore you can go ahead and delete your `auth` directory under the `/pages/api/` directory. Please refer to the [v2 migration guide](https://supabase.com/docs/reference/javascript/upgrade-guide) for the full set of changes within supabase-js.

- The `/api/auth/logout` API route has been removed, please use the `signout` method instead:

```jsx
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

```tsx
// client-side
import type { Database } from 'types_db';
const [supabaseClient] = useState(() => createBrowserSupabaseClient<Database>());

// server-side API route
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Database } from 'types_db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res
  });
  const {
    data: { user }
  } = await supabaseServerClient.auth.getUser();

  res.status(200).json({ name: user?.name ?? '' });
};
```

- The `UserProvider` has been replaced by the `SessionContextProvider`. Make sure to wrap your `pages/_app.js` componenent with the `SessionContextProvider`. Then, throughout your application you can use the `useSessionContext` hook to get the `session` and the `useSupabaseClient` hook to get an authenticated `supabaseClient`.

- The `useUser` hook now returns the `user` object or `null`.

- Usage with TypeScript: You can pass types that were [generated with the Supabase CLI](https://supabase.com/docs/reference/javascript/next/typescript-support#generating-types) to the Supabase Client to get enhanced type safety and auto completion:

```tsx
// Creating a new supabase client object:
import { Database } from '../db_types';

const [supabaseClient] = useState(() => createBrowserSupabaseClient<Database>());
```

```tsx
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

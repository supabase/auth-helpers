# @supabase/auth-helpers-nextjs (BETA)

This submodule provides convenience helpers for implementing user authentication in Next.js applications.

## Installation

Using [npm](https://npmjs.org):

```sh
npm install @supabase/auth-helpers-nextjs

# Main components and hooks for React based frameworks (optional)
npm install @supabase/auth-helpers-react
```

Using [yarn](https://yarnpkg.com/):

```sh
yarn add @supabase/auth-helpers-nextjs

# Main components and hooks for React based frameworks (optional)
yarn add @supabase/auth-helpers-react
```

This library supports the following tooling versions:

- Node.js: `^10.13.0 || >=12.0.0`
- Next.js: `>=10`
- Note: Next.js 13 is supported except for the new `app` directory approach. We're working on adding support for this and you can follow along [here](https://github.com/supabase/auth-helpers/issues/341).

## Getting Started

### Configuration

Set up the following env vars. For local development you can set them in a `.env.local` file. See an example [here](../../examples/nextjs/.env.local.example)).

```bash
# Find these in your Supabase project settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Basic Setup

Wrap your `pages/_app.js` component with the `SessionContextProvider` component:

```jsx
// pages/_app.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push('/');
        }}
      >
        Logout
      </button>

      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
```

You can now determine if a user is authenticated by checking that the `user` object returned by the `useUser()` hook is defined.

### Usage with TypeScript

You can pass types that were [generated with the Supabase CLI](https://supabase.com/docs/guides/api/generating-types) to the Supabase Client to get enhanced type safety and auto completion:

```tsx
// Creating a new supabase client object:
import { Database } from '../db_types';

const [supabase] = useState(() => createBrowserSupabaseClient<Database>());
```

```tsx
// Retrieving a supabase client object from the SessionContext:
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../db_types';

const supabase = useSupabaseClient<Database>();
```

## Client-side data fetching with RLS

For [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) to work properly when fetching data client-side, you need to make sure to use the `supabaseClient` from the `useSessionContext` hook and only run your query once the user is defined client-side in the `useUser()` hook:

```jsx
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import {
  useUser,
  useSessionContext,
  useSupabaseClient
} from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';

const LoginPage = () => {
  const { isLoading, session, error } = useSessionContext();
  const supabase = useSupabaseClient();
  const user = useUser();
  const [data, setData] = useState();

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('test').select('*');
      setData(data);
    }
    // Only run query once user is logged in.
    if (user) loadData();
  }, [user]);

  if (!user)
    return (
      <>
        {error && <p>{error.message}</p>}
        <Auth
          redirectTo="http://localhost:3000/"
          appearance={{ theme: ThemeSupa }}
          supabaseClient={supabaseClient}
          providers={['google', 'github']}
          socialLayout="horizontal"
        />
      </>
    );

  return (
    <>
      <button onClick={() => supabaseClient.auth.signOut()}>Sign out</button>
      <p>user:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <p>client-side data fetching with RLS</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};

export default LoginPage;
```

### Server-side rendering (SSR)

Create a server supabase client to retrieve the logged in user's session:

```jsx
// pages/profile.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function Profile({ user }) {
  return <div>Hello {user.name}</div>;
}

export const getServerSideProps = async (ctx) => {
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

### Server-side data fetching with RLS

You can use the server supabase client to run [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) authenticated queries server-side:

```tsx
import {
  User,
  createServerSupabaseClient
} from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';

export default function ProtectedPage({
  user,
  data
}: {
  user: User;
  data: any;
}) {
  return (
    <>
      <div>Protected content for {user.email}</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
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

  // Run queries with RLS on the server
  const { data } = await supabase.from('users').select('*');

  return {
    props: {
      initialSession: session,
      user: session.user,
      data: data ?? []
    }
  };
};
```

### Server-side data fetching to OAuth APIs using `provider_token`

When using third-party auth providers, sessions are initiated with an additional `provider_token` field which is persisted in the auth cookie and can be accessed within the session object. The `provider_token` can be used to make API requests to the OAuth provider's API endpoints on behalf of the logged-in user.

```tsx
import {
  User,
  createServerSupabaseClient
} from '@supabase/auth-helpers-nextjs';
import { GetServerSidePropsContext } from 'next';

export default function ProtectedPage({
  user,
  allRepos
}: {
  user: User;
  allRepos: any;
}) {
  return (
    <>
      <div>Protected content for {user.email}</div>
      <p>Data fetched with provider token:</p>
      <pre>{JSON.stringify(allRepos, null, 2)}</pre>
      <p>user:</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
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

  // Retrieve provider_token & logged in user's third-party id from metadata
  const { provider_token, user } = session;
  const userId = user.user_metadata.user_name;

  const allRepos = await (
    await fetch(`https://api.github.com/search/repositories?q=user:${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `token ${provider_token}`
      }
    })
  ).json();

  return { props: { user, allRepos } };
};
```

## Protecting API routes

Create a server supabase client to retrieve the logged in user's session:

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
      description:
        'The user does not have an active session or is not authenticated'
    });

  // Run queries with RLS on the server
  const { data } = await supabase.from('test').select('*');
  res.json(data);
};

export default ProtectedRoute;
```

## Protecting routes with [Nextjs Middleware](https://nextjs.org/docs/middleware)

As an alternative to protecting individual pages you can use a `middleware` file to protect the entire directory or those that match the config object. In the following example, all requests to `/middleware-protected/*` will check whether a user is signed in, if successful the request will be forwarded to the destination route, otherwise the user will be redirected:

```ts
// middleware.ts
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

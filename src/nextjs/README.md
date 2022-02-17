# @supabase/supabase-auth-helpers/nextjs

This submodule provides convenience helpers for implementing user authentication in Next.js applications.

## Installation

Using [npm](https://npmjs.org):

```sh
npm install @supabase/supabase-auth-helpers
```

This library supports the following tooling versions:

- Node.js: `^10.13.0 || >=12.0.0`

- Next.js: `>=10`

## Getting Started

### Configuration

Set up the fillowing env vars. For local development you can set them in a `.env.local` file. See an example [here](../../examples/nextjs/.env.local.example)).

```bash
# Find these in your Supabase project settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Basic Setup

- Create an `auth` directory under the `/pages/api/` directory.

- Create a `[...supabase].js` file under the newly created `auth` directory.

The path to your dynamic API route file would be `/pages/api/auth/[...supabase].js`. Populate that file as follows:

```js
import { handleAuth } from '@supabase/supabase-auth-helpers/nextjs';

export default handleAuth();
```

Executing `handleAuth()` creates the following route handlers under the hood that perform different parts of the authentication flow:

- `/api/auth/callback`: The `UserProvider` forwards the session details here every time `onAuthStateChange` fires on the client side. This is needed to set up the cookies for your application so that SSR works seamlessly.

- `/api/auth/user`: You can fetch user profile information in JSON format.

Wrap your `pages/_app.js` component with the `UserProvider` component:

```jsx
// pages/_app.js
import React from 'react';
import { UserProvider } from '@supabase/supabase-auth-helpers/react';
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <Component {...pageProps} />
    </UserProvider>
  );
}
```

You can now determine if a user is authenticated by checking that the `user` object returned by the `useUser()` hook is defined.

## Loading additional user data

The `user` object from the `useUser()` hook is only meant to be used as an indicator that the user is signed in, you're not meant to store additional user information in this object but rather you're meant to store additional information in your `public.users` table. See [the "Managing User Data" docs](https://supabase.com/docs/guides/auth/managing-user-data) for more details on this.

You can conveniently make your additional user data available in the `useUser()` hook but setting the `onUserDataLoaded` prop on the `UserProvider` components:

```js
import type { AppProps } from 'next/app';
import { UserProvider } from '@supabase/supabase-auth-helpers/react';
import {
  supabaseClient,
  SupabaseClient
} from '@supabase/supabase-auth-helpers/nextjs';

// You can pass an onUserLoaded method to fetch additional data from your public schema.
// This data will be available as the `onUserLoadedData` prop in the `useUser` hook.
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider
      supabaseClient={supabaseClient}
      onUserLoaded={async (supabaseClient) =>
        (await supabaseClient.from('users').select('*').single()).data
      }
    >
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
```

## Client-side data fetching with RLS

For [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) to work properly when fetching data client-side, you need to make sure to import the `{ supabaseClient }` from `# @supabase/supabase-auth-helpers/nextjs` and only run your query once the user is defined client-side in the `useUser()` hook:

```js
import { useUser, Auth } from '@supabase/supabase-auth-helpers/react';
import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs';
import { useEffect, useState } from 'react';

const LoginPage = () => {
  const { user, error } = useUser();
  const [data, setData] = useState();

  useEffect(() => {
    async function loadData() {
      const { data } = await supabaseClient.from('test').select('*');
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
          supabaseClient={supabaseClient}
          providers={['google', 'github']}
          socialLayout="horizontal"
          socialButtonSize="xlarge"
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

### Server-side rendering (SSR) - withAuthRequired

If you wrap your `getServerSideProps` with `withAuthRequired` your props object will be augmented with the user object.

```js
// pages/profile.js
import { withAuthRequired } from '@supabase/supabase-auth-helpers/nextjs';

export default function Profile({ user }) {
  return <div>Hello {user.name}</div>;
}

export const getServerSideProps = withAuthRequired({ redirectTo: '/login' });
```

If there is no authenticated user, they will be redirect to your home page, unless you specify the `redirectTo` option.

You can pass in your own `getServerSideProps` method, the props returned from this will be merged with the
user props. You can also access the user session data by calling `getUser` inside of this method, eg:

```js
// pages/protected-page.js
import { withAuthRequired, getUser } from '@supabase/supabase-auth-helpers/nextjs';

export default function ProtectedPage({ user, customProp }) {
  return <div>Protected content</div>;
}

export const getServerSideProps = withAuthRequired({
  redirectTo: '/foo',
  async getServerSideProps(ctx) {
    // Access the user object
    const { user, accessToken } = await getUser(ctx);
    return { props: { email: user!.email } };
  }
});
```

### Server-side data fetching with RLS

For [row level security](https://supabase.com/docs/learn/auth-deep-dive/auth-row-level-security) to work in a server environment, you need to inject the request context into the supabase client:

```js
import {
  User,
  withAuthRequired,
  supabaseServerClient
} from '@supabase/supabase-auth-helpers/nextjs';

export default function ProtectedPage({
  user,
  data
}: {
  user: User,
  data: any
}) {
  return (
    <>
      <div>Protected content for {user.email}</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}

export const getServerSideProps = withAuthRequired({
  redirectTo: '/',
  async getServerSideProps(ctx) {
    // Run queries with RLS on the server
    const { data } = await supabaseServerClient(ctx).from('test').select('*');
    return { props: { data } };
  }
});
```

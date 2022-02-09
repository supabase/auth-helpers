# @supabase/supabase-auth-helpers/nextjs

This submodule provides convenience helpers for implementing user authentication in Next.js applications.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Configuration](#configuration)
  - [Basic Setup](#basic-setup)

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

### Basic Setup

- Create an `auth` directory under the `/pages/api/` directory.

- Create a `[...supabase].js` file under the newly created `auth` directory.

The path to your dynamic API route file would be `/pages/api/auth/[...supabase].js`. Populate that file as follows:

```js
import { handleAuth } from '@supabase/supabase-auth-helpers/nextjs';

export default handleAuth();
```

Executing `handleAuth()` creates the following route handlers under the hood that perform different parts of the authentication flow:

- `/api/auth/callback`: Your Identity Provider redirects users to this route after they successfully log in.

- `/api/auth/user`: You can fetch user profile information in JSON format.

Wrap your `pages/_app.js` component with the `UserProvider` component:

```jsx
// pages/_app.js
import React from 'react';
import { supabase } from '../utils/initSupabase';
import { UserProvider } from '@supabase/supabase-auth-helpers/react';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider supabaseClient={supabase}>
      <Component {...pageProps} />
    </UserProvider>
  );
}
```

You can now determine if a user is authenticated by checking that the `user` object returned by the `useUser()` hook is defined. You can also log in or log out your users from the frontend layer of your Next.js application by redirecting them to the appropriate automatically-generated route:

```jsx
// pages/index.js
import { useUser } from '@auth0/nextjs-auth0';

export default function Index() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div>
        Welcome {user.name}! <a href="/api/auth/logout">Logout</a>
      </div>
    );
  }

  return <a href="/api/auth/login">Login</a>;
}
```

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

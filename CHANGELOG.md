# CHANGELOG

## 1.2.3 - 2022-03-16

- [#42](https://github.com/supabase-community/supabase-auth-helpers/pull/42): fix: update cookie values on request object.

## 1.2.2 - 2022-03-09

- [#34](https://github.com/supabase-community/supabase-auth-helpers/pull/34): fix: update cookie lifetime default from 8h to 7 days.

## 1.2.1 - 2022-03-09

- [#33](https://github.com/supabase-community/supabase-auth-helpers/pull/33): fix: merge cookieOptions correctly.

## 1.2.0 - 2022-03-01

- [BREAKING CHANGE][#32](https://github.com/supabase-community/supabase-auth-helpers/pull/32): feat: add logout api route. Note that this includes a breaking change to the options parameter for `handleAuth(options: HandleAuthOptions)` See [the docs](./src/nextjs/README.md#basic-setup) for more details.

## 1.1.3 - 2022-02-23

- [#30](https://github.com/supabase-community/supabase-auth-helpers/pull/30): fix: Unknown encoding: base64url.

## 1.1.2 - 2022-02-22

- Makes `withAuthRequired` work for API routes as well. See [the docs](./src/nextjs/README.md#protecting-api-routes) for more details.
- Removes `onUserLoaded` prop as it was rather confusing and user might want to choose other ways to manage their user state rather than React context.

## 1.1.1 - 2022-02-22

- [#24](https://github.com/supabase-community/supabase-auth-helpers/pull/24): feat: onUserLoaded prop in UserProvider:
  - Added the `onUserDataLoaded` on the `UserProvider` component fro conveninet fetching of additional user data. See [the docs](./src/nextjs/README.md#loading-additional-user-data) for more details.

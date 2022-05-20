# CHANGELOG

## 1.4.2 - 2022-05-20

- [](): fix: use jose to decode JWT. Fixes #

## 1.4.1 - 2022-05-12

- [#95](https://github.com/supabase-community/supabase-auth-helpers/pull/95): fix: change middleware to use pure fetch. Fixes #90
- [#95](https://github.com/supabase-community/supabase-auth-helpers/pull/95): fix: `atob` is not defined. Fixes #93

## 1.4.0 - 2022-05-10

- **BREAKING CHANGE** [a48a238](https://github.com/supabase-community/supabase-auth-helpers/pull/92/commits/a48a238b1efe89456835e0b23954b21a55937224): fix: remove `@supabase/ui` as dependency. If you are using the Auth component, please make sure to install `@supabase/ui` separately in your project and import `Auth` from there. Fixes #39; Fixes #64; Fixes #69;

- **BREAKING CHANGE** [ecdc5a2](https://github.com/supabase-community/supabase-auth-helpers/pull/92/commits/ecdc5a240bf0b3d72ab21a42e01cf4dee9eb5ec7): fix: rename `withMiddlewareAuthRequired` to `withMiddlewareAuth` and move it to `@supabase/supabase-auth-helpers/nextjs/middleware`. Closes #59;
- [19f53c3](https://github.com/supabase-community/supabase-auth-helpers/pull/92/commits/19f53c34a7237d4f1370ed06f5bc6613954361a5): feat: adds `withPageAuth` [[docs](./src/nextjs/README.md#server-side-rendering-ssr---withpageauth)] and deprecates `withAuthRequired`.
- [8888b41](https://github.com/supabase-community/supabase-auth-helpers/pull/92/commits/8888b41242291219eadff8631e25b85101b90255): feat: adds `withApiAuth` [[docs](./src/nextjs/README.md#protecting-api-routes)] and deprecates `withAuthRequired`.

- [df984d0](https://github.com/supabase-community/supabase-auth-helpers/pull/92/commits/df984d0f12b364cd2e6e5238906dc14c9a452859): fix: automtically refresh tokens. Fixes #72; Fixes #77; Fixes #83; Fixes #84; Fixes #85;

- [862acf8](https://github.com/supabase-community/supabase-auth-helpers/pull/92/commits/862acf8792a1a95cf6527f226148be111957436f): fix: refresh token automatically when user is updated. Fixes #62

## 1.3.1 - 2022-05-09

- [#91](https://github.com/supabase-community/supabase-auth-helpers/pull/91): fix: token refresh loop

## 1.3.0 - 2022-03-19

- [#44](https://github.com/supabase-community/supabase-auth-helpers/pull/43): feat: Add `withMiddlewareAuthRequired` Nextjs Middleware util to protect directories.
- [#43](https://github.com/supabase-community/supabase-auth-helpers/pull/43): feat: store `provider_token` in cookie.

## 1.2.3 - 2022-03-16

- [#42](https://github.com/supabase-community/supabase-auth-helpers/pull/42): fix: update cookie values on request object.

## 1.2.2 - 2022-03-09

- [#34](https://github.com/supabase-community/supabase-auth-helpers/pull/34): fix: update cookie lifetime default from 8h to 7 days.

## 1.2.1 - 2022-03-09

- [#33](https://github.com/supabase-community/supabase-auth-helpers/pull/33): fix: merge cookieOptions correctly.

## 1.2.0 - 2022-03-01

- **BREAKING CHANGE** [#32](https://github.com/supabase-community/supabase-auth-helpers/pull/32): feat: add logout api route. Note that this includes a breaking change to the options parameter for `handleAuth(options: HandleAuthOptions)` See [the docs](./src/nextjs/README.md#basic-setup) for more details.

## 1.1.3 - 2022-02-23

- [#30](https://github.com/supabase-community/supabase-auth-helpers/pull/30): fix: Unknown encoding: base64url.

## 1.1.2 - 2022-02-22

- Makes `withAuthRequired` work for API routes as well. See [the docs](./src/nextjs/README.md#protecting-api-routes) for more details.
- Removes `onUserLoaded` prop as it was rather confusing and user might want to choose other ways to manage their user state rather than React context.

## 1.1.1 - 2022-02-22

- [#24](https://github.com/supabase-community/supabase-auth-helpers/pull/24): feat: onUserLoaded prop in UserProvider:
  - Added the `onUserDataLoaded` on the `UserProvider` component fro conveninet fetching of additional user data. See [the docs](./src/nextjs/README.md#loading-additional-user-data) for more details.

# @supabase/auth-helpers-nextjs

## 0.10.0

### Minor Changes

- 9e7ff76: upgrade supabase-js version to v2.42.0

### Patch Changes

- Updated dependencies [9e7ff76]
  - @supabase/auth-helpers-shared@0.7.0

## 0.9.0

### Minor Changes

- 18327fc: add isServer property to server-side storage adaptors

## 0.8.7

### Patch Changes

- f7e5c2d: Revert cookie name to storage key change
- Updated dependencies [f7e5c2d]
  - @supabase/auth-helpers-shared@0.6.3

## 0.8.6

### Patch Changes

- 5893215: Update storage key name with cookie name
- Updated dependencies [5893215]
  - @supabase/auth-helpers-shared@0.6.2

## 0.8.5

### Patch Changes

- 7abfe9b: Fix header and cookie trying to read undefined response body

## 0.8.4

### Patch Changes

- Updated dependencies [841fce0]
  - @supabase/auth-helpers-shared@0.6.1

## 0.8.3

### Patch Changes

- Updated dependencies [9fa8f2b]
  - @supabase/auth-helpers-shared@0.6.0

## 0.8.2

### Patch Changes

- c8a121d: include cookie options for deleteCookie

## 0.8.1

### Patch Changes

- dfff00a: Remove the appending of a cookie to the response

## 0.8.0

### Minor Changes

- c48bb87: Remove max-age option from cookieOptions

### Patch Changes

- Updated dependencies [c48bb87]
  - @supabase/auth-helpers-shared@0.5.0

## 0.7.4

### Patch Changes

- 8c77550: Fix type for next.js cookies and headers functions

## 0.7.3

### Patch Changes

- 1619e93: Add cookie options to set cookie for route handler

## 0.7.2

### Patch Changes

- d33aa1b: Upgrade patch version of Next.js to fix TS def for `cookies().set()`
- Updated dependencies [97e5541]
  - @supabase/auth-helpers-shared@0.4.1

## 0.7.1

### Patch Changes

- b20cc32: Allow user to opt out of singleton pattern for Client Components

## 0.7.0

### Minor Changes

- 65bf8d4: Add cookie storage adapter per library following a shared storage adapter
- 65bf8d4: Add full server side support to auth helpers through PKCE

### Patch Changes

- 165ba70: Fix "Failed to parse cookie string" bug in middleware storage
- a128b9e: Fix typedefs and add deprecated functions for App Router createClient functions
- d46c2ed: fix cookie saving in middleware/routeHandler
- 067402a: Set cookie header to make new session from middleware available to server component
- 66b13b9: simplifying defaults for storage adapter
- 008a08c: Implement singleton pattern for createClientComponentClient to simplify implementation
- d90866f: [BREAKING CHANGES]: Renamed createBrowserSupabaseClient to createPagesBrowserClient, createServerSupabaseClient to createPagesServerClient and createMiddlewareSupabaseClient to createMiddlewareClient
- 1086021: Upgrade Next.js and remove custom type for WritableRequestCookies
- Updated dependencies [65bf8d4]
- Updated dependencies [353be76]
- Updated dependencies [56db807]
- Updated dependencies [56db807]
- Updated dependencies [66b13b9]
- Updated dependencies [65bf8d4]
  - @supabase/auth-helpers-shared@0.4.0

## 0.7.0-next.8

### Patch Changes

- a128b9e: Fix typedefs and add deprecated functions for App Router createClient functions

## 0.7.0-next.7

### Patch Changes

- 067402a: Set cookie header to make new session from middleware available to server component
- 008a08c: Implement singleton pattern for createClientComponentClient to simplify implementation
- 1086021: Upgrade Next.js and remove custom type for WritableRequestCookies

## 0.7.0-next.6

### Patch Changes

- d90866f: [BREAKING CHANGES]: Renamed createBrowserSupabaseClient to createPagesBrowserClient, createServerSupabaseClient to createPagesServerClient and createMiddlewareSupabaseClient to createMiddlewareClient

## 0.7.0-next.5

### Patch Changes

- d46c2ed: fix cookie saving in middleware/routeHandler

## 0.7.0-next.4

### Patch Changes

- 165ba70: Fix "Failed to parse cookie string" bug in middleware storage

## 0.7.0-next.3

### Patch Changes

- Updated dependencies [56db807]
- Updated dependencies [56db807]
  - @supabase/auth-helpers-shared@0.4.0-next.3

## 0.7.0-next.2

### Patch Changes

- Updated dependencies [353be76]
  - @supabase/auth-helpers-shared@0.4.0-next.2

## 0.7.0-next.1

### Patch Changes

- 66b13b9: simplifying defaults for storage adapter
- Updated dependencies [66b13b9]
  - @supabase/auth-helpers-shared@0.4.0-next.1

## 0.7.0-next.0

### Minor Changes

- 65bf8d4: Add cookie storage adapter per library following a shared storage adapter
- 65bf8d4: Add full server side support to auth helpers through PKCE

### Patch Changes

- Updated dependencies [65bf8d4]
- Updated dependencies [65bf8d4]
  - @supabase/auth-helpers-shared@0.4.0-next.0

## 0.6.0

### Minor Changes

- 50d0a16: Remove deprecated methods from the nextjs package

## 0.5.9

### Patch Changes

- Updated dependencies [1ea258e]
  - @supabase/auth-helpers-shared@0.3.3

## 0.5.8

### Patch Changes

- Updated dependencies [185e9cf]
  - @supabase/auth-helpers-shared@0.3.2

## 0.5.7

### Patch Changes

- Updated dependencies [f86073d]
  - @supabase/auth-helpers-shared@0.3.1

## 0.5.6

### Patch Changes

- 5ab18fe: Export function to create Supabase Client in Next.js Route Handler functions

## 0.5.5

### Patch Changes

- Updated dependencies [33c8a81]
  - @supabase/auth-helpers-shared@0.3.0

## 0.5.4

### Patch Changes

- 849e447: allow overwriting client url and key

## 0.5.3

### Patch Changes

- d3366e4: Allow passing client options
- Updated dependencies [d3366e4]
  - @supabase/auth-helpers-shared@0.2.4

## 0.5.2

### Patch Changes

- 2be3f10: feat: add helper for Next.js Server Components.

## 0.5.1

### Patch Changes

- Updated dependencies [bee77c7]
  - @supabase/auth-helpers-shared@0.2.3

## 0.5.0

### Minor Changes

- d8f7446: chore: deprecate withApiAuth, withPageAuth, and withMiddlewareAuth.

## 0.4.5

### Patch Changes

- d6c43ef: fix: "host" request header is not available. #358

## 0.4.4

### Patch Changes

- 5cdc84c: Fix a bug with withPageAuth when a session is null and authRequired is set to false

## 0.4.3

### Patch Changes

- Updated dependencies [999e57e]
  - @supabase/auth-helpers-shared@0.2.2

## 0.4.2

### Patch Changes

- 2fda843: add missing supabase-js peerDependency
- 2fda843: update supabase-js
- Updated dependencies [2fda843]
- Updated dependencies [2fda843]
  - @supabase/auth-helpers-shared@0.2.1

## 0.4.1

### Patch Changes

- 5140f5a: fix: withPageAuth return user. [#314](https://github.com/supabase/auth-helpers/issues/314)

## 0.4.0

### Minor Changes

- fd30e33: Update to work with supabase-js v2 RC

### Patch Changes

- 20fa944: add sveltekit supabase v2 support
- fe5c4a6: chore: improve types.
- 2fdb094: chore: types and middleware improvements.
- af28db1: chore: export middleware at root.
- Updated dependencies [20fa944]
- Updated dependencies [fd30e33]
- Updated dependencies [fe5c4a6]
- Updated dependencies [2fdb094]
  - @supabase/auth-helpers-shared@0.2.0

## 0.4.0-next.4

### Patch Changes

- 20fa944: add sveltekit supabase v2 support
- Updated dependencies [20fa944]
  - @supabase/auth-helpers-shared@0.2.0-next.3

## 0.4.0-next.3

### Patch Changes

- 2fdb094: chore: types and middleware improvements.
- Updated dependencies [2fdb094]
  - @supabase/auth-helpers-shared@0.2.0-next.2

## 0.4.0-next.2

### Patch Changes

- fe5c4a6: chore: improve types.
- Updated dependencies [fe5c4a6]
  - @supabase/auth-helpers-shared@0.2.0-next.1

## 0.4.0-next.1

### Patch Changes

- af28db1: chore: export middleware at root.

## 0.4.0-next.0

### Minor Changes

- 1b33e44: Update to work with supabase-js v2 RC

### Patch Changes

- Updated dependencies [1b33e44]
  - @supabase/auth-helpers-shared@0.2.0-next.0

## 0.2.7

### Patch Changes

- 0ab05cf: Update format of x-client-info header

## 0.2.6

### Patch Changes

- 50669a6: Add x-client-info header to show package name and version

## 0.2.5

### Patch Changes

- 8e0b747: Change error handling to not show flow disruption errors

## 0.2.4

### Patch Changes

- 56228e3: Add getProviderToken helper method
- Updated dependencies [56228e3]
  - @supabase/auth-helpers-shared@0.1.3

## 0.2.3

### Patch Changes

- 69fefcb: Change logger to be a wrapper for console

## 0.2.2

### Patch Changes

- 38ccf1c: Logger can be imported in your own project for setting log levels
- Updated dependencies [38ccf1c]
  - @supabase/auth-helpers-shared@0.1.2

## 0.2.1

### Patch Changes

- 9dda264: Add better error handling and error codes
- Updated dependencies [9dda264]
  - @supabase/auth-helpers-shared@0.1.1

## 0.2.0

### Minor Changes

- f399820: Using shared package as a dependency
  Update sveltekit package with latest code to update tokens

## 0.1.0

### Minor Changes

- a3c2991: Initial release of new library version

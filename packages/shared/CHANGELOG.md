# shared

## 0.6.2

### Patch Changes

- 5893215: Reduce cookie chunk size

## 0.6.1

### Patch Changes

- 841fce0: Fix chunkCount to get the correct number of chunks

## 0.6.0

### Minor Changes

- 9fa8f2b: Add cookie chunking for large JWTs

## 0.5.0

### Minor Changes

- c48bb87: Remove max-age option from cookieOptions

## 0.4.1

### Patch Changes

- 97e5541: Fix isBrowser helper function on deno

## 0.4.0

### Minor Changes

- 65bf8d4: Add cookie storage adapter per library following a shared storage adapter
- 65bf8d4: Add full server side support to auth helpers through PKCE

### Patch Changes

- 353be76: remove unused type
- 56db807: Add jose for it's cross platform base64url decode support
- 56db807: Remove js-base64 as its buffer check was causing issues for Vercel Edge Runtime
- 66b13b9: simplifying defaults for storage adapter

## 0.4.0-next.3

### Patch Changes

- 56db807: Add jose for it's cross platform base64url decode support
- 56db807: Remove js-base64 as its buffer check was causing issues for Vercel Edge Runtime

## 0.4.0-next.2

### Patch Changes

- 353be76: remove unused type

## 0.4.0-next.1

### Patch Changes

- 66b13b9: simplifying defaults for storage adapter

## 0.4.0-next.0

### Minor Changes

- 65bf8d4: Add cookie storage adapter per library following a shared storage adapter
- 65bf8d4: Add full server side support to auth helpers through PKCE

## 0.3.3

### Patch Changes

- 1ea258e: use js-base64

## 0.3.2

### Patch Changes

- 185e9cf: fix decodeBase64url

## 0.3.1

### Patch Changes

- f86073d: Update to use custom Buffer implementation

## 0.3.0

### Minor Changes

- 33c8a81: Adds MFA factors into session

  Factors and identities were removed from session on [PR #350](https://github.com/supabase/auth-helpers/pull/350). When retrieving the `aal` data using `getAuthenticatorAssuranceLevel` wrong data is returned

## 0.2.4

### Patch Changes

- d3366e4: Allow passing client options

## 0.2.3

### Patch Changes

- bee77c7: fix: session data comes back encoded #359

## 0.2.2

### Patch Changes

- 999e57e: chore: reduce cookie size.

WARNING: this patch changes the structure of the `supabase-auth-token` cookie. It is patched in a backwards compatible manner as long as your application doesn't access the cookie directly. If your application accesses the cookie directly, you will need to update your application to support the new cookies structure:

```js
// The new shape of the `supabase-auth-token` cookie.
JSON.stringify([
	session.access_token,
	session.refresh_token,
	session.provider_token,
	session.provider_refresh_token
]);
```

## 0.2.1

### Patch Changes

- 2fda843: add missing supabase-js peerDependency
- 2fda843: update supabase-js

## 0.2.0

### Minor Changes

- fd30e33: Update to work with supabase-js v2 RC

### Patch Changes

- 20fa944: add sveltekit supabase v2 support
- fe5c4a6: chore: improve types.
- 2fdb094: chore: types and middleware improvements.

## 0.2.0-next.3

### Patch Changes

- 20fa944: add sveltekit supabase v2 support

## 0.2.0-next.2

### Patch Changes

- 2fdb094: chore: types and middleware improvements.

## 0.2.0-next.1

### Patch Changes

- fe5c4a6: chore: improve types.

## 0.2.0-next.0

### Minor Changes

- 1b33e44: Update to work with supabase-js v2 RC

## 0.1.3

### Patch Changes

- 56228e3: Add new error class for provider token not found

## 0.1.2

### Patch Changes

- 38ccf1c: Add new to string method to the base error class

## 0.1.1

### Patch Changes

- 9dda264: Add better error handling and error codes

## 0.1.0

### Minor Changes

- a3c2991: Initial release of new library version

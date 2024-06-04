# @supabase/ssr

## 0.4.0

### Minor Changes

- ef61542: Improves the cookie chunker in @supabase/ssr to get rid of edge cases in saving and removing cookies.

## 0.3.0

### Minor Changes

- 8d85be4: fix custom cookie options in browser client
- 9e7ff76: upgrade supabase-js version to v2.42.0

## 0.2.0

### Minor Changes

- faf9eac: Miscellaneous fixes to createBrowserClient

## 0.1.0

### Minor Changes

- 18327fc: add isServer property to server-side storage adaptors
- 18327fc: fix cookie chunking length calculation
- 8ed42ff: use custom cookie name set

## 0.0.10

### Patch Changes

- 1e079c3: Set cookie default to httpOnly: false

## 0.0.9

### Patch Changes

- f7e5c2d: Revert cookie name to storage key change

## 0.0.8

### Patch Changes

- 5893215: Update storage key name with cookie name

## 0.0.7

### Patch Changes

- fc8ccfd: Reduce cookie chunk size

## 0.0.6

### Patch Changes

- 1c7f7e8: Implement cookie chunking

## 0.0.5

### Patch Changes

- 841fce0: Add cookie chunker methods and expose them to the SDK

## 0.0.4

### Patch Changes

- 4e5df45: Await get cookie function

## 0.0.3

### Patch Changes

- b9099fd: Fixed types for cookie methods

## 0.0.2

### Patch Changes

- 66e6b4c: Remove max-age option from cookieOptions

## 0.0.1

### Patch Changes

- 49f4043: The successor to the auth-helpers packages with sane defaults

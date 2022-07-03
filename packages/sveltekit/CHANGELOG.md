# @supabase/auth-helpers-sveltekit

## 0.6.3

### Patch Changes

- 9dda264: Add better error handling and error codes
- 9dda264: Fix supabaseServerClient with request and withApiAuth return type
- Updated dependencies [9dda264]
  - @supabase/auth-helpers-shared@0.1.1

## 0.6.2

### Patch Changes

- d23b268: [breaking change] Update the getUser function to only get the user and not save the token
- 1c95004: Add new handleAuth function to export all hooks as an array to destructure
- 588d329: Add handleLogout hook for logging out via endpoint /api/auth/logout

## 0.6.1

### Patch Changes

- 2f2abf2: Fix session being overwritten in SupaAuthHelper

## 0.6.0

### Minor Changes

- 1e56b35: Add file extension to es modules imports

## 0.5.0

### Minor Changes

- f854c7f: Remove unused helper files

## 0.4.0

### Minor Changes

- 865cc4a: Update packages to compile to esm

## 0.3.0

### Minor Changes

- f399820: Using shared package as a dependency
  Update sveltekit package with latest code to update tokens

## 0.2.0

### Minor Changes

- 5d741ae: Remove svelte-preprocess from sveltekit package

## 0.1.0

### Minor Changes

- de01c86: Initial release of svelte integration

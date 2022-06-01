# @supabase/auth-helpers-svelte

This submodule provides components for [SvelteKit](https://kit.svelte.dev/).

## Installation

Using [npm](https://npmjs.org):

```sh
npm install @supabase/auth-helpers-svelte
```

## Build step issue

Currently svelte-kit package doesn't handle bundling, so our `shared/` package has to be copied at build time
in order for this repo to be built properly. We have also added to the path alias `$lib` in the `tsconfig.json` to search in all directory above
this package if the path matches.

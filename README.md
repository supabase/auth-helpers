# @supabase/auth-helpers (BETA)

A collection of framework specific Auth utilities for working with Supabase.

## Supported Frameworks

- [Next.js](https://nextjs.org) [[Documentation](./packages/nextjs/README.md)]
- [Nuxt - via @nuxtjs/supabase](https://supabase.nuxtjs.org/)
- [SvelteKit](https://kit.svelte.dev) [[Documentation](./packages/sveltekit/README.md)]

### Coming soon

- [Remix](https://github.com/supabase/auth-helpers/issues/57)

### Examples and Packages

- Examples
  - `@examples/nextjs`: a [Next.js](https://nextjs.org) app
  - `@examples/sveltekit`: a [SvelteKit](https://kit.svelte.dev) app
  - `@examples/sveltekit-email-password`: a [SvelteKit](https://kit.svelte.dev) app with SSR sign in
  - `@examples/sveltekit-magic-link`: a [SvelteKit](https://kit.svelte.dev) app with magic links
- Packages
  - `@supabase/auth-helpers-nextjs`: the supabase auth helper nextjs library used by `nextjs` application
  - `@supabase/auth-helpers-react`: the supabase auth helper reactjs library used by `react` application
  - `@supabase/auth-helpers-sveltekit`: the supabase auth helper sveltekit library used by `sveltekit` application
  - `shared`: shared typescript types used by `@supabase/auth-helpers-nextjs` library
  - `config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
  - `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Development

Read the [development.md](./development.md) for more information.

Using a `@supabase/auth-helpers-[framework-name]` naming convention for packages

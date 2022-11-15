# @supabase/auth-helpers (BETA)

A collection of framework specific Auth utilities for working with Supabase.

## Supported Frameworks

- [Next.js](https://nextjs.org) [[Documentation](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)]
- [Nuxt - via @nuxtjs/supabase](https://supabase.nuxtjs.org/)
- [SvelteKit](https://kit.svelte.dev) [[Documentation](https://supabase.com/docs/guides/auth/auth-helpers/sveltekit)]
- [Remix](https://remix.run/) [[Documentation](https://supabase.com/docs/guides/auth/auth-helpers/remix)]

### Examples and Packages

- Examples
  - `@examples/nextjs`: a [Next.js](https://nextjs.org) app
  - `@examples/nextjs-server-components`: a [Next.js](https://nextjs.org) 13 app with Server Components and `app` directory
  - `@examples/sveltekit`: a [SvelteKit](https://kit.svelte.dev) app
  - `@examples/sveltekit-email-password`: a [SvelteKit](https://kit.svelte.dev) app with SSR sign in
  - `@examples/sveltekit-magic-link`: a [SvelteKit](https://kit.svelte.dev) app with magic links
  - `@examples/remix`: a [Remix](https://remix.run/) app
- Packages
  - `@supabase/auth-helpers-nextjs`: the supabase auth helper nextjs library used by `nextjs` application
  - `@supabase/auth-helpers-react`: the supabase auth helper reactjs library used by `react` application
  - `@supabase/auth-helpers-sveltekit`: the supabase auth helper sveltekit library used by `sveltekit` application
  - `@supabase/auth-helpers-remix`: the supabase auth helper remix library used by `remix` application
  - `shared`: shared typescript types used by `@supabase/auth-helpers-nextjs` library
  - `config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
  - `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Development & Contributing

Read the [development.md](./development.md) guide for more information on local setup, testing, and preparaing a release.

Using a `@supabase/auth-helpers-[framework-name]` naming convention for packages

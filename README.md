# @supabase/auth-helpers

A collection of framework specific Auth utilities for working with Supabase.

## Supported Frameworks

- [Next.js](./src/nextjs/README.md)
- [Nuxt - via @nuxtjs/supabase](https://supabase.nuxtjs.org/)

### Coming soon

- [Remix](https://github.com/supabase-community/supabase-auth-helpers/issues/57)
- [SvelteKit](https://github.com/supabase-community/supabase-auth-helpers/issues/54)

### Examples and Packages

- Examples
  - `@examples/nextjs`: a [Next.js](https://nextjs.org) app
- Packages
  - `@supabase/auth-helpers-nextjs`: the supabase auth helper nextjs library used by `nextjs` application
  - `@supabase/auth-helpers-react`: the supabase auth helper reactjs library used by `nextjs` application
  - `shared`: shared typescript types used by `@supabase/auth-helpers-nextjs` library
  - `config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
  - `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Setup

This repository is a monorepo using PNPM.

Install [pnpm](https://pnpm.io/installation)

> All commands below should be run at the root level of the cloned repository.

Install all examples and packages dependencies with pnpm

```sh
pnpm install
```

### Build

To build all apps and packages, run the following command:

```sh
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```sh
pnpm dev
```

### Change logs

To generate a changelog entry, run the following command:

```sh
pnpm changeset
```

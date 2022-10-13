This repository is a monorepo and makes use of [Turborepo](https://turborepo.org/) and PNPM workspaces.

## Set up

Before you begin, make sure you have the following set up on your local machine.

- Install [NodeJS v16.x (LTS)](https://nodejs.org/en/)
- Install [PNPM](https://pnpm.io/installation)

> All commands below should be run at the root level of the cloned repository.

### Install package dependencies

```bash
pnpm install
```

## Build

You can build all packages using the following command:

```bash
pnpm build
```

Or you can run build for the individual packages using the following command:

```bash
pnpm build:[dirname]
```

For react it would be

```bash
pnpm build:react
```

## Local development and testing

Once built, you can run all the packages and examples in development mode using the following command:

```bash
pnpm dev
```

After making and building your changes, make sure that the examples continue working and, if needed, update the relevant examples to test changes or added functionality.

## Preparing a release

**NOTE:** Do not touch the version number of any of the packages. These are automatically updated in CI via changeset!

---

Once you made your changes, built and tested them, you will need to generate a changelog entry via running:

```sh
pnpm changeset
```

Step through the steps, select the packages that you've made changes to and indicate what kind of release this is.

Changeset will generate a temporary file (see [example](https://github.com/supabase/auth-helpers/commit/63b1da08ec7b26ff2fe87b4d3c6e0e5f24fc1dc6#diff-bac6aefca6cf9c72965d3202f7d19999562965eb8831fce29cf2e3e0f6bcdc33)). Make sure to commit this file to your PR as this is used in CI to generate the release.

Once your PR is merged, CI will generate a PR (see [example](https://github.com/supabase/auth-helpers/commit/2cda81bda4ba810b9e73baaca238facc51bab2ce)) with the changelog entries, increment the version numbers accordingly, and remove the temporary changeset files. Upon merging this PR, CI will issue the new release to npm. 🥳

# Supabase Email and Password Server-side login with SvelteKit

## Getting started

Install the dependencies for this project by running the following command from this repository root directory in your terminal

```bash
pnpm install
```

## Project setup

1. Create a project on the Supabase dashboard
2. Get the `URL` and `anon` key from your [Settings > API](https://app.supabase.com/project/_/settings/api) section
3. Copy the `.env.example` file in this project and create a new `.env` file from it
4. Replace `VITE_SUPABASE_URL` with the `URL` from step 2 and `VITE_SUPABASE_ANON_KEY` with `anon` key from step 2
5. Copy the `SQL` below and paste it inside of the [SQL Editor](https://app.supabase.com/project/_/sql) section
```sql
DROP TABLE IF EXISTS "public"."test";

-- Table Definition
CREATE TABLE "public"."test" (
    "id" int8 NOT NULL,
    "created_at" timestamptz DEFAULT now(),
    PRIMARY KEY ("id")
);
```
6. Build all the packages that this example relies on using the following command 
```bash
pnpm build:svelteandkit
```
7. Run the following command from the repository root 
```bash
pnpm dev --filter=@example/sveltekit-email-password -- --open
```
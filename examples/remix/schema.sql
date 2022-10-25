-- This file can be used to create the database schema for this example.
-- Copy and paste these commands to the `SQL Editor` tab in your Supabase dashboard, and click `RUN`.

create table if not exists test (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

alter table public.test
  enable row level security;

create policy "Users can select their test records" on "public"."test"
  as permissive for select
  to authenticated
  using (uid() = user_id);

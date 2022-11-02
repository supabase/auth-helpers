-- This file can be used to create the database schema for this example.
-- Copy and paste these commands to the `SQL Editor` tab in your Supabase dashboard, and click `RUN`.

create table if not exists test (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

alter table public.test
  enable row level security;

create policy "Users can select their test records" on test
  as permissive for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own records." on test
  for insert with check (auth.uid() = user_id);


-- Set up realtime 
begin;
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;

  -- re-create the supabase_realtime publication with no tables and only for insert
  create publication supabase_realtime with (publish = 'insert');
commit;

-- add a table to the publication
alter publication supabase_realtime add table test;
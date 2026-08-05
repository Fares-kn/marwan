-- Run this in the Supabase SQL Editor (Project -> SQL Editor -> New query)

create extension if not exists "pgcrypto";

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  message_content text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security is the actual privacy boundary here: it runs on the
-- database itself, so it holds even if someone inspects the frontend code
-- or calls the API directly with the public anon key.
alter table public.messages enable row level security;

-- Guests, using the public anon key from the browser, may INSERT a message...
create policy "Guests can submit a message"
  on public.messages
  for insert
  to anon
  with check (true);

-- ...but there is deliberately NO select/update/delete policy for the
-- `anon` role, so guests can never read, edit, or delete any message -
-- including their own - from the browser. Only the service_role key
-- (used server-side by the /admin page) bypasses RLS and can read the table.

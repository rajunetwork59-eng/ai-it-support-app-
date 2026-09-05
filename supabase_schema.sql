-- Run this in Supabase: Project > SQL Editor > New query > paste this > Run

create table if not exists tickets (
  id bigint generated always as identity primary key,
  user_query text not null,
  category text,
  priority text,
  ai_response text,
  status text default 'open',
  created_at timestamp with time zone default now()
);

-- Allow the app (using the anon key) to read and write tickets.
-- This is fine for a demo/prototype project.
alter table tickets enable row level security;

create policy "Allow all access for demo"
on tickets
for all
using (true)
with check (true);

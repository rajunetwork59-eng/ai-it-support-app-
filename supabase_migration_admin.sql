-- Run this in Supabase: Project > SQL Editor > New query > paste this > Run

-- 1. A small table to track each user's role (default: regular user)
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  email text,
  role text default 'user' -- 'user' or 'admin'
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
on profiles for select
using (auth.uid() = id);

-- 2. Automatically create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Backfill profiles for any users who already signed up before this migration
insert into profiles (id, email, role)
select id, email, 'user' from auth.users
on conflict (id) do nothing;

-- 4. Helper function: is the current logged-in user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- 5. Let admins see AND update every ticket, not just their own
create policy "Admins can view all tickets"
on tickets for select
using (public.is_admin());

create policy "Admins can update all tickets"
on tickets for update
using (public.is_admin());

-- 6. To make yourself an admin, run this (replace with your actual login email):
-- update profiles set role = 'admin' where email = 'youremail@example.com';

-- Run this in Supabase: Project > SQL Editor > New query > paste this > Run

-- 1. Add a column linking each ticket to the user who created it
alter table tickets add column if not exists user_id uuid references auth.users(id);

-- 2. Remove the old "anyone can do anything" policy
drop policy if exists "Allow all access for demo" on tickets;

-- 3. New policy: users can only see their OWN tickets
create policy "Users can view their own tickets"
on tickets
for select
using (auth.uid() = user_id);

-- 4. New policy: users can only create tickets under their own account
create policy "Users can insert their own tickets"
on tickets
for insert
with check (auth.uid() = user_id);

-- (Optional) allow users to update/delete only their own tickets too
create policy "Users can update their own tickets"
on tickets
for update
using (auth.uid() = user_id);

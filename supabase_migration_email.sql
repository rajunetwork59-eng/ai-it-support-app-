-- Run this in Supabase: Project > SQL Editor > New query > paste this > Run

alter table tickets add column if not exists user_email text;

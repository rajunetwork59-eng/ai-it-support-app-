-- Run this in Supabase: Project > SQL Editor > New query > paste this > Run

alter table tickets add column if not exists raised_by_name text;
alter table tickets add column if not exists department text;

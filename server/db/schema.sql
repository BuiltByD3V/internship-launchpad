-- Internship Launchpad — applications table + Row Level Security
-- Run in Supabase SQL editor (idempotent: safe to re-run).

create table if not exists public.applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  company         text not null,
  role            text not null,
  status          text not null default 'applied'
                    check (status in ('applied','interviewing','offer','rejected','accepted')),
  deadline        date,
  notes           text,
  job_description text,
  created_at      timestamptz not null default now()
);

-- Per-user query index
create index if not exists applications_user_id_idx
  on public.applications (user_id);

-- Row Level Security: a user can touch only their own rows.
-- This is the security backstop — enforced by the DB even if app code slips.
alter table public.applications enable row level security;

drop policy if exists "Users read own applications"   on public.applications;
drop policy if exists "Users insert own applications" on public.applications;
drop policy if exists "Users update own applications" on public.applications;
drop policy if exists "Users delete own applications" on public.applications;

create policy "Users read own applications"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "Users insert own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "Users update own applications"
  on public.applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own applications"
  on public.applications for delete
  using (auth.uid() = user_id);

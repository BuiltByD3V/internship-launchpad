create table if not exists public.profiles (
  user_id              uuid primary key references auth.users (id) on delete cascade,
  school               text,
  major                text,
  grad_year            int,
  skills               text[] not null default '{}',
  target_role          text,
  experience_level     text check (experience_level in ('none','some','experienced')),
  experience_summary   text,
  interests            text[] not null default '{}',
  github_url           text,
  portfolio_url        text,
  location             text,
  work_auth            text,
  preferred_industries text[] not null default '{}',
  onboarded            boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile"   on public.profiles;
drop policy if exists "Users insert own profile"  on public.profiles;
drop policy if exists "Users update own profile"  on public.profiles;

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
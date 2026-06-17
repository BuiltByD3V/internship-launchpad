-- Internship Launchpad AI usage limits and cache.
-- Run in Supabase SQL editor after schema.sql.

create table if not exists public.ai_usage_events (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users (id) on delete cascade,
  endpoint               text not null,
  request_hash           text not null check (length(request_hash) = 64),
  input_chars            int not null default 0,
  estimated_input_tokens int not null default 0,
  input_tokens           int,
  output_tokens          int,
  cache_hit              boolean not null default false,
  success                boolean not null default true,
  error_code             text,
  created_at             timestamptz not null default now()
);

create index if not exists ai_usage_events_user_created_idx
  on public.ai_usage_events (user_id, created_at desc);

alter table public.ai_usage_events enable row level security;

drop policy if exists "Users read own AI usage events"
  on public.ai_usage_events;
drop policy if exists "Users insert own AI usage events"
  on public.ai_usage_events;

create policy "Users read own AI usage events"
  on public.ai_usage_events for select
  using (auth.uid() = user_id);

create policy "Users insert own AI usage events"
  on public.ai_usage_events for insert
  with check (auth.uid() = user_id);

create table if not exists public.ai_analysis_cache (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  request_hash text not null check (length(request_hash) = 64),
  result       jsonb not null,
  input_chars  int not null default 0,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id, request_hash)
);

create index if not exists ai_analysis_cache_user_hash_idx
  on public.ai_analysis_cache (user_id, request_hash);

create index if not exists ai_analysis_cache_expires_idx
  on public.ai_analysis_cache (expires_at);

alter table public.ai_analysis_cache enable row level security;

drop policy if exists "Users read own AI cache"
  on public.ai_analysis_cache;
drop policy if exists "Users insert own AI cache"
  on public.ai_analysis_cache;
drop policy if exists "Users update own AI cache"
  on public.ai_analysis_cache;

create policy "Users read own AI cache"
  on public.ai_analysis_cache for select
  using (auth.uid() = user_id);

create policy "Users insert own AI cache"
  on public.ai_analysis_cache for insert
  with check (auth.uid() = user_id);

create policy "Users update own AI cache"
  on public.ai_analysis_cache for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

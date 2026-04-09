-- Ramyeon Labs schema
-- Run in Supabase SQL editor. Safe to re-run (uses IF NOT EXISTS where possible).

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text not null,
  avatar_url text,
  location text,
  building varchar(280),
  x_handle text,
  linkedin_url text,
  website_url text,
  researcher_number serial unique
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description varchar(500),
  screenshot_url text,
  project_url text,
  tags text[],
  is_published boolean not null default true
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  is_active boolean not null default false,
  label text,
  host_note text,
  event_date date
);

create table if not exists public.queue_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  position int not null,
  status text not null default 'waiting' check (status in ('waiting', 'cooking', 'done')),
  unique (session_id, profile_id)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  body text not null
);

-- =========================================================================
-- RLS
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.sessions enable row level security;
alter table public.queue_entries enable row level security;
alter table public.announcements enable row level security;

-- profiles
drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- projects
drop policy if exists "projects_read_published" on public.projects;
create policy "projects_read_published" on public.projects
  for select using (is_published = true or profile_id = auth.uid());

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own" on public.projects
  for insert with check (profile_id = auth.uid());

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own" on public.projects
  for update using (profile_id = auth.uid());

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own" on public.projects
  for delete using (profile_id = auth.uid());

-- sessions
drop policy if exists "sessions_read_all" on public.sessions;
create policy "sessions_read_all" on public.sessions for select using (true);

-- queue_entries
drop policy if exists "queue_read_all" on public.queue_entries;
create policy "queue_read_all" on public.queue_entries for select using (true);

drop policy if exists "queue_delete_own" on public.queue_entries;
create policy "queue_delete_own" on public.queue_entries
  for delete using (profile_id = auth.uid());

-- announcements
drop policy if exists "announcements_read_all" on public.announcements;
create policy "announcements_read_all" on public.announcements for select using (true);

-- =========================================================================
-- Realtime publication
-- =========================================================================
alter publication supabase_realtime add table public.queue_entries;
alter publication supabase_realtime add table public.sessions;

-- =========================================================================
-- Storage buckets
-- =========================================================================
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('projects', 'projects', true)
  on conflict (id) do nothing;

-- Storage policies: users can write to their own uid folder
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_auth_write_own" on storage.objects;
create policy "avatars_auth_write_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars_auth_update_own" on storage.objects;
create policy "avatars_auth_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "projects_public_read" on storage.objects;
create policy "projects_public_read" on storage.objects
  for select using (bucket_id = 'projects');

drop policy if exists "projects_auth_write_own" on storage.objects;
create policy "projects_auth_write_own" on storage.objects
  for insert with check (
    bucket_id = 'projects'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

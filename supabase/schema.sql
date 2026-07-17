-- ================================================================
--  INSEE — Supabase Database Schema
--  Run this in the Supabase SQL editor to set up all tables.
-- ================================================================

-- ── Enable UUID extension ──────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── profiles ──────────────────────────────────────────────────
-- Extends Supabase auth.users with role and contact info
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        text not null check (role in ('admin', 'caretaker')),
  phone       text,
  created_at  timestamptz default now()
);

-- ── persons ───────────────────────────────────────────────────
-- Visually impaired individuals being tracked
create table if not exists public.persons (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  caretaker_id  uuid references public.profiles(id) on delete set null,
  device_id     text unique,           -- e.g. "CANE-001"
  is_active     boolean default true,
  battery_level integer default 100,
  phone         text,
  created_at    timestamptz default now()
);

-- ── locations ─────────────────────────────────────────────────
-- GPS location history — Pi inserts every ~5s
create table if not exists public.locations (
  id          uuid primary key default uuid_generate_v4(),
  person_id   uuid not null references public.persons(id) on delete cascade,
  lat         double precision not null,
  lng         double precision not null,
  accuracy    float,
  created_at  timestamptz default now()
);

-- Index for fast latest-location queries
create index if not exists locations_person_time
  on public.locations (person_id, created_at desc);

-- ── alerts ────────────────────────────────────────────────────
-- Emergency alerts triggered by SOS button on the cane
create table if not exists public.alerts (
  id           uuid primary key default uuid_generate_v4(),
  person_id    uuid not null references public.persons(id) on delete cascade,
  type         text not null check (type in ('emergency')),
  status       text not null check (status in ('active', 'acknowledged', 'resolved'))
                 default 'active',
  -- severity filled in after person responds (short/long press)
  severity     text check (severity in ('minor', 'major')),
  message      text,
  lat          double precision,
  lng          double precision,
  created_at   timestamptz default now(),
  resolved_at  timestamptz
);

create index if not exists alerts_person_time
  on public.alerts (person_id, created_at desc);

-- ── caretaker_signals ─────────────────────────────────────────
-- Messages sent from caretaker dashboard → person (spoken via TTS on Pi)
create table if not exists public.caretaker_signals (
  id            uuid primary key default uuid_generate_v4(),
  alert_id      uuid references public.alerts(id) on delete cascade,
  person_id     uuid not null references public.persons(id) on delete cascade,
  caretaker_id  uuid not null references public.profiles(id) on delete cascade,
  signal_type   text check (signal_type in ('help_coming', 'are_you_ok', 'call_received', 'stay_put', 'custom')),
  message       text not null,
  delivered     boolean default false,
  created_at    timestamptz default now()
);

-- ── camera_snapshots ──────────────────────────────────────────
-- References to snapshots stored in Supabase Storage bucket "camera-feed"
-- Pi uploads: storage path = "live/{person_id}.jpg" (upserted, overwritten)
create table if not exists public.camera_snapshots (
  id            uuid primary key default uuid_generate_v4(),
  person_id     uuid not null references public.persons(id) on delete cascade,
  alert_id      uuid references public.alerts(id) on delete set null,
  storage_path  text not null,   -- "live/{person_id}.jpg"
  created_at    timestamptz default now()
);

-- ================================================================
--  Row Level Security (RLS)
-- ================================================================

alter table public.profiles           enable row level security;
alter table public.persons            enable row level security;
alter table public.locations          enable row level security;
alter table public.alerts             enable row level security;
alter table public.caretaker_signals  enable row level security;
alter table public.camera_snapshots   enable row level security;

-- ── Profiles: user sees only their own row ─────────────────────
create policy "Own profile" on public.profiles
  for all using (auth.uid() = id);

-- Admin sees all profiles
create policy "Admin sees all profiles" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── Persons: caretaker sees only their linked persons ──────────
create policy "Caretaker sees their persons" on public.persons
  for select using (
    caretaker_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ── Locations: caretaker sees their person's locations ─────────
create policy "Caretaker location access" on public.locations
  for select using (
    exists (
      select 1 from public.persons per
      where per.id = person_id and per.caretaker_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Pi can insert locations (use service role key on Pi)
create policy "Device can insert location" on public.locations
  for insert with check (true); -- restrict via service role in production

-- ── Alerts ────────────────────────────────────────────────────
create policy "Caretaker alert access" on public.alerts
  for all using (
    exists (
      select 1 from public.persons per
      where per.id = person_id and per.caretaker_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Device can insert alert" on public.alerts
  for insert with check (true);

-- ── Caretaker signals ─────────────────────────────────────────
create policy "Caretaker signal access" on public.caretaker_signals
  for all using (
    caretaker_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Pi can read signals addressed to its person
create policy "Device reads its signals" on public.caretaker_signals
  for select using (true); -- restrict to service role in production

-- ── Camera snapshots ──────────────────────────────────────────
create policy "Caretaker camera access" on public.camera_snapshots
  for select using (
    exists (
      select 1 from public.persons per
      where per.id = person_id and per.caretaker_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ================================================================
--  Realtime — enable broadcast on key tables
-- ================================================================

-- In the Supabase Dashboard → Database → Replication,
-- enable the following tables for Realtime:
--   public.locations
--   public.alerts
--   public.caretaker_signals

-- ================================================================
--  Storage bucket
-- ================================================================

-- Create bucket "camera-feed" in Supabase Dashboard → Storage.
-- Set it to PUBLIC so the dashboard can render <img src={publicUrl} />.
-- Pi uploads with service role key using upsert=true so it always
-- overwrites "live/{person_id}.jpg" (latest frame only).

-- ================================================================
--  Seed data for testing (optional)
-- ================================================================

-- After creating a Supabase Auth user, insert their profile:
-- insert into public.profiles (id, full_name, role)
-- values ('<auth-user-uuid>', 'Sara Khan', 'caretaker');

-- insert into public.persons (name, caretaker_id, device_id)
-- values ('Ahmed Khan', '<caretaker-profile-uuid>', 'CANE-001');

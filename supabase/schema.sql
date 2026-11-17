-- ==============================================================================
-- MKF CONNECT - Supabase Database Schema
-- Version: 1.0 (MIC Knowledge Festival 2026)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  role text not null check (role in ('audience', 'volunteer', 'admin')) default 'audience',
  phone text,
  team text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Programs / Festival Schedule Table
create table if not exists public.programs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  speaker text,
  start_time text not null,
  end_time text not null,
  venue text not null,
  category text,
  status text not null check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')) default 'upcoming',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Announcements & Emergency Broadcasts Table
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  target text not null check (target in ('all', 'audience', 'volunteers')) default 'all',
  priority text not null check (priority in ('normal', 'high', 'urgent')) default 'normal',
  author text default 'Admin Control',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Food & Prayer Timings Table
create table if not exists public.food_prayer (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('food', 'prayer')),
  title text not null,
  time text not null,
  location text not null,
  status text not null check (status in ('upcoming', 'active', 'completed')) default 'upcoming',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Lost & Found Table
create table if not exists public.lost_found (
  id uuid primary key default uuid_generate_v4(),
  item_name text not null,
  description text not null,
  category text not null,
  location text not null,
  image_url text,
  status text not null check (status in ('reported', 'found', 'returned')) default 'reported',
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Help Requests / Incident Support Table
create table if not exists public.help_requests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  description text not null,
  location text not null,
  contact text,
  status text not null check (status in ('open', 'assigned', 'in_progress', 'resolved')) default 'open',
  assigned_to text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Volunteer Tasks & Radar Table
create table if not exists public.volunteer_tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  instructions text not null,
  location text not null,
  priority text not null check (priority in ('normal', 'high', 'urgent')) default 'normal',
  status text not null check (status in ('pending', 'accepted', 'completed')) default 'pending',
  assigned_to text not null default 'all',
  team text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  accepted_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- Realtime Publication
alter publication supabase_realtime add table public.announcements;
alter publication supabase_realtime add table public.programs;
alter publication supabase_realtime add table public.volunteer_tasks;
alter publication supabase_realtime add table public.food_prayer;
alter publication supabase_realtime add table public.help_requests;
alter publication supabase_realtime add table public.lost_found;

-- Enable Row Level Security (RLS)
alter table public.programs enable row level security;
alter table public.announcements enable row level security;
alter table public.food_prayer enable row level security;
alter table public.lost_found enable row level security;
alter table public.help_requests enable row level security;
alter table public.volunteer_tasks enable row level security;

-- Public read access policies
create policy "Allow public read on programs" on public.programs for select using (true);
create policy "Allow public read on announcements" on public.announcements for select using (true);
create policy "Allow public read on food_prayer" on public.food_prayer for select using (true);
create policy "Allow public read on lost_found" on public.lost_found for select using (true);
create policy "Allow public read on help_requests" on public.help_requests for select using (true);
create policy "Allow public read on volunteer_tasks" on public.volunteer_tasks for select using (true);

-- Insert policies for attendees
create policy "Allow public insert on lost_found" on public.lost_found for insert with check (true);
create policy "Allow public insert on help_requests" on public.help_requests for insert with check (true);

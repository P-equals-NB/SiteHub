-- SiteHub Supabase database
-- Run this in Supabase SQL Editor.

create table public.sites (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    url text not null,
    description text not null,
    author_name text not null,
    category text not null default 'other',

    stars integer not null default 0,
    views integer not null default 0,

    created_at timestamptz not null default now()
);

alter table public.sites enable row level security;

create policy "Anyone can view sites"
on public.sites
for select
to anon
using (true);

create policy "Anyone can add sites"
on public.sites
for insert
to anon
with check (true);

create policy "Anyone can update site stats"
on public.sites
for update
to anon
using (true)
with check (true);

grant select, insert, update
on public.sites
to anon;

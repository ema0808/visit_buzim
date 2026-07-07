@AGENTS.md
# Buzim Weekend Houses Platform

## What this project is
A web platform for Buzim (small town in Bosnia), backed by the local mayor, that lets
weekend house owners with pools register their properties and lets visitors browse
listings and check availability. About 20 houses to start. The mayor also wants to use
this site to help promote Buzim as a destination.

Booking itself is NOT handled online — visitors see availability, then contact the
owner directly (phone/WhatsApp/email) to finalize. No payments processed on-site.

## Stack
- **Frontend + backend:** Next.js (App Router), deployed on Vercel
- **Database, Auth, Storage:** Supabase (Postgres)
- Owners register/log in via Supabase Auth and manage only their own house(s)
- Visitors browse public listings with no login required

## Known cost/hosting constraints (read before suggesting infra changes)
- **Vercel Hobby (free) plan is technically "non-commercial use only"** per its ToS.
  This project is a gray area (mayor-backed, enables paid bookings for owners, no
  direct payment on-site). Currently running on Hobby anyway at low traffic. If this
  becomes a concern, or online payments get added later, move to Vercel Pro
  ($20/user/month) or Cloudflare Pages (no non-commercial restriction).
- **Supabase free tier** covers this project's scale comfortably (500 MB DB,
  50k MAU, 1 GB file storage) — house photos are the only thing to watch, keep
  compressed.
- **No automatic backups on Supabase free tier.** Plan: set up a scheduled Postgres
  dump via GitHub Actions to free storage (private repo or Cloudflare R2). This is
  still an open TODO — remind Ema if not yet implemented.
- Free Supabase projects pause after 7 days of inactivity — irrelevant once live with
  regular traffic, but can bite during quiet dev periods.

## Database schema (Postgres via Supabase)

```sql
-- Owners: extends Supabase's built-in auth.users
create table owners (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  created_at timestamptz default now()
);

-- Houses
create table houses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  name text not null,
  description text,
  address text,
  max_guests int,
  has_pool boolean default true,
  price_per_night numeric(10,2),
  is_published boolean default false,  -- owner can hide until ready
  created_at timestamptz default now()
);

-- Photos (one house can have many)
create table house_photos (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  storage_path text not null,   -- path in Supabase Storage bucket
  sort_order int default 0
);

-- Blocked/unavailable date ranges (not a full bookings/payments table)
create table unavailable_dates (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  note text,
  check (end_date >= start_date)
);
```

### Row Level Security
- Public (even logged-out) can `select` houses where `is_published = true`
- Owners can do anything (`for all`) on rows where `auth.uid() = owner_id`
- Same ownership-based policies should apply to `house_photos` and
  `unavailable_dates`, checked via the linked `house_id` -> `houses.owner_id`

### Key availability check query
```sql
select not exists (
  select 1 from unavailable_dates
  where house_id = 'some-house-id'
    and start_date <= '2026-08-15'
    and end_date >= '2026-08-10'
) as is_available;
```

## Ema's background / working style
- Developer based in Buzim, Bosnia; background is Android development, learning
  full-stack web dev (Node.js, Next.js, PostgreSQL) largely through building this
  real project
- Plans to maintain this app independently long-term, adding features incrementally
- Prefers understanding *why*, not just copy-pasting — explain reasoning, don't just
  hand over code silently
- Cost-consciousness is a real constraint, not just a preference — flag anything that
  could push this off free/cheap tiers

## Coding conventions
- **All user-facing strings must live in `lib/strings.ts`** and be referenced via the `t` object. Never hardcode visible text directly in components.

## Open next steps (as of last session)
- [ ] Wire up Next.js pages to fetch real house data from Supabase
- [ ] Build owner login + "edit my house" flow using Supabase Auth
- [ ] Implement the GitHub Actions Supabase backup job
- [ ] Decide Vercel Hobby vs Pro before/at public launch with the mayor
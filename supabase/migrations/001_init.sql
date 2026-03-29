create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists bounties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  company_name text not null,
  company_email text,
  vulnerability_type text,
  severity text check (severity in ('critical', 'high', 'medium', 'low')),
  platform text check (platform in ('web', 'mobile', 'api', 'other')),
  title text not null,
  description text,
  poc_notes text,
  status text check (status in ('draft', 'reported', 'triaging', 'accepted', 'duplicate', 'rejected', 'paid')) default 'draft',
  bounty_expected numeric,
  bounty_awarded numeric,
  reported_at timestamptz,
  resolved_at timestamptz,
  gmail_thread_id text,
  last_email_at timestamptz,
  stale_after_days int default 14,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists freelance_engagements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  client_name text not null,
  client_email text,
  title text not null,
  scope_summary text,
  stage text check (stage in ('lead', 'proposal_sent', 'negotiating', 'in_progress', 'delivered', 'closed_won', 'closed_lost')) default 'lead',
  expected_value numeric,
  agreed_value numeric,
  payment_status text check (payment_status in ('unpaid', 'partial', 'paid')) default 'unpaid',
  gmail_thread_id text,
  last_email_at timestamptz,
  stale_after_days int default 14,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  bounty_id uuid references bounties on delete cascade,
  freelance_id uuid references freelance_engagements on delete cascade,
  gmail_message_id text unique not null,
  gmail_thread_id text not null,
  from_address text,
  to_address text,
  subject text,
  body_preview text,
  body_full text,
  is_sent_by_me boolean default false,
  received_at timestamptz,
  seen_at timestamptz,
  synced_at timestamptz default now(),
  check ((bounty_id is not null) or (freelance_id is not null))
);

create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  bounty_id uuid references bounties on delete cascade,
  freelance_id uuid references freelance_engagements on delete cascade,
  amount numeric not null,
  currency text default 'USD',
  payment_method text default 'paypal',
  paid_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  check ((bounty_id is not null) or (freelance_id is not null))
);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  freelance_id uuid references freelance_engagements on delete cascade not null,
  title text not null,
  amount numeric,
  due_at timestamptz,
  completed_at timestamptz,
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  created_at timestamptz default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  freelance_id uuid references freelance_engagements on delete cascade not null,
  invoice_number text,
  amount numeric not null,
  currency text default 'USD',
  status text check (status in ('draft', 'sent', 'overdue', 'paid')) default 'draft',
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists gmail_sync (
  user_id uuid references auth.users primary key,
  google_access_token text,
  google_refresh_token text,
  history_id text,
  last_synced_at timestamptz,
  sync_status text default 'idle'
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.gmail_sync (user_id, sync_status)
  values (new.id, 'idle')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_bounties_updated_at on bounties;
create trigger set_bounties_updated_at
  before update on bounties
  for each row execute function public.set_updated_at();

drop trigger if exists set_freelance_updated_at on freelance_engagements;
create trigger set_freelance_updated_at
  before update on freelance_engagements
  for each row execute function public.set_updated_at();

create index if not exists idx_bounties_user_created_at on bounties (user_id, created_at desc);
create index if not exists idx_bounties_thread on bounties (user_id, gmail_thread_id);
create index if not exists idx_freelance_user_created_at on freelance_engagements (user_id, created_at desc);
create index if not exists idx_freelance_thread on freelance_engagements (user_id, gmail_thread_id);
create index if not exists idx_emails_user_received_at on emails (user_id, received_at desc);
create index if not exists idx_emails_thread on emails (user_id, gmail_thread_id);
create index if not exists idx_payouts_user_paid_at on payouts (user_id, paid_at desc);

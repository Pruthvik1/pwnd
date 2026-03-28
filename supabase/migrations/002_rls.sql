alter table profiles enable row level security;
alter table bounties enable row level security;
alter table freelance_engagements enable row level security;
alter table emails enable row level security;
alter table payouts enable row level security;
alter table milestones enable row level security;
alter table invoices enable row level security;
alter table gmail_sync enable row level security;

create policy "Users access own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users access own bounties" on bounties for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users access own freelance" on freelance_engagements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users access own emails" on emails for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users access own payouts" on payouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users access own milestones" on milestones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users access own invoices" on invoices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users access own gmail_sync" on gmail_sync for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Add missing gmail token columns to gmail_sync table
alter table gmail_sync
add column if not exists google_access_token text,
add column if not exists google_refresh_token text;

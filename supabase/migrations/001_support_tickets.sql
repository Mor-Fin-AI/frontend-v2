-- Morfinance: profiles + support tickets with RLS

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  wallet_address text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists support_ticket_number_seq start 1;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null default '' unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  subject text not null check (char_length(subject) <= 120),
  category text not null check (category in ('Account', 'Wallet', 'Treasury', 'Technical', 'Billing', 'Other')),
  priority text not null check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  description text not null,
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_user_id_idx on public.support_tickets (user_id);
create index if not exists support_tickets_status_idx on public.support_tickets (status);
create index if not exists support_tickets_created_at_idx on public.support_tickets (created_at desc);

create or replace function public.set_ticket_number()
returns trigger
language plpgsql
as $$
begin
  if new.ticket_number is null or new.ticket_number = '' then
    new.ticket_number := 'TKT-' || lpad(nextval('support_ticket_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists support_tickets_set_number on public.support_tickets;
create trigger support_tickets_set_number
before insert on public.support_tickets
for each row
execute function public.set_ticket_number();

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists support_tickets_updated_at on public.support_tickets;
create trigger support_tickets_updated_at
before update on public.support_tickets
for each row
execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.support_tickets enable row level security;

drop policy if exists "Profiles: users read own" on public.profiles;
create policy "Profiles: users read own"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "Profiles: users update own" on public.profiles;
create policy "Profiles: users update own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Profiles: admins update any" on public.profiles;
create policy "Profiles: admins update any"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Tickets: users read own" on public.support_tickets;
create policy "Tickets: users read own"
on public.support_tickets for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Tickets: users insert own" on public.support_tickets;
create policy "Tickets: users insert own"
on public.support_tickets for insert
with check (auth.uid() = user_id);

drop policy if exists "Tickets: admins update any" on public.support_tickets;
create policy "Tickets: admins update any"
on public.support_tickets for update
using (public.is_admin())
with check (public.is_admin());

-- Promote your first admin (replace email):
-- update public.profiles set role = 'admin' where email = 'you@example.com';

-- Seed admin configuration + auto-promote on signup

create table if not exists public.platform_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.platform_config (key, value)
values ('seed_admin_emails', 'admin@morfinance.io')
on conflict (key) do nothing;

create or replace function public.is_seed_admin_email(target_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_config c,
    lateral unnest(string_to_array(c.value, ',')) as seed(entry)
    where c.key = 'seed_admin_emails'
      and trim(seed.entry) <> ''
      and lower(trim(seed.entry)) = lower(trim(target_email))
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role text := 'user';
begin
  if public.is_seed_admin_email(new.email) then
    assigned_role := 'admin';
  end if;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, assigned_role)
  on conflict (id) do update
    set email = excluded.email,
        role = case
          when public.is_seed_admin_email(excluded.email) then 'admin'
          else public.profiles.role
        end;

  return new;
end;
$$;

-- Promote any existing profile that matches seed admin emails
update public.profiles p
set role = 'admin'
where public.is_seed_admin_email(p.email);

drop policy if exists "Notifications: users insert own" on public.notifications;
create policy "Notifications: users insert own"
on public.notifications for insert
with check (auth.uid() = user_id or public.is_admin());

alter table public.platform_config enable row level security;

drop policy if exists "Platform config: admins read" on public.platform_config;
create policy "Platform config: admins read"
on public.platform_config for select
using (public.is_admin());

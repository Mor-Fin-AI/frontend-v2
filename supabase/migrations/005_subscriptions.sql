-- Morfinance: Stripe subscription records

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  tier text not null default 'free' check (tier in ('free', 'public', 'private')),
  billing_period text check (billing_period in ('monthly', 'annual')),
  status text not null default 'inactive' check (
    status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')
  ),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id);

create index if not exists subscriptions_status_idx
  on public.subscriptions (status);

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.handle_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "Subscriptions: users read own" on public.subscriptions;
create policy "Subscriptions: users read own"
on public.subscriptions for select
using (auth.uid() = user_id or public.is_admin());

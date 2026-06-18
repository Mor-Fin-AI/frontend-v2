-- Notifications + Morfinance support chat

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'system'
    check (type in ('learning', 'governance', 'reward', 'system', 'support')),
  read boolean not null default false,
  href text,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);
create index if not exists notifications_unread_idx on public.notifications (user_id, read);

create table if not exists public.support_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.support_chat_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'support')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists support_chat_messages_session_idx
  on public.support_chat_messages (session_id, created_at);

drop trigger if exists support_chat_sessions_updated_at on public.support_chat_sessions;
create trigger support_chat_sessions_updated_at
before update on public.support_chat_sessions
for each row
execute function public.handle_updated_at();

alter table public.notifications enable row level security;
alter table public.support_chat_sessions enable row level security;
alter table public.support_chat_messages enable row level security;

drop policy if exists "Notifications: users read own" on public.notifications;
create policy "Notifications: users read own"
on public.notifications for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Notifications: users update own" on public.notifications;
create policy "Notifications: users update own"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Notifications: users insert own" on public.notifications;
create policy "Notifications: users insert own"
on public.notifications for insert
with check (auth.uid() = user_id);

drop policy if exists "Chat sessions: users read own" on public.support_chat_sessions;
create policy "Chat sessions: users read own"
on public.support_chat_sessions for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Chat sessions: users insert own" on public.support_chat_sessions;
create policy "Chat sessions: users insert own"
on public.support_chat_sessions for insert
with check (auth.uid() = user_id);

drop policy if exists "Chat sessions: users update own" on public.support_chat_sessions;
create policy "Chat sessions: users update own"
on public.support_chat_sessions for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Chat messages: users read own session" on public.support_chat_messages;
create policy "Chat messages: users read own session"
on public.support_chat_messages for select
using (
  exists (
    select 1
    from public.support_chat_sessions s
    where s.id = session_id
      and (s.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "Chat messages: users insert own" on public.support_chat_messages;
create policy "Chat messages: users insert own"
on public.support_chat_messages for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.support_chat_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

drop policy if exists "Chat messages: admin insert support" on public.support_chat_messages;
create policy "Chat messages: admin insert support"
on public.support_chat_messages for insert
with check (public.is_admin());

alter table public.notifications replica identity full;
alter table public.support_chat_messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.support_chat_messages;
exception
  when duplicate_object then null;
end $$;

create table if not exists public.admin_notifications (
  id bigint generated always as identity primary key,
  type text not null default 'info',
  title text not null,
  message text not null,
  target_path text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_created_at_idx
  on public.admin_notifications (created_at desc);
create index if not exists admin_notifications_unread_idx
  on public.admin_notifications (created_at desc) where read_at is null;

alter table public.admin_notifications enable row level security;

drop policy if exists "Admins can read notifications" on public.admin_notifications;
create policy "Admins can read notifications"
  on public.admin_notifications for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update notifications" on public.admin_notifications;
create policy "Admins can update notifications"
  on public.admin_notifications for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.notify_admins_of_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_notifications (type, title, message, target_path, metadata)
  values (
    'new_order',
    'Nouvelle commande',
    new.customer_name || ' a passé la commande ' || new.order_number || '.',
    '/admin/commandes/' || new.id,
    jsonb_build_object('order_id', new.id, 'order_number', new.order_number, 'total', new.total)
  );
  return new;
end;
$$;

drop trigger if exists notify_admins_after_order_insert on public.orders;
create trigger notify_admins_after_order_insert
after insert on public.orders
for each row execute procedure public.notify_admins_of_new_order();

do $$
begin
  alter publication supabase_realtime add table public.admin_notifications;
exception
  when duplicate_object then null;
end $$;

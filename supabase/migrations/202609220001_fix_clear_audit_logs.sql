-- 1. Création de la table de journalisation si elle n'existe pas encore
create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  table_name text not null,
  record_id text,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  occurred_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

-- Politiques de sécurité
drop policy if exists "Admins read audit logs" on public.admin_audit_logs;
create policy "Admins read audit logs" on public.admin_audit_logs
for select to authenticated using (public.is_admin());

drop policy if exists "Admins delete audit logs" on public.admin_audit_logs;
create policy "Admins delete audit logs" on public.admin_audit_logs
for delete to authenticated using (public.is_admin());

-- 2. Fonction RPC pour vider le journal d'audit
create or replace function public.clear_admin_audit_logs()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Accès administrateur requis.'; end if;
  delete from public.admin_audit_logs where id >= 0;
end;
$$;

revoke all on function public.clear_admin_audit_logs() from public;
grant execute on function public.clear_admin_audit_logs() to authenticated;

-- 3. Fonction déclencheur pour enregistrer les actions administrateur
create or replace function public.log_admin_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_id text;
begin
  if not public.is_admin() then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;
  if tg_op = 'DELETE' then
    row_id := coalesce(to_jsonb(old) ->> 'id', to_jsonb(old) ->> 'key');
  else
    row_id := coalesce(to_jsonb(new) ->> 'id', to_jsonb(new) ->> 'key');
  end if;
  insert into public.admin_audit_logs(admin_id, table_name, record_id, action)
  values (auth.uid(), tg_table_name, row_id, tg_op);
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

-- 4. Attachement automatique des déclencheurs
do $$
declare
  target text;
begin
  foreach target in array array['products','categories','orders','gallery_items','testimonials','site_content','site_settings']
  loop
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = target) then
      execute format('drop trigger if exists audit_admin_changes on public.%I', target);
      execute format(
        'create trigger audit_admin_changes after insert or update or delete on public.%I for each row execute function public.log_admin_change()',
        target
      );
    end if;
  end loop;
end $$;

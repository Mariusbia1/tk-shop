-- Migration pour corriger la fonction clear_admin_audit_logs et autoriser la suppression
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

-- Politique de suppression directe pour les administrateurs (au cas où PostgREST est utilisé en direct)
drop policy if exists "Admins delete audit logs" on public.admin_audit_logs;
create policy "Admins delete audit logs" on public.admin_audit_logs
for delete to authenticated using (public.is_admin());

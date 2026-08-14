-- Paiement en ligne : acompte de 50 % et suivi FedaPay.
alter table public.orders
  add column if not exists payment_method text not null default 'whatsapp' check (payment_method in ('whatsapp', 'fedapay')),
  add column if not exists payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'partially_paid', 'paid', 'failed')),
  add column if not exists deposit_amount integer not null default 0 check (deposit_amount >= 0),
  add column if not exists remaining_amount integer not null default 0 check (remaining_amount >= 0),
  add column if not exists payment_transaction_id text,
  add column if not exists completed_at timestamptz;

create or replace function public.create_order_with_payment(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb; order_id uuid; order_total integer; method text;
begin
  result := public.create_secure_order(payload);
  order_id := (result ->> 'id')::uuid;
  order_total := (result ->> 'total')::integer;
  method := case when payload #>> '{customer,payment_method}' = 'fedapay' then 'fedapay' else 'whatsapp' end;
  update public.orders
  set payment_method = method,
      payment_status = case when method = 'fedapay' then 'pending' else 'unpaid' end,
      deposit_amount = case when method = 'fedapay' then ceil(order_total / 2.0)::integer else 0 end,
      remaining_amount = case when method = 'fedapay' then floor(order_total / 2.0)::integer else order_total end,
      whatsapp_sent = (method = 'whatsapp')
  where id = order_id;
  return result || jsonb_build_object('payment_method', method, 'deposit_amount', case when method = 'fedapay' then ceil(order_total / 2.0)::integer else 0 end);
end;
$$;
revoke all on function public.create_order_with_payment(jsonb) from public;
grant execute on function public.create_order_with_payment(jsonb) to anon, authenticated;

-- Les anciennes commandes WhatsApp restent lisibles ; seules les commandes terminées
-- alimentent désormais le chiffre d'affaires.
create or replace function public.clear_admin_audit_logs()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Accès administrateur requis.'; end if;
  delete from public.admin_audit_logs;
end;
$$;
revoke all on function public.clear_admin_audit_logs() from public;
grant execute on function public.clear_admin_audit_logs() to authenticated;

create or replace function public.update_order_status_with_revenue(p_order_id uuid, p_status public.order_status)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare result public.orders;
begin
  if not public.is_admin() then raise exception 'Accès administrateur requis.'; end if;
  update public.orders
  set status = p_status,
      completed_at = case when p_status = 'delivered' then coalesce(completed_at, now()) else completed_at end,
      updated_at = now()
  where id = p_order_id
  returning * into result;
  if result.id is null then raise exception 'Commande introuvable.'; end if;
  return result;
end;
$$;
revoke all on function public.update_order_status_with_revenue(uuid, public.order_status) from public;
grant execute on function public.update_order_status_with_revenue(uuid, public.order_status) to authenticated;

-- Commandes : validation, recalcul des prix et limitation anti-spam côté base.
drop policy if exists "Customers can create orders" on public.orders;
drop policy if exists "Customers can create order items" on public.order_items;

create or replace function public.create_secure_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  customer jsonb := payload -> 'customer';
  items jsonb := payload -> 'items';
  item jsonb;
  product_row record;
  new_order public.orders%rowtype;
  clean_phone text;
  item_quantity integer;
  calculated_subtotal integer := 0;
  calculated_delivery integer := 0;
begin
  if customer is null or items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'Commande incomplète.';
  end if;

  clean_phone := regexp_replace(coalesce(customer ->> 'phone', ''), '[^0-9+]', '', 'g');
  if clean_phone !~ '^\+[0-9]{8,15}$' then
    raise exception 'Numéro de téléphone invalide.';
  end if;
  if char_length(trim(coalesce(customer ->> 'name', ''))) not between 2 and 120
    or char_length(trim(coalesce(customer ->> 'city', ''))) not between 2 and 100
    or char_length(trim(coalesce(customer ->> 'address', ''))) not between 2 and 300 then
    raise exception 'Informations de livraison invalides.';
  end if;
  if customer ->> 'delivery' not in ('Livraison à domicile', 'Retrait à l’atelier', 'Livraison internationale') then
    raise exception 'Mode de livraison invalide.';
  end if;
  if (select count(*) from public.orders where phone = clean_phone and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'Trop de commandes ont été envoyées. Réessayez dans quelques minutes.';
  end if;
  if jsonb_array_length(items) > 30 then
    raise exception 'La commande contient trop d’articles.';
  end if;

  for item in select * from jsonb_array_elements(items)
  loop
    item_quantity := coalesce((item ->> 'quantity')::integer, 0);
    if item_quantity not between 1 and 20 then
      raise exception 'Quantité invalide.';
    end if;
    select p.id, p.name, p.slug, p.price,
      (select pi.url from public.product_images pi where pi.product_id = p.id order by pi.sort_order limit 1) as image_url
    into product_row
    from public.products p
    where p.id = (item ->> 'product_id')::bigint and p.is_published = true;
    if not found then raise exception 'Un produit est indisponible.'; end if;
    calculated_subtotal := calculated_subtotal + product_row.price * item_quantity;
  end loop;

  if customer ->> 'delivery' <> 'Retrait à l’atelier' then
    select coalesce(delivery_fee, 0) into calculated_delivery from public.site_settings where id = true;
  end if;

  insert into public.orders (
    customer_name, phone, city, address, delivery_method, customer_comment,
    subtotal, delivery_fee, total, whatsapp_sent
  ) values (
    left(trim(customer ->> 'name'), 120), clean_phone, left(trim(customer ->> 'city'), 100),
    left(trim(customer ->> 'address'), 300), customer ->> 'delivery',
    nullif(left(trim(coalesce(customer ->> 'comment', '')), 1000), ''),
    calculated_subtotal, calculated_delivery, calculated_subtotal + calculated_delivery, true
  ) returning * into new_order;

  for item in select * from jsonb_array_elements(items)
  loop
    select p.id, p.name, p.slug, p.price,
      (select pi.url from public.product_images pi where pi.product_id = p.id order by pi.sort_order limit 1) as image_url
    into product_row from public.products p
    where p.id = (item ->> 'product_id')::bigint and p.is_published = true;
    item_quantity := (item ->> 'quantity')::integer;
    insert into public.order_items (
      order_id, product_id, product_name, product_slug, image_url, unit_price,
      quantity, size, color, measurements, note
    ) values (
      new_order.id, product_row.id, product_row.name, product_row.slug, product_row.image_url,
      product_row.price, item_quantity, nullif(left(item ->> 'size', 100), ''),
      nullif(left(item ->> 'color', 100), ''), nullif(left(item ->> 'measurements', 500), ''),
      nullif(left(item ->> 'note', 1000), '')
    );
  end loop;

  return jsonb_build_object(
    'id', new_order.id,
    'order_number', new_order.order_number,
    'subtotal', new_order.subtotal,
    'delivery_fee', new_order.delivery_fee,
    'total', new_order.total
  );
end;
$$;

revoke all on function public.create_secure_order(jsonb) from public;
grant execute on function public.create_secure_order(jsonb) to anon, authenticated;

-- Visites : l’écriture directe est remplacée par une fonction limitée.
create table if not exists public.page_visits (
  id bigint generated always as identity primary key,
  path text not null,
  session_id text not null,
  referrer text,
  visited_at timestamptz not null default now()
);
alter table public.page_visits enable row level security;
drop policy if exists "Anyone can record a visit" on public.page_visits;
drop policy if exists "Admins can read visits" on public.page_visits;
create policy "Admins can read visits" on public.page_visits
for select to authenticated using (public.is_admin());

create or replace function public.record_page_visit(p_path text, p_session_id text, p_referrer text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if char_length(p_path) not between 1 and 500 or char_length(p_session_id) not between 10 and 100 then
    raise exception 'Visite invalide.';
  end if;
  if (select count(*) from public.page_visits where session_id = p_session_id and visited_at > now() - interval '1 minute') >= 20 then
    return;
  end if;
  if exists (
    select 1 from public.page_visits
    where session_id = p_session_id and path = p_path and visited_at > now() - interval '30 seconds'
  ) then
    return;
  end if;
  insert into public.page_visits(path, session_id, referrer)
  values (left(p_path, 500), p_session_id, nullif(left(coalesce(p_referrer, ''), 1000), ''));
end;
$$;

revoke all on function public.record_page_visit(text, text, text) from public;
grant execute on function public.record_page_visit(text, text, text) to anon, authenticated;

-- Journal des actions sensibles réalisées dans l’administration.
create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  table_name text not null,
  record_id text,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  occurred_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;
drop policy if exists "Admins read audit logs" on public.admin_audit_logs;
create policy "Admins read audit logs" on public.admin_audit_logs
for select to authenticated using (public.is_admin());

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

do $$
declare
  target text;
begin
  foreach target in array array['products','categories','orders','gallery_items','testimonials','site_content','site_settings']
  loop
    execute format('drop trigger if exists audit_admin_changes on public.%I', target);
    execute format(
      'create trigger audit_admin_changes after insert or update or delete on public.%I for each row execute function public.log_admin_change()',
      target
    );
  end loop;
end $$;

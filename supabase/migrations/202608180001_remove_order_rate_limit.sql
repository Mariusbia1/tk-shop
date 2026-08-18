-- Suppression du blocage de taux de commandes par numéro de téléphone
-- pour permettre aux clients de passer commande autant de fois qu'ils le souhaitent.

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

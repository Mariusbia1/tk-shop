create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'customer');
create type public.order_status as enum ('new', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id bigint generated always as identity primary key,
  category_id bigint references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  price integer not null check (price >= 0),
  old_price integer check (old_price is null or old_price >= price),
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  stock_status text not null default 'Sur commande',
  featured boolean not null default false,
  new_product boolean not null default false,
  popular boolean not null default false,
  customizable boolean not null default false,
  production_time text,
  materials text,
  care_instructions text,
  delivery_information text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('TK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  delivery_method text not null,
  customer_comment text,
  subtotal integer not null check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total integer not null check (total >= 0),
  status public.order_status not null default 'new',
  whatsapp_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  product_name text not null,
  product_slug text,
  image_url text,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  size text,
  color text,
  measurements text,
  note text
);

create table public.gallery_items (
  id bigint generated always as identity primary key,
  title text not null,
  image_url text not null,
  category text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id bigint generated always as identity primary key,
  customer_name text not null,
  city text,
  content text not null,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id),
  shop_name text not null default 'TK SHOP',
  full_name text not null default 'Taye & Kinde Shop',
  whatsapp text,
  phone text,
  email text,
  address text,
  instagram text,
  facebook text,
  delivery_fee integer not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.touch_updated_at();
create trigger categories_updated_at before update on public.categories for each row execute procedure public.touch_updated_at();
create trigger products_updated_at before update on public.products for each row execute procedure public.touch_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute procedure public.touch_updated_at();
create trigger site_settings_updated_at before update on public.site_settings for each row execute procedure public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.gallery_items enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_content enable row level security;
alter table public.site_settings enable row level security;

create policy "Profiles can read themselves" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "Published categories are public" on public.categories for select using (is_active or public.is_admin());
create policy "Published products are public" on public.products for select using (is_published or public.is_admin());
create policy "Images of published products are public" on public.product_images for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.is_published or public.is_admin()))
);
create policy "Customers can create orders" on public.orders for insert to anon, authenticated with check (true);
create policy "Admins manage orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Customers can create order items" on public.order_items for insert to anon, authenticated with check (true);
create policy "Admins manage order items" on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Published gallery is public" on public.gallery_items for select using (is_published or public.is_admin());
create policy "Published testimonials are public" on public.testimonials for select using (is_published or public.is_admin());
create policy "Site content is public" on public.site_content for select using (true);
create policy "Site settings are public" on public.site_settings for select using (true);

create policy "Admins manage profiles" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage product images" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage gallery" on public.gallery_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage testimonials" on public.testimonials for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage site content" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage site settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do update set public = true;

create policy "Catalog images are public" on storage.objects for select using (bucket_id = 'catalog');
create policy "Admins upload catalog images" on storage.objects for insert to authenticated with check (bucket_id = 'catalog' and public.is_admin());
create policy "Admins update catalog images" on storage.objects for update to authenticated using (bucket_id = 'catalog' and public.is_admin());
create policy "Admins delete catalog images" on storage.objects for delete to authenticated using (bucket_id = 'catalog' and public.is_admin());

insert into public.categories (name, slug, sort_order) values
  ('Robes crochet', 'robes', 1),
  ('Ensembles crochet', 'ensembles', 2),
  ('Tops', 'tops', 3),
  ('Jupes', 'jupes', 4),
  ('Accessoires crochet', 'accessoires', 5),
  ('Sur mesure', 'sur-mesure', 6)
on conflict (slug) do nothing;

insert into public.site_settings (id, shop_name, full_name)
values (true, 'TK SHOP', 'Taye & Kinde Shop')
on conflict (id) do nothing;

-- Les catégories deviennent des filtres simples par public.
insert into public.categories (name, slug, sort_order, is_active)
values
  ('Femme', 'femme', 1, true),
  ('Homme', 'homme', 2, true),
  ('Enfant', 'enfant', 3, true)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order,
    is_active = true,
    image_url = null;

-- Les produits des anciennes catégories sont conservés et rangés dans Femme.
update public.products
set category_id = (select id from public.categories where slug = 'femme')
where category_id is null
   or category_id not in (
     select id from public.categories where slug in ('femme', 'homme', 'enfant')
   );

delete from public.categories
where slug not in ('femme', 'homme', 'enfant');

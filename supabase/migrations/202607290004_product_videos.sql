-- Permet de mélanger photos et vidéos dans les produits et la galerie.
alter table public.product_images
  add column if not exists media_type text not null default 'image'
  check (media_type in ('image', 'video'));

alter table public.gallery_items
  add column if not exists media_type text not null default 'image'
  check (media_type in ('image', 'video'));

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ]
where id = 'catalog';

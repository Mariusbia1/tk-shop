create table if not exists public.page_visits (
  id bigint generated always as identity primary key,
  path text not null,
  session_id text not null,
  referrer text,
  visited_at timestamptz not null default now()
);

create index if not exists page_visits_visited_at_idx on public.page_visits (visited_at desc);
create index if not exists page_visits_session_id_idx on public.page_visits (session_id);

alter table public.page_visits enable row level security;

drop policy if exists "Anyone can record a visit" on public.page_visits;
create policy "Anyone can record a visit"
on public.page_visits for insert to anon, authenticated
with check (char_length(path) <= 500 and char_length(session_id) <= 100);

drop policy if exists "Admins can read visits" on public.page_visits;
create policy "Admins can read visits"
on public.page_visits for select to authenticated
using (public.is_admin());

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end $$;

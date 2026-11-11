-- Run once in the Supabase SQL Editor for per-product SEO fields.
alter table public.products add column if not exists image_alt text not null default '';
alter table public.products add column if not exists gallery_alts text[] not null default '{}';
alter table public.products add column if not exists meta_title text not null default '';
alter table public.products add column if not exists meta_description text not null default '';

update public.products
set
  image_alt = case when image_alt = '' then subtitle else image_alt end,
  meta_title = case when meta_title = '' then name || ' | The Item Box' else meta_title end,
  meta_description = case when meta_description = '' then description else meta_description end;

-- The Item Box catalog + lightweight unauthenticated admin schema.
-- Run this whole file in the Supabase SQL Editor.

create table if not exists public.categories (
  id text primary key,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subcategories (
  id text primary key,
  category_id text not null references public.categories(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, name)
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null default 'Apparel',
  collection text not null,
  subtitle text not null,
  description text not null,
  price integer not null check (price >= 0),
  image text not null,
  image_alt text not null default '',
  gallery text[] not null default '{}',
  gallery_alts text[] not null default '{}',
  meta_title text not null default '',
  meta_description text not null default '',
  color text not null,
  fit text not null,
  tag text not null,
  sizes text[] not null default '{}'
);

alter table public.products add column if not exists category_id text references public.categories(id) on delete set null;
alter table public.products add column if not exists subcategory_id text references public.subcategories(id) on delete set null;
alter table public.products add column if not exists active boolean not null default true;
alter table public.products add column if not exists image_alt text not null default '';
alter table public.products add column if not exists gallery_alts text[] not null default '{}';
alter table public.products add column if not exists meta_title text not null default '';
alter table public.products add column if not exists meta_description text not null default '';
alter table public.products add column if not exists created_at timestamptz not null default now();
alter table public.products add column if not exists updated_at timestamptz not null default now();

create table if not exists public.homepage_product_placements (
  product_id text not null references public.products(id) on delete cascade,
  section text not null check (section in ('slider', 'reel', 'collection')),
  sort_order integer not null default 0,
  primary key (product_id, section)
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_subcategory_id_idx on public.products(subcategory_id);
create index if not exists homepage_placements_section_order_idx on public.homepage_product_placements(section, sort_order);

insert into public.categories (id, name, sort_order) values ('apparel', 'Apparel', 0)
on conflict (id) do update set name = excluded.name;

insert into public.subcategories (id, category_id, name, sort_order)
values ('apparel--graphic-tees', 'apparel', 'Graphic Tees', 0)
on conflict (id) do update set name = excluded.name, category_id = excluded.category_id;

insert into public.products
  (id, slug, name, category, category_id, subcategory_id, collection, subtitle, description, price, image, gallery, color, fit, tag, sizes, active)
values
  ('l-1', 'rockstar-logo-pink-tee', 'Rockstar Logo Pink Tee', 'Apparel', 'apparel', 'apparel--graphic-tees', 'Vice City Drop', 'Pink graphic T-shirt with a blue Rockstar logo', 'A bright pink everyday tee finished with the classic Rockstar mark in blue. Cut in a relaxed silhouette for an easy streetwear fit.', 2990, '/Products/L-1/main.png', array['/Products/L-1/main.png','/Products/L-1/IMG_6834.AVIF','/Products/L-1/IMG_6840%20(1).AVIF','/Products/L-1/transparent-image.png'], 'Rockstar pink', 'Relaxed', 'ROCKSTAR CLASSIC', array['S','M','L','XL'], true),
  ('l-2', 'greetings-from-vice-city-pink-tee', 'Greetings From Vice City Tee', 'Apparel', 'apparel', 'apparel--graphic-tees', 'Vice City Drop', 'Pink Vice City postcard graphic T-shirt', 'A postcard-inspired Vice City graphic on vivid pink cotton, bringing sun-soaked colour and playful game nostalgia to an easy daily tee.', 2990, '/Products/L-2/main.png', array['/Products/L-2/main.png','/Products/L-2/IMG_6838.AVIF','/Products/L-2/IMG_6840.AVIF'], 'Vice pink', 'Relaxed', 'POSTCARD EDIT', array['S','M','L','XL'], true),
  ('l-3', 'vice-city-mosaic-black-tee', 'Vice City Mosaic Black Tee', 'Apparel', 'apparel', 'apparel--graphic-tees', 'Vice City Drop', 'Black T-shirt with a colourful Vice City mosaic graphic', 'A black graphic tee featuring a stacked Vice City mosaic in sunset pink, blue and gold. A bold centre print with a clean streetwear silhouette.', 3290, '/Products/L-3/main.png', array['/Products/L-3/main.png','/Products/L-3/IMG_6828.AVIF','/Products/L-3/IMG_6829.AVIF','/Products/L-3/IMG_6830.AVIF'], 'Midnight black', 'Relaxed', 'NEON NIGHTS', array['S','M','L','XL'], true),
  ('l-4', 'vice-city-dino-white-tee', 'Vice City Dino White Tee', 'Apparel', 'apparel', 'apparel--graphic-tees', 'Vice City Drop', 'White T-shirt with a Vice City dinosaur graphic', 'A crisp white tee led by the collection''s sunglasses-wearing dinosaur artwork. Colourful, playful and easy to style year-round.', 3290, '/Products/L-4/main.png', array['/Products/L-4/main.png','/Products/L-4/IMG_6824.AVIF','/Products/L-4/IMG_6825.AVIF','/Products/L-4/IMG_6826.AVIF'], 'Optic white', 'Relaxed', 'DINO EDIT', array['S','M','L','XL'], true),
  ('l-5', 'vice-city-leonida-black-tee', 'Vice City Leonida Black Tee', 'Apparel', 'apparel', 'apparel--graphic-tees', 'Vice City Drop', 'Black Vice City Leonida graphic T-shirt', 'The full Leonida story rendered as a vibrant front graphic on deep black. Designed as the statement piece of the Vice City drop.', 3290, '/Products/L-5/main.png', array['/Products/L-5/main.png','/Products/L-5/IMG_6836.AVIF','/Products/L-5/WhatsApp%20Image%202026-10-17%20at%204.33.01%20PM%20(2).jpeg','/Products/L-5/WhatsApp%20Image%202026-10-17%20at%204.33.02%20PM%20(2).jpeg','/Products/L-5/WhatsApp%20Image%202026-10-17%20at%204.33.02%20PM.jpeg'], 'Midnight black', 'Relaxed', 'LEONIDA STORY', array['S','M','L','XL'], true)
on conflict (id) do nothing;

update public.products
set category_id = coalesce(category_id, 'apparel'), subcategory_id = coalesce(subcategory_id, 'apparel--graphic-tees')
where id in ('l-1', 'l-2', 'l-3', 'l-4', 'l-5');

update public.products
set
  image_alt = case when image_alt = '' then subtitle else image_alt end,
  meta_title = case when meta_title = '' then name || ' | The Item Box' else meta_title end,
  meta_description = case when meta_description = '' then description else meta_description end;

insert into public.homepage_product_placements (product_id, section, sort_order)
values
  ('l-1', 'slider', 0), ('l-2', 'slider', 1), ('l-3', 'slider', 2), ('l-4', 'slider', 3), ('l-5', 'slider', 4),
  ('l-3', 'reel', 0), ('l-1', 'reel', 1), ('l-4', 'reel', 2), ('l-2', 'reel', 3), ('l-5', 'reel', 4),
  ('l-2', 'collection', 0), ('l-3', 'collection', 1), ('l-4', 'collection', 2), ('l-5', 'collection', 3)
on conflict (product_id, section) do nothing;

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.homepage_product_placements enable row level security;

grant select, insert, update, delete on public.categories to anon, authenticated;
grant select, insert, update, delete on public.subcategories to anon, authenticated;
grant select, insert, update, delete on public.products to anon, authenticated;
grant select, insert, update, delete on public.homepage_product_placements to anon, authenticated;

drop policy if exists "Categories public access" on public.categories;
create policy "Categories public access" on public.categories for all to anon, authenticated using (true) with check (true);
drop policy if exists "Subcategories public access" on public.subcategories;
create policy "Subcategories public access" on public.subcategories for all to anon, authenticated using (true) with check (true);
drop policy if exists "Products are publicly readable" on public.products;
drop policy if exists "Products public access" on public.products;
create policy "Products public access" on public.products for all to anon, authenticated using (true) with check (true);
drop policy if exists "Homepage placements public access" on public.homepage_product_placements;
create policy "Homepage placements public access" on public.homepage_product_placements for all to anon, authenticated using (true) with check (true);

-- Important: these policies intentionally allow unauthenticated admin writes.
-- Replace them with authenticated admin-only policies before production launch.

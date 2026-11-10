# The Item Box

A Next.js storefront built around the supplied TIB mood board and product film. The palette is neon green (#B7FF00), charcoal (#0B0B0B), and white.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. On Windows PowerShell with restricted execution policies, use `npm.cmd run dev`.

```sh
npm run lint
npm run build
npm start
```

## Supabase

1. Copy `.env.example` to `.env.local` and add your Supabase project URL and **publishable** key from Project Settings → API Keys. Never use a `service_role` key in this app.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql) to create the catalog, categories, subcategories, and homepage placement tables.
3. Restart the dev server and open `http://localhost:3000/api/db-check`. A successful connection returns `{"status":"connected"}`.

The storefront falls back to the sample catalog in `app/products.ts` if the database has not been migrated or is temporarily unavailable.

## Admin panel

Open `http://localhost:3000/admin` to manage products, categories, subcategories, and the three homepage product placements: moving slider, 3D rotation, and featured grid. Product changes invalidate the storefront automatically.

The current admin panel intentionally has no authentication. The development policies in `supabase/schema.sql` allow anonymous catalog writes so the panel works with the publishable Supabase key. Do not expose this setup publicly; add admin authentication and replace the anonymous write policies before production.

For image uploads, add the server-only Cloudinary values from `.env.example`. Admin uploads are stored under `mustafa-zahid/tib/products`. The API secret must never use a `NEXT_PUBLIC_` prefix.

## Experience

- Full-viewport pinned film, scrubbed forwards and backwards with natural scrolling.
- Four small product cards that enter and exit on either side of the film.
- Play/pause, keyboard-accessible timeline, chapter navigation, and browser fullscreen.
- Responsive collection, category filters, searchable products, product dialogs, size selection, and a persistent local shopping bag.
- Reduced-motion mode removes the long pinned section and automatic animation.

## Content

`app/products.ts` contains the sample products, descriptions, prices in PKR, categories, and images. These are demonstration products; checkout and order processing are not connected.

The active video is `public/download.mp4`. The experience starts at 0 seconds and shows the entire video with `object-fit: contain`, preserving the original framing and colors. Its opening frame is saved as `public/images/download-poster.jpg`. Large text overlays have been removed so the film remains visible throughout the scroll.

Sample product photos are locally stored in `public/images/` and sourced from Unsplash:
- Headphones: photo-1546435770-a3e426bf472b
- Eyewear: photo-1511499767150-a48a237f0083
- T-shirt: photo-1521572163474-6864f9cf17ab
- Watch: photo-1523275335684-37898b6baf30

Brand artwork is a lightweight SVG interpretation of the supplied logo. The theme and responsive layouts are in `app/storefront.css`. No animation dependencies are required.
"# theitembox" 

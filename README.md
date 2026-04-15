# Style Eternal

Premium fashion e-commerce — React 19 + Vite + Tailwind CSS.

---

## Style Eternal implementation notes

### Custom Atelier photo uploads (private)

Custom Atelier reference images are uploaded via **server-generated signed upload URLs** so the Storage bucket can remain **private** (no public uploads, no public reads).

Setup:
1. In Supabase Storage, create a **private** bucket named `atelier-uploads`.
2. Set `SUPABASE_ATELIER_BUCKET=atelier-uploads` in your server env (see `.env.example`).

Notes:
* Uploads require the user to be signed in (authenticated) in order to request signed upload URLs.
* Concierge emails include **secure links** to the uploaded reference images (links expire after a set time).

### Product image convention

You can keep using an explicit `images: []` array per product, **or** adopt a single folder convention:

* Folder: `public/assets/products/<productSlug>/`
* Images: `01.webp`, `02.webp`, `03.webp`...
* Optional: `video.mp4`

This is implemented via `src/utils/productMedia.js` and used across Shop, PDP, Quick View, and cart.

### Ready to Ship filter + badge

Set `readyToShip: true` on any product in `src/data/products.js` to:
* show a **Ready to Ship** badge on cards and PDP
* enable the **Ready to Ship** collection filter in Shop (no stock counts shown)

### Partner pricing preview

Approved partners see a lightweight pricing preview in the account dashboard so they don't have to hunt for the portal link.

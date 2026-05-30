# Style Eternal — Brand Asset System

> Premium streetwear. Style that outlives trends.

---

## 1. Primary Wordmark

The Style Eternal wordmark uses **Oswald** (display weight) in uppercase with wide tracking. It is the brand's primary typographic identity across all touchpoints.

### Files

| File | Description |
|------|-------------|
| `public/brand/wordmark.svg` | Primary wordmark — bone (#E8E4DE) on transparent (for dark backgrounds) |
| `public/brand/wordmark-dark.svg` | Inverse wordmark — black (#0A0A0A) on transparent (for light backgrounds) |
| `public/brand/wordmark-compact.svg` | Compact horizontal — smaller format for tight spaces |

### Usage Rules

- **Always** render in uppercase: `STYLE ETERNAL`
- **Minimum clear space**: 1× the cap height of the letters on all sides
- **Primary use**: dark backgrounds with bone/cream wordmark
- **Do not** distort, rotate, add effects, or change the letter-spacing
- **Do not** use on busy or mid-tone backgrounds that reduce contrast

---

## 2. SE Monogram / House Mark

The SE monogram is a compact identity mark enclosed in a thin rectangular border. It functions as the brand's secondary mark for small-format applications.

### Files

| File | Description |
|------|-------------|
| `public/brand/monogram.svg` | Standard monogram — bone on transparent |
| `public/brand/monogram-dark.svg` | Dark variant — black on transparent |
| `public/brand/monogram-micro.svg` | Micro version — no external font dependency, favicon-safe |

### Usage Rules

- Use on: favicons, browser tabs, footer marks, account icons, garment labels, packaging stamps
- **Minimum size**: 16×16px (micro variant required below 32px)
- The border frame is part of the mark — do not remove it
- **Do not** use the full wordmark where the monogram is more appropriate (e.g., tab icons)

---

## 3. Favicon / App Icon System

### Files

| File | Size | Usage |
|------|------|-------|
| `public/favicon.svg` | scalable | Modern browsers — primary favicon |
| `public/favicon-16x16.png` | 16×16 | Legacy browsers |
| `public/favicon-32x32.png` | 32×32 | Browser tabs |
| `public/apple-touch-icon.png` | 180×180 | iOS home screen |
| `public/icon-192x192.png` | 192×192 | Android / PWA |
| `public/icon-512x512.png` | 512×512 | PWA splash / store listing |
| `public/site.webmanifest` | — | PWA manifest linking all icons |

### Integration

All favicons are referenced in `index.html`:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

### Design

- Dark background (#0A0A0A) with SE monogram in bone (#E8E4DE)
- Thin border frame for structure at small sizes
- System-safe fallback fonts (no external font dependency in rasterized PNGs)

---

## 4. Social / OG Banner

| File | Size | Usage |
|------|------|-------|
| `public/assets/se_og_banner.png` | 1200×630 | Open Graph / Twitter Card / social previews |

Referenced by `src/components/SEO.jsx` as the default social share image.

---

## 5. Placeholder System

Premium dark editorial placeholders for unreleased content. All placeholders use the brand's dark palette with subtle haze gradients and thin border frames.

### Product Placeholders

| File | Size | Use Case |
|------|------|----------|
| `public/assets/placeholders/coming-soon-product.svg` | 600×800 | Products with `releaseStatus: "coming-soon"` |
| `public/assets/placeholders/coming-soon-product.png` | 600×800 | PNG fallback |
| `public/assets/placeholders/product-fallback.svg` | 600×800 | Missing product photography |
| `public/assets/placeholders/product-fallback.png` | 600×800 | PNG fallback |

### Collection Banners

| File | Size | Collection |
|------|------|------------|
| `public/assets/placeholders/collection-love-never-dies.*` | 1440×600 | Drop 01 — Love Never Dies |
| `public/assets/placeholders/collection-eternal-flame.*` | 1440×600 | Drop 02 — Eternal Flame |
| `public/assets/placeholders/collection-eternal-love.*` | 1440×600 | Drop 03 — Eternal Love |
| `public/assets/placeholders/collection-utility-capsule.*` | 1440×600 | Utility / Nylon Capsule |
| `public/assets/placeholders/collection-essentials.*` | 1440×600 | Essentials |
| `public/assets/placeholders/collection-archive.*` | 1440×600 | Archive |

### Rewards / Account

| File | Size | Use Case |
|------|------|----------|
| `public/assets/placeholders/rewards-hero.*` | 600×400 | Rewards page hero |

All placeholders are available in both `.svg` (scalable) and `.png` (rasterized) formats.

---

## 6. Campaign / Editorial Placeholders

For editorial pages, lookbooks, and campaign content that does not yet have final photography.

| File | Description |
|------|-------------|
| `public/assets/campaign/campaign-ss26.*` | SS26 campaign hero |
| `public/assets/campaign/lookbook-placeholder.*` | Generic lookbook placeholder |
| `public/assets/editorial/campaign-ss26.*` | Editorial — campaign entry |
| `public/assets/editorial/lookbook-iron-bound.*` | Editorial — Iron Bound lookbook |
| `public/assets/editorial/journal-newark.*` | Editorial — Newark journal |
| `public/assets/editorial/journal-legacy.*` | Editorial — Legacy journal |

---

## 7. Drop Teaser Assets

For homepage feature blocks, social previews, and pre-launch teaser content.

| File | Format | Use Case |
|------|--------|----------|
| `public/assets/drop-teasers/drop-01-card.*` | 800×800 | Grid card / social square |
| `public/assets/drop-teasers/drop-01-banner.*` | 1440×500 | Homepage banner |
| `public/assets/drop-teasers/drop-02-card.*` | 800×800 | Grid card / social square |
| `public/assets/drop-teasers/drop-02-banner.*` | 1440×500 | Homepage banner |
| `public/assets/drop-teasers/drop-03-card.*` | 800×800 | Grid card / social square |
| `public/assets/drop-teasers/drop-03-banner.*` | 1440×500 | Homepage banner |

---

## 8. Collection Hero Images

Previously missing images now provided as dark editorial placeholders.

| File | Referenced By |
|------|---------------|
| `public/assets/collections/north-ward-hero.png` | `src/pages/Drops.jsx` |
| `public/assets/collections/iron-bound-hero.png` | `src/pages/Drops.jsx` |
| `public/assets/collections/legacy-hero.png` | `src/pages/Drops.jsx` |

---

## 9. Background & Scaling Rules

### Approved Backgrounds

| Background | Wordmark Variant | Monogram Variant |
|------------|-----------------|------------------|
| Black / dark (#0A0A0A–#1A1A1A) | `wordmark.svg` (bone) | `monogram.svg` (bone) |
| Bone / cream (#E8E4DE–#F5F2EC) | `wordmark-dark.svg` (black) | `monogram-dark.svg` (black) |
| Muted metallic / chrome | `wordmark.svg` (bone) | `monogram.svg` (bone) |

### Scaling

- **Wordmark minimum width**: 120px
- **Monogram minimum size**: 16×16px (use micro variant below 32px)
- **Favicon**: do not scale below native sizes

---

## 10. Do / Do Not

### ✅ Do

- Use the bone wordmark on dark backgrounds
- Use the dark wordmark on bone/cream backgrounds
- Maintain clear space around all brand marks
- Use the monogram for small-format applications
- Use the premium dark placeholders for missing content
- Keep the SE monogram framed (border is part of the mark)

### ❌ Do Not

- Place the wordmark on busy, patterned, or mid-tone backgrounds
- Distort, skew, or add drop shadows to the wordmark
- Use the full wordmark at favicon size
- Remove the border frame from the monogram
- Use light/beige placeholders — all placeholders must be dark editorial
- Mix wordmark variants (e.g., bone text on bone background)
- Add extra branding elements (taglines, icons) inside the clear space

---

## 11. File Locations Summary

```
public/
├── brand/
│   ├── wordmark.svg              # Primary wordmark (bone)
│   ├── wordmark-dark.svg         # Inverse wordmark (black)
│   ├── wordmark-compact.svg      # Compact horizontal
│   ├── monogram.svg              # SE monogram (bone)
│   ├── monogram-dark.svg         # SE monogram (black)
│   └── monogram-micro.svg        # Favicon-safe micro monogram
├── favicon.svg                   # SVG favicon
├── favicon-16x16.png             # 16px favicon
├── favicon-32x32.png             # 32px favicon
├── apple-touch-icon.png          # iOS icon (180px)
├── icon-192x192.png              # Android / PWA (192px)
├── icon-512x512.png              # PWA splash (512px)
├── site.webmanifest              # PWA manifest
└── assets/
    ├── se_og_banner.png          # Social share banner (1200×630)
    ├── placeholders/             # Product + collection placeholders
    ├── campaign/                 # Campaign assets
    ├── drop-teasers/             # Drop teaser cards + banners
    ├── collections/              # Collection hero images
    └── editorial/                # Editorial placeholders
```

---

*Last updated: April 2026*
*Style Eternal — Born in Newark. Built to last.*

/**
 * scripts/optimize-media.mjs
 *
 * Image pipeline for public/assets:
 *  - For every .jpg/.jpeg/.png ≥ 30KB, emit WebP siblings:
 *      <name>.webp        (full size, capped at 1600px wide)
 *      <name>-800.webp    (≤800px wide)
 *      <name>-400.webp    (≤400px wide)
 *    Originals are kept untouched as <picture> fallbacks.
 *  - Incremental: existing up-to-date outputs are skipped.
 *  - Writes src/data/mediaManifest.json mapping each original public path to
 *    its available WebP widths. SmartImage and productMedia.js consume it.
 *
 * Video: transcoding needs a full ffmpeg build (this environment's binary
 * lacks an H.264 decoder). The hero video ships with a poster generated here
 * from its companion editorial frame; see RUNBOOK.md for the one-time
 * compress-and-replace instruction.
 *
 * Usage: npm run media:optimize
 */
import { readdirSync, statSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, extname, dirname, basename, sep } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const ASSETS_DIR = join(ROOT, "public", "assets");
const MANIFEST_PATH = join(ROOT, "src", "data", "mediaManifest.json");

const MIN_SOURCE_BYTES = 30 * 1024;
const WIDTHS = [1600, 800, 400];
const WEBP_QUALITY = 80;

// Poster for the hero video, generated from the editorial hero frame.
const HERO_POSTER_SOURCE = join(ASSETS_DIR, "editorial", "hero-cityscape.jpg");
const HERO_POSTER_OUT = join(ASSETS_DIR, "video", "brand-promo-poster.webp");

const isVariant = (name) => /-(?:800|400)\.webp$/i.test(name);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else yield { full, size: st.size, mtime: st.mtimeMs };
  }
}

function publicPath(absolute) {
  return "/" + relative(join(ROOT, "public"), absolute).split(sep).join("/");
}

function outputPaths(source) {
  const dir = dirname(source);
  const base = basename(source, extname(source));
  return {
    full: join(dir, `${base}.webp`),
    w800: join(dir, `${base}-800.webp`),
    w400: join(dir, `${base}-400.webp`),
  };
}

async function emitWebp(source, dest, width) {
  if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(source).mtimeMs) {
    return false; // up to date
  }
  await sharp(source)
    .rotate() // respect EXIF orientation
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(dest);
  return true;
}

async function main() {
  if (!existsSync(ASSETS_DIR)) {
    console.error(`No assets directory at ${ASSETS_DIR}`);
    process.exit(1);
  }

  const manifest = {};
  let generated = 0;
  let skipped = 0;
  let sourceBytes = 0;
  let webpBytes = 0;

  for (const { full, size } of walk(ASSETS_DIR)) {
    const ext = extname(full).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;
    if (isVariant(basename(full))) continue;
    if (size < MIN_SOURCE_BYTES) continue;

    const outs = outputPaths(full);
    const meta = await sharp(full).metadata();
    const widths = [];

    for (const [key, width] of [
      ["full", WIDTHS[0]],
      ["w800", WIDTHS[1]],
      ["w400", WIDTHS[2]],
    ]) {
      // Skip variants that would upscale a smaller source (full always emits).
      if (key !== "full" && meta.width && meta.width < width) continue;
      const wrote = await emitWebp(full, outs[key], width);
      wrote ? generated++ : skipped++;
      widths.push(Math.min(width, meta.width || width));
      if (key === "full") {
        sourceBytes += size;
        webpBytes += statSync(outs.full).size;
      }
    }

    manifest[publicPath(full)] = {
      webp: publicPath(outs.full),
      widths: [...new Set(widths)].sort((a, b) => b - a),
      width: meta.width || null,
      height: meta.height || null,
    };
  }

  // Hero video poster (from the editorial frame — the mp4 itself can't be
  // decoded by this environment's ffmpeg build).
  if (existsSync(HERO_POSTER_SOURCE)) {
    mkdirSync(dirname(HERO_POSTER_OUT), { recursive: true });
    if (!existsSync(HERO_POSTER_OUT)) {
      await sharp(HERO_POSTER_SOURCE)
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 72 })
        .toFile(HERO_POSTER_OUT);
      console.log(`[media] wrote hero poster ${publicPath(HERO_POSTER_OUT)}`);
    }
  }

  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  const mb = (n) => (n / (1024 * 1024)).toFixed(1);
  console.log(
    `[media] ${Object.keys(manifest).length} sources → ${generated} outputs written, ${skipped} up-to-date`
  );
  console.log(
    `[media] full-size webp total ${mb(webpBytes)}MB vs original ${mb(sourceBytes)}MB (${Math.round(
      (1 - webpBytes / Math.max(1, sourceBytes)) * 100
    )}% smaller)`
  );
  console.log(`[media] manifest → ${relative(ROOT, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

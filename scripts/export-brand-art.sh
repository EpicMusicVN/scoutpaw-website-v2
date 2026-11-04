#!/usr/bin/env bash
# Export the web-sized 2D brand art from the original design pack.
#
# The originals (≈17 MB of 1500x2100 / 2754x1536 PNGs) are NOT committed. This
# script turns them into the files the site actually renders, at the sizes it
# renders them, so the repo only carries web-weight exports:
#
#   public/assets/brand/characters/<slug>-stand.webp  1050x1400, every pup trimmed
#       and fitted to the same portrait canvas (bottom-aligned, centred) so each
#       one reads at the same apparent size wherever a pose is shown.
#   public/assets/brand/logo/scoutpaw-logo-pups.webp  Buddy + Max + wordmark (nav).
#   public/assets/brand/logo/scoutpaw-wordmark.webp   flat wordmark (footer, menu).
#   public/assets/brand/scene/pack-scene.webp         hills scene without the
#       wordmark (hero + video fallbacks). The two source scenes differ only in
#       where the wordmark sits, so the bottom-left patch of the banner variant
#       (which is clean there) is pasted over the website variant's wordmark.
#   public/assets/brand/scene/pack-scene-og.jpg       1200x630 share card.
#   public/assets/brand/props/<prop>.webp             400x400 menu-card icons.
#   public/assets/brand/icons/app-icon-512.png        PWA manifest icon.
#   app/(frontend)/icon1.png, icon2.png, apple-icon.png  favicons (Buddy).
#
# Usage: scripts/export-brand-art.sh "/path/to/app elements"
# Requires ImageMagick 7 (`magick`). Re-runnable: outputs are overwritten.

set -euo pipefail

SRC="${1:-}"
if [[ -z "$SRC" || ! -d "$SRC" ]]; then
  echo "usage: $0 <brand-art-source-dir>" >&2
  exit 1
fi
command -v magick >/dev/null || { echo "ImageMagick 7 (magick) is required" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/assets/brand"
ICONS="$ROOT/app/(frontend)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

require() {
  [[ -f "$SRC/$1" ]] || { echo "missing source file: $SRC/$1" >&2; exit 1; }
}

mkdir -p "$OUT/characters" "$OUT/logo" "$OUT/scene" "$OUT/props" "$OUT/icons"

# Characters — slug:source-name pairs (Bella's stand is named after her, her
# avatar after the breed; only the stand is exported here).
for pair in max:max rocky:rocky oscar:oscar buddy:buddy bella:bella; do
  slug="${pair%%:*}"
  name="${pair##*:}"
  require "$name app stand.png"
  magick "$SRC/$name app stand.png" -fuzz 2% -trim +repage \
    -resize 1010x1372 -background none \
    -gravity south -extent 1050x1386 \
    -gravity north -extent 1050x1400 \
    -quality 86 -define webp:method=6 \
    "$OUT/characters/$slug-stand.webp"
done

# Logos.
require "scoutpaw_website_logo.png"
magick "$SRC/scoutpaw_website_logo.png" -fuzz 2% -trim +repage -resize x240 \
  -quality 90 -define webp:method=6 "$OUT/logo/scoutpaw-logo-pups.webp"
require "scoutpaw_logo.png"
magick "$SRC/scoutpaw_logo.png" -fuzz 2% -trim +repage -resize x160 \
  -quality 92 -define webp:method=6 "$OUT/logo/scoutpaw-wordmark.webp"

# Scenes.
require "Background_website.png"
require "scoutpaw_tv_banner.png"
magick "$SRC/Background_website.png" \
  \( "$SRC/scoutpaw_tv_banner.png" -crop 1010x185+30+1215 +repage \) \
  -geometry +30+1215 -composite -alpha off "$TMP/scene-clean.png"
magick "$TMP/scene-clean.png" -resize 2400x -quality 80 -define webp:method=6 \
  "$OUT/scene/pack-scene.webp"
magick "$SRC/scoutpaw_tv_banner.png" -alpha off -resize 1200x \
  -gravity center -crop 1200x630+0+0 +repage -quality 84 -strip \
  "$OUT/scene/pack-scene-og.jpg"

# Props used as menu-card icons.
for prop in compass hat camera; do
  require "$prop.png"
  magick "$SRC/$prop.png" -fuzz 2% -trim +repage -resize 380x380 \
    -background none -gravity center -extent 400x400 \
    -quality 88 -define webp:method=6 "$OUT/props/$prop.webp"
done

# Icons — Buddy's avatar. Square + opaque for the manifest and Apple touch icon
# (iOS rounds corners itself and renders transparency as black); circle-masked
# for browser favicons.
require "buddy ava app.png"
magick "$SRC/buddy ava app.png" -alpha off -resize 512x512 -strip \
  "$OUT/icons/app-icon-512.png"
magick "$SRC/buddy ava app.png" -alpha off -resize 180x180 -strip \
  "$ICONS/apple-icon.png"
magick "$SRC/buddy ava app.png" -alpha off -resize 512x512 \
  \( -size 512x512 xc:black -fill white -draw "circle 255.5,255.5 255.5,2" \) \
  -alpha off -compose CopyOpacity -composite "$TMP/icon-circle.png"
magick "$TMP/icon-circle.png" -resize 192x192 -strip "$ICONS/icon2.png"
magick "$TMP/icon-circle.png" -resize 64x64 -strip "$ICONS/icon1.png"

echo "Exported brand art to $OUT and favicons to $ICONS"

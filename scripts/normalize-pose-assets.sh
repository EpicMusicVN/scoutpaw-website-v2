#!/usr/bin/env bash
# Normalize the 13 character pose PNGs.
#
# WHY: source poses are 1280x720 LANDSCAPE canvases where the character fills
# only ~38%x82% of the frame, off-center, with ~1.4x size variance between
# poses. Fed through <Image object-contain> into a portrait carousel card, the
# character can only ever render small + inconsistent. This script trims each
# pose to its opaque bounding box and re-pads it onto a uniform 900x1200
# portrait canvas (character bottom-aligned, centered, ~92% canvas height) so
# every pup reads at the same apparent size.
#
# Idempotency: run ONCE. To re-run, restore originals first:
#   git checkout public/assets/characters-position/
#
# Requires ImageMagick v7 (`magick`).

set -euo pipefail

DIR="public/assets/characters-position"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# The 13 pose files (from content/characters.json).
FILES=(
  husky1.png husky2.png husky3.png
  golden1.png golden2.png golden3.png
  collie1.png collie2.png
  corgi1.png corgi2.png corgi3.png
  poodle1.png poodle2.png
)

echo "Normalizing ${#FILES[@]} pose assets -> 900x1200 portrait..."
for f in "${FILES[@]}"; do
  src="$DIR/$f"
  if [[ ! -f "$src" ]]; then
    echo "  SKIP  $f (not found)"
    continue
  fi
  before=$(magick identify -format '%wx%h' "$src")
  # -trim +repage : strip transparent border, reset virtual canvas (mandatory).
  # -resize 900x1104 : fit within box, aspect preserved (height-priority).
  # -gravity south -extent 900x1200 : bottom-center on a transparent canvas.
  magick "$src" -trim +repage -resize 900x1104 \
    -background none -gravity south -extent 900x1200 "$TMP/$f"
  mv -f "$TMP/$f" "$src"
  after=$(magick identify -format '%wx%h' "$src")
  echo "  OK    $f  $before -> $after"
done

echo "Done. All poses normalized to 900x1200."

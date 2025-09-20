#!/bin/zsh
set -euo pipefail

IN="hero.png"          # zmień na swoją nazwę
BASENAME="hero"
WIDTHS=(400 600 800 1000 1400)


# WebP (cwebp daje bardzo dobrą kontrolę jakości)
for w in ${WIDTHS[@]}; do
  magick "$IN" -resize ${w} -strip png:- | cwebp -q 82 -o "static/${BASENAME}-w${w}.webp" -- -
done

# AVIF (avifenc z libavif)
for w in ${WIDTHS[@]}; do
  TMP="$(mktemp).png"
  magick "$IN" -resize ${w} -strip "$TMP"
  avifenc -q 45 -s 6 --jobs all "$TMP" "static/${BASENAME}-w${w}.avif"
  rm -f "$TMP"
done

echo "Gotowe: static/${BASENAME}-w{400,600,800,1000,1400}.{png,webp,avif}"

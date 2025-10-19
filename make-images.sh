#!/usr/bin/env bash
set -euo pipefail

# Użycie: ./make-images.sh about-bg.png
SRC="$1"
NAME="${SRC%.*}"              # about-bg
EXT="${SRC##*.}"              # png/jpg
OUT="out"
SIZES=(800 1440 2000)

mkdir -p "$OUT"

# 1) pliki pośrednie JPG (dobry wsad pod enkodery)
for W in "${SIZES[@]}"; do
  magick "$SRC" -strip -resize "${W}" -sampling-factor 4:2:0 -quality 90 \
    "$OUT/${NAME}-${W}.jpg"
done

# 2) AVIF (avifenc 1.3.0: używamy -q i -s)
for W in "${SIZES[@]}"; do
  avifenc -q 55 -s 6 --yuv 420 --sharpyuv \
    "$OUT/${NAME}-${W}.jpg" "$OUT/${NAME}-${W}.avif"
done

# 3) WebP fallback
for W in "${SIZES[@]}"; do
  cwebp -q 82 -m 4 "$OUT/${NAME}-${W}.jpg" -o "$OUT/${NAME}-${W}.webp"
done

echo "Gotowe: $OUT (AVIF + WebP). JPG to tylko wsad/preview."

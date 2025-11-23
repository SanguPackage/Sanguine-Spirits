#!/bin/sh
# Resize all PNG images to 700x700 if they aren't already

for file in *.png; do
  if [ -f "$file" ]; then
    dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
    if [ "$dimensions" != "700x700" ]; then
      echo "Resizing: $file (current: $dimensions)"
      convert "$file" -resize 700x700 -quality 95 "$file" 2>/dev/null
    else
      echo "Skipping: $file (already 700x700)"
    fi
  fi
done
echo "Done!"

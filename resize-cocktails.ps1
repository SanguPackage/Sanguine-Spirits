docker run --rm -v "$PWD/assets/cocktails:/imgs" `
  -w /imgs acleancoder/imagemagick-full:latest sh resize.sh

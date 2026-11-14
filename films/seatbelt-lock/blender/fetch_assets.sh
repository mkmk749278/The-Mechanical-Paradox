#!/usr/bin/env bash
# Film 3 CC0 assets from Poly Haven (https://polyhaven.com/license: CC0), pinned by sha256. Fetched into films/seatbelt-lock/assets/cc0/
# (gitignored) by the session and by blender-render.yml before a render. Usage: films/seatbelt-lock/blender/fetch_assets.sh
set -euo pipefail
D="$(cd "$(dirname "$0")/.." && pwd)/assets/cc0"; mkdir -p "$D"
B=https://dl.polyhaven.org/file/ph-assets
while read -r sum path; do f="$D/$(basename "$path")"
  for i in 1 2 3 4; do [ -s "$f" ] && echo "$sum  $f" | sha256sum -c --quiet - && break; curl -sSfL -m 300 -o "$f" "$B/$path" || sleep $((i * 10)); done
  echo "$sum  $f" | sha256sum -c --quiet -
done <<EOF
30ed60b6866cbaafd9e0ec53acff75712f73a7eeae625e4c319991f5cc1e985f HDRIs/hdr/2k/autumn_road_2k.hdr
23729f197c28961de6eb92bab5fe335cb6477d6c9b36d1d66f25cbcb83ae359d Textures/jpg/1k/jersey_melange/jersey_melange_diff_1k.jpg
395bff8325243664cee0356265e7c2d29fddf767834d0d37959032f9b8b9b008 Textures/jpg/1k/jersey_melange/jersey_melange_nor_gl_1k.jpg
c061bb17387609fff0d5d80be967204aaa0fe5239457ab07800cd49f851399ea Textures/jpg/1k/jersey_melange/jersey_melange_rough_1k.jpg
97ba9480c7619efc9b8c08202c3e3773d1dd532dacce4dfe97f86e95339cf132 Textures/jpg/1k/fabric_leather_02/fabric_leather_02_diff_1k.jpg
2652ece55bd2780be1e16fb5ebc4171b139da45bcf9839a161b9ae236534e471 Textures/jpg/1k/fabric_leather_02/fabric_leather_02_nor_gl_1k.jpg
bce3c63ead508ffa0c110c176fdd94e5dbf57b51efdbc6781026a21e217b0edd Textures/jpg/1k/fabric_leather_02/fabric_leather_02_rough_1k.jpg
EOF

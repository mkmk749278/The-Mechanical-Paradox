#!/usr/bin/env bash
# Pull tracks from this channel's music library in Google Drive (Music-Library/blueprint/) into a film's assets.
# The library is the channel's own Lyria 3.5 music (config/music_library.csv, PLAYBOOK §12.1).
#
# Usage: scripts/music_pull.sh DEST [ID ...]
#   scripts/music_pull.sh films/train-wheels/assets/music bp01_curious_pulse bp03_low_tension
#   With no IDs the whole palette is copied. Files already in DEST are skipped. Every track is a 48 kHz stereo WAV
#   with a JSON sidecar (prompt, listening check, loudness); config/music_library.csv lists what each one is for.
# To add a track: add it to config/music_library.json, run scripts/lyria_music.py generate, check it, then
#   scripts/music_pull.sh --push DIR  (uploads DIR/blueprint/*.wav and *.json to the library) and update the CSV
#   with scripts/lyria_music.py catalog.
# Needs GDRIVE_RCLONE_TOKEN, exactly like scripts/upload_gdrive.sh; rclone is a pinned binary fetched into .cache/.
set -euo pipefail
RCLONE_VER=v1.71.1
ROOT=$(cd "$(dirname "$0")/.." && pwd)
CACHE="$ROOT/.cache/rclone"
FOLDER_ID=${MUSIC_FOLDER_ID:-1vVVLYt9fWexJCzaLImr-bQyU7F8ei8En}   # Music-Library/blueprint, created 2026-11-04
[[ $# -ge 1 ]] || { sed -n 2,14p "$0"; exit 2; }
[[ -n ${GDRIVE_RCLONE_TOKEN:-} ]] || { echo "GDRIVE_RCLONE_TOKEN is not set (see PLAYBOOK §1, Google Drive setup)" >&2; exit 3; }
RCLONE="$CACHE/rclone-$RCLONE_VER-linux-amd64/rclone"
if [[ ! -x $RCLONE ]]; then
  mkdir -p "$CACHE"
  curl -fsSL -m 300 -o "$CACHE/rclone.zip" "https://downloads.rclone.org/$RCLONE_VER/rclone-$RCLONE_VER-linux-amd64.zip" \
    || curl -fsSL -m 300 -o "$CACHE/rclone.zip" "https://github.com/rclone/rclone/releases/download/$RCLONE_VER/rclone-$RCLONE_VER-linux-amd64.zip"
  (cd "$CACHE" && unzip -q -o rclone.zip && rm rclone.zip)
fi
# Same token repair as upload_gdrive.sh: the Claude app's environment field strips parts of the JSON.
TOKEN=$(python3 - <<'EOF'
import json, os, re
t = os.environ["GDRIVE_RCLONE_TOKEN"].strip()
try:
    json.loads(t); print(t)
except ValueError:
    rt = re.search(r'refresh_token"?\s*:\s*"?([^",}\s]+)', t)
    at = re.match(r'[{\s"]*(?:access_token"?\s*:\s*"?)?(ya29[^",}\s]*)', t)
    if not rt:
        raise SystemExit("GDRIVE_RCLONE_TOKEN has no refresh_token; run rclone authorize again")
    print(json.dumps({"access_token": at.group(1) if at else "", "token_type": "Bearer",
                      "refresh_token": rt.group(1), "expiry": "2000-01-01T00:00:00Z"}))
EOF
)
export RCLONE_CONFIG_GD_TYPE=drive RCLONE_CONFIG_GD_SCOPE=drive RCLONE_CONFIG_GD_TOKEN="$TOKEN"
export RCLONE_CONFIG_GD_ROOT_FOLDER_ID="$FOLDER_ID" RCLONE_CONFIG=/dev/null
if [[ $1 == --push ]]; then
  SRC="${2:?folder made by lyria_music.py generate}/blueprint"
  "$RCLONE" copy --include '*.wav' --include '*.json' --exclude '_rejected_*' --exclude '.*' --transfers 4 --retries 4 "$SRC" gd: >&2
  echo "pushed $(ls "$SRC"/*.wav | wc -l) tracks to Music-Library/blueprint"
  exit 0
fi
DEST=$1; shift
mkdir -p "$DEST"
if [[ $# -eq 0 ]]; then
  "$RCLONE" copy --transfers 4 --retries 4 gd: "$DEST" >&2
else
  for id in "$@"; do "$RCLONE" copy --retries 4 --include "$id.wav" --include "$id.json" gd: "$DEST" >&2; done
fi
ls -1 "$DEST"/*.wav 2>/dev/null | sed 's#^#  #'

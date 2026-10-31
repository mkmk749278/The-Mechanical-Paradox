#!/usr/bin/env bash
# Upload files to the owner's Google Drive "The-Mechanical-Paradox" folder and print a view link for each.
# Ported from Built-on-Bharat (2026-10-31; originally mkmk749278/Creator): only the default folder and headers changed.
#
# Usage: scripts/upload_gdrive.sh [--sub <subfolder>] FILE [FILE ...]
#   --sub taj-mahal-palace     puts the files in The-Mechanical-Paradox/<subfolder>/ (created if missing).
#   Drive layout: The-Mechanical-Paradox/<slug>/ one folder per film, The-Mechanical-Paradox/_Channel/ for channel art (PLAYBOOK §1).
#   A single DIRECTORY argument copies its files in one resumable pass (8 at a time, files already there are skipped):
#   use it for frame sequences, where a per-file upload dies with the session's worker part-way.
#
# Needs the environment variable GDRIVE_RCLONE_TOKEN: the JSON line that `rclone authorize "drive"` prints
# (already set in this environment). Optional GDRIVE_FOLDER_ID (default: the The-Mechanical-Paradox folder created
# 2026-10-31). rclone itself is a pinned binary fetched into .cache/ on first use.
# Small text files (description, SRT, review.md) can also go up through the Google Drive connector without a token;
# the connector cannot carry video-sized files.
set -euo pipefail
RCLONE_VER=v1.71.1
ROOT=$(cd "$(dirname "$0")/.." && pwd)
CACHE="$ROOT/.cache/rclone"
FOLDER_ID=${GDRIVE_FOLDER_ID:-1F4h9HudKHZEAfRNo8bg1S1yMKSaEWqP3}
SUB=""
if [[ ${1:-} == --sub ]]; then SUB=$2; shift 2; fi
[[ $# -ge 1 ]] || { sed -n 2,12p "$0"; exit 2; }
[[ -n ${GDRIVE_RCLONE_TOKEN:-} ]] || { echo "GDRIVE_RCLONE_TOKEN is not set (see PLAYBOOK §1, Google Drive setup)" >&2; exit 3; }

RCLONE="$CACHE/rclone-$RCLONE_VER-linux-amd64/rclone"
if [[ ! -x $RCLONE ]]; then
  mkdir -p "$CACHE"
  curl -sSL -m 300 -o "$CACHE/rclone.zip" "https://downloads.rclone.org/$RCLONE_VER/rclone-$RCLONE_VER-linux-amd64.zip"
  (cd "$CACHE" && unzip -q -o rclone.zip && rm rclone.zip)
fi

# The Claude app's environment-variable field strips the JSON's leading `{"access_token":"` and the trailing
# `","expiry":"…"}` (seen 2026-10-13), leaving `ya29…","token_type":"Bearer","refresh_token":"1//…`. Rebuild the JSON;
# only the refresh token matters (rclone refreshes an expired access token with its default client).
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
DEST="gd:${SUB}"
if [[ $# -eq 1 && -d $1 ]]; then
  "$RCLONE" copy --transfers 8 --drive-chunk-size 64M --retries 4 --low-level-retries 10 --stats-one-line --stats 60s \
    "$1" "$DEST" >&2
  echo "$(ls "$1" | wc -l) files in $SUB (folder copy; existing files skipped)"
  exit 0
fi
for f in "$@"; do
  name=$(basename "$f")
  "$RCLONE" copyto --drive-chunk-size 64M --retries 4 --low-level-retries 10 --stats-one-line --stats 30s \
    "$f" "$DEST/$name" >&2
  # a private link: opens for the owner (signed in to Drive on the phone); no public sharing is added
  id=$("$RCLONE" lsjson --stat --no-mimetype "$DEST/$name" | python3 -c 'import json,sys; print(json.load(sys.stdin)["ID"])')
  echo "$name  https://drive.google.com/file/d/$id/view"
done

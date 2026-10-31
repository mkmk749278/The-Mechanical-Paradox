#!/data/data/com.termux/files/usr/bin/bash
# Download clips and files on the owner's phone and put them straight into Google Drive, in
# The-Mechanical-Paradox/<slug>/footage/, where a cloud session pulls them with scripts/gdrive_pull.sh (PLAYBOOK §11.4).
# Ported from mkmk749278/Creator scripts/termux_fetch_to_drive.sh (2026-10-27): Drive folder The-Mechanical-Paradox, rclone
# remote "bob", a list file in this repo, and direct file links (images, PDFs, audio) fetched with curl.
# Why on the phone: YouTube refuses the cloud container; the phone's mobile IP works. Only footage we may use: short,
# credited excerpts of official or news footage, owner-cleared (PLAYBOOK §11.3–11.4).
#
# One command in Termux (the session that needs the clips writes it out for you):
#   curl -sL https://raw.githubusercontent.com/mkmk749278/The-Mechanical-Paradox/main/scripts/termux_fetch_to_drive.sh | bash -s -- tata-history --list films/tata-history/scenes/owner_fetch.txt
# or with URLs directly:  … | bash -s -- tata-history "https://www.youtube.com/watch?v=ID" "https://youtu.be/ID2@01:10-01:40"
#
# Arguments: <slug>, then URLs and/or --list <repo path>. List lines: "ID_NAME URL[@MM:SS-MM:SS]  # note"; blank and #
# lines are skipped. URL@MM:SS-MM:SS downloads only that range. Videos: max 1080p MP4. Links ending in a file extension
# (.jpg .png .tif .pdf .mp3 .wav .mp4 …) are fetched as files. Files already in the folder are skipped, so a re-run only
# fetches what failed.
# First run only: installs python, ffmpeg, nodejs, rclone and a pinned yt-dlp, then creates the rclone remote "bob"
# (Google Drive): a browser opens, sign in with the account that owns the The-Mechanical-Paradox folder, tap Allow.
set -uo pipefail
SLUG="${1:?usage: termux_fetch_to_drive.sh <slug> [--list repo/path.txt] [URL[@START-END] ...]}"; shift
BOB_FOLDER_ID=1F4h9HudKHZEAfRNo8bg1S1yMKSaEWqP3   # the owner's Drive "The-Mechanical-Paradox" folder (CLAUDE.md)
RAW=https://raw.githubusercontent.com/mkmk749278/The-Mechanical-Paradox/main
OUT="$HOME/bob_fetch/$SLUG"
mkdir -p "$OUT" && cd "$OUT" || exit 1

entries=()
while [[ $# -gt 0 ]]; do
  if [[ "$1" == --list ]]; then
    curl -sfL "$RAW/$2" -o list.txt || { echo "could not read the list $2" >&2; exit 2; }
    while read -r name url _; do
      [[ -z "${name:-}" || "$name" == \#* ]] && continue
      entries+=("$name $url")
    done < list.txt
    shift 2
  else
    entries+=("$(printf 'clip%02d' $((${#entries[@]} + 1))) $1"); shift
  fi
done
[[ ${#entries[@]} -ge 1 ]] || { echo "give at least one URL or --list" >&2; exit 2; }

command -v rclone >/dev/null && command -v ffmpeg >/dev/null && command -v node >/dev/null && command -v python3 >/dev/null \
  || { pkg update -y && pkg install -y python ffmpeg nodejs rclone; }
python3 -m pip show yt-dlp 2>/dev/null | grep -q "^Version: 2026.8.19" || python3 -m pip install -q "yt-dlp==2026.8.19"

if ! rclone listremotes | grep -q "^bob:$"; then
  echo "One-time Google Drive sign-in: a browser opens; choose the account that owns the The-Mechanical-Paradox folder and tap Allow."
  rclone config create bob drive scope=drive root_folder_id="$BOB_FOLDER_ID" || { echo "rclone sign-in failed" >&2; exit 3; }
fi

[[ -f fetched.csv ]] || echo "name,file,url,section,title,uploader,duration_s" > fetched.csv
n=0; ok=0
for e in "${entries[@]}"; do
  n=$((n + 1)); name="${e%% *}"; entry="${e#* }"; url="${entry%@*}"; sec=""
  [[ "$entry" == *@*:*-* ]] && sec="${entry##*@}"
  echo "== $n/${#entries[@]} $name $entry"
  done_file=$(ls "$name".* 2>/dev/null | grep -v -E '\.(part|ytdl)$|\.f[0-9]+\.' | head -1)
  if [[ -n "$done_file" ]]; then echo "   already here ($done_file), skipped"; ok=$((ok + 1)); continue; fi
  if [[ "$url" =~ \.(jpe?g|png|tiff?|webp|pdf|mp3|wav|flac|m4a|mp4|mov|webm)(\?.*)?$ ]]; then
    ext="${BASH_REMATCH[1]}"
    if curl -sfL --retry 3 -A "Mozilla/5.0 (Linux; Android 14) BuiltOnBharat" -o "$name.$ext" "$url"; then
      echo "$name,$name.$ext,$url,,,,"  >> fetched.csv; ok=$((ok + 1))
    else
      rm -f "$name.$ext"; echo "$name,,$url,,FAILED,," >> fetched.csv; echo "   failed" >&2
    fi
    continue
  fi
  args=(--js-runtimes node --no-playlist --restrict-filenames --no-progress -q --no-warnings
        -f "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]/b" --merge-output-format mp4
        --print-to-file "%(title)s|%(uploader)s|%(duration)s" meta.txt -o "$name.%(ext)s")
  [[ -n "$sec" ]] && args+=(--download-sections "*$sec" --force-keyframes-at-cuts)
  rm -f meta.txt
  if yt-dlp "${args[@]}" "$url"; then
    IFS='|' read -r title upl dur < meta.txt
    echo "$name,$name.mp4,$url,$sec,\"${title//\"/\'}\",\"$upl\",$dur" >> fetched.csv
    ok=$((ok + 1))
  else
    echo "$name,,$url,$sec,FAILED,," >> fetched.csv
    echo "   failed (run the same command again later or on Wi-Fi: finished files are skipped)" >&2
  fi
done
echo "$ok of $n ready. Uploading to Drive: The-Mechanical-Paradox/$SLUG/footage/"
rclone copy --drive-chunk-size 64M --retries 4 --stats-one-line --stats 20s \
  --exclude "list.txt" --exclude "meta.txt" --exclude "*.part" --exclude "*.ytdl" . "bob:$SLUG/footage" && {
  echo "Done. Tell Claude: footage is in Drive, The-Mechanical-Paradox/$SLUG/footage ($ok of $n)."
  rclone link "bob:$SLUG/footage" 2>/dev/null || true
}

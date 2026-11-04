#!/usr/bin/env python3
"""Generate the recording blocks of a film with the channel's ElevenLabs voice (PLAYBOOK §7.6, §17.1 decision 6).

Reads the fenced blocks of films/<slug>/script/blocks_performance.md (block 1 first) and writes, per block and take,
films/<slug>/assets/vo/takes/raw/bNN_tK.mp3 plus a JSON sidecar with the exact request (voice, model, settings,
seed, character count). Takes that already exist are skipped, so a rerun spends nothing. Fixed seeds make every
take reproducible. The model is the newest Eleven flagship (eleven_vN) the account offers, v4 or later
(owner, 2026-11-04). Speed is left at 1.0: measured 2026-11-04, Eleven v4 ignores it (0.80, 0.85, 0.90 gave the same
13.0 s take); pace is set in the edit (PLAYBOOK §7.5).

Usage: scripts/eleven_tts.py films/<slug> [--takes 2] [--blocks 1,3] [--dry-run]
Needs ELEVENLABS_API_KEY (an environment secret for api.elevenlabs.io).
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

VOICE_NAME = "The Mechanical Paradox"
VOICE_ID = "q8DzlbH6OkvKn06IxgiA"  # the account's voice of that name, looked up 2026-11-04
MODEL_RE = re.compile(r"^eleven_v(\d+)$")  # owner 2026-11-04: Eleven v4, and always the newest Eleven vN after it
SETTINGS = {"stability": 0.50, "similarity_boost": 0.80, "style": 0.0, "speed": 1.0, "use_speaker_boost": True}
FORMAT = "mp3_44100_192"
SEEDS = [1101, 2202, 3303, 4404]  # take K uses SEEDS[K-1]
API = "https://api.elevenlabs.io/v1"


def latest_model(key: str) -> str:
    """Newest flagship model (eleven_vN, highest N) that can do text to speech; never turbo, flash or v2 variants."""
    req = urllib.request.Request(f"{API}/models", headers={"xi-api-key": key})
    with urllib.request.urlopen(req, timeout=60) as r:
        models = json.load(r)
    best = max(((int(m.group(1)), d["model_id"]) for d in models if d.get("can_do_text_to_speech")
                for m in [MODEL_RE.match(d["model_id"])] if m), default=None)
    if best is None or best[0] < 4:
        sys.exit("no Eleven v4 or newer model offered to this account")
    return best[1]


def read_blocks(md: Path) -> list[str]:
    return re.findall(r"^```\n(.*?)\n```$", md.read_text(), flags=re.S | re.M)


def tts(text: str, seed: int, key: str, model: str) -> bytes:
    body = json.dumps({"text": text, "model_id": model, "voice_settings": SETTINGS, "seed": seed}).encode()
    req = urllib.request.Request(f"{API}/text-to-speech/{VOICE_ID}?output_format={FORMAT}", data=body, method="POST",
                                 headers={"xi-api-key": key, "Content-Type": "application/json",
                                          "Accept": "audio/mpeg"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs refused the request ({e.code}): {e.read().decode(errors='replace')[:400]}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("film")
    ap.add_argument("--takes", type=int, default=2)
    ap.add_argument("--blocks", default="", help="comma-separated block numbers (default: all)")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    film = Path(a.film)
    blocks = read_blocks(film / "script/blocks_performance.md")
    want = {int(b) for b in a.blocks.split(",") if b} or set(range(1, len(blocks) + 1))
    out = film / "assets/vo/takes/raw"
    out.mkdir(parents=True, exist_ok=True)
    key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not key and not a.dry_run:
        sys.exit("ELEVENLABS_API_KEY is not set (PLAYBOOK §17.1 decision 6)")
    model = latest_model(key) if key else "eleven_v4"
    print(f"model: {model}")
    spent = 0
    for n, text in enumerate(blocks, 1):
        if n not in want:
            continue
        for k in range(1, a.takes + 1):
            mp3 = out / f"b{n:02d}_t{k}.mp3"
            if mp3.exists():
                print(f"{mp3.name}: exists, skipped")
                continue
            print(f"{mp3.name}: {len(text)} characters" + (" (dry run)" if a.dry_run else ""), flush=True)
            if a.dry_run:
                continue
            mp3.write_bytes(tts(text, SEEDS[k - 1], key, model))
            spent += len(text)
            mp3.with_suffix(".json").write_text(json.dumps(
                {"voice": VOICE_NAME, "voice_id": VOICE_ID, "model_id": model, "voice_settings": SETTINGS,
                 "seed": SEEDS[k - 1], "output_format": FORMAT, "characters": len(text), "block": n, "take": k},
                indent=1) + "\n")
    print(f"characters spent: {spent}")


if __name__ == "__main__":
    main()

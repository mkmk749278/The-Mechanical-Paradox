#!/usr/bin/env python3
"""Generate a film's music with Google Lyria 3.5 through the Gemini API (PLAYBOOK §12, §17.1 decision 10).

Reads films/<slug>/sound/lyria_prompts.json ({"model", "takes", "tracks": [{"id", "prompt"}]}) and writes, per track
and take, films/<slug>/assets/music/<id>_tK.wav plus a JSON sidecar (model, prompt, request time, the model's text
part, cost). Takes that already exist are skipped, so a rerun spends nothing. Lyria is not deterministic: a take is
kept by its file, not re-made from its prompt.

Usage: scripts/lyria_music.py films/<slug> [--takes 2] [--tracks act1,act2] [--dry-run]
Needs GEMINI_API_KEY (an environment secret). Cost (aistudio.google.com/docs/pricing, read 2026-11-04): $0.08 per
lyria-3.5 song, no free tier.
API (aistudio.google.com/docs/music-generation, read 2026-11-04): POST v1beta/interactions, Api-Revision 2026-05-20;
WAV is asked for with response_format {"type": "audio", "mime_type": "audio/wav"} (the supported values are listed by
the API's own error message: audio/mp3, audio/ogg_opus, audio/l16, audio/wav, audio/alaw, audio/mulaw).
"""
import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

URL = "https://generativelanguage.googleapis.com/v1beta/interactions"
REVISION = "2026-05-20"
COST = {"lyria-3.5": 0.08, "lyria-3-clip-preview": 0.04}


def generate(key: str, model: str, prompt: str) -> dict:
    body = {"model": model, "input": prompt, "response_format": {"type": "audio", "mime_type": "audio/wav"}}
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), method="POST", headers={
        "Content-Type": "application/json", "Api-Revision": REVISION, "x-goog-api-key": key})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:500]
            if e.code in (429, 500, 502, 503, 504) and attempt < 3:
                print(f"  HTTP {e.code}, retrying: {msg}")
                time.sleep(2 ** (attempt + 2))
                continue
            sys.exit(f"HTTP {e.code}: {msg}")
    sys.exit("no answer after 4 tries")


def parts(resp: dict) -> tuple[bytes, str, str]:
    audio, mime, text = b"", "", []
    for step in resp.get("steps", []):
        if step.get("type") != "model_output":
            continue
        for c in step.get("content", []):
            if c.get("type") == "audio" and not audio:
                audio, mime = base64.b64decode(c["data"]), c.get("mime_type", "")
            elif c.get("type") == "text":
                text.append(c.get("text", ""))
    if not audio:
        sys.exit(f"no audio in the answer: {json.dumps(resp)[:800]}")
    return audio, mime, "\n".join(text)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("film")
    ap.add_argument("--takes", type=int)
    ap.add_argument("--tracks")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    film = Path(a.film)
    spec = json.loads((film / "sound/lyria_prompts.json").read_text())
    model, takes = spec["model"], a.takes or spec.get("takes", 1)
    want = set(a.tracks.split(",")) if a.tracks else None
    out = film / "assets/music"
    out.mkdir(parents=True, exist_ok=True)
    todo = [(t, k) for t in spec["tracks"] if not want or t["id"] in want for k in range(1, takes + 1)
            if not (out / f"{t['id']}_t{k}.wav").exists()]
    print(f"{len(todo)} songs to make, ${len(todo) * COST[model]:.2f} at ${COST[model]:.2f} each ({model})")
    if a.dry_run or not todo:
        return
    key = os.environ.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY is not set")
    for t, k in todo:
        print(f"  {t['id']} take {k} …", flush=True)
        t0 = time.time()
        audio, mime, text = parts(generate(key, model, t["prompt"]))
        wav = out / f"{t['id']}_t{k}.wav"
        wav.write_bytes(audio)
        (out / f"{t['id']}_t{k}.json").write_text(json.dumps({
            "model": model, "prompt": t["prompt"], "mime_type": mime, "made": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "seconds_to_make": round(time.time() - t0, 1), "cost_usd": COST[model], "model_text": text,
            "licence": "Gemini API terms: Google claims no ownership of output; SynthID watermark"}, indent=1))
        print(f"    {wav} ({len(audio) / 1e6:.1f} MB, {mime}, {time.time() - t0:.0f} s)")


if __name__ == "__main__":
    main()

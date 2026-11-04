#!/usr/bin/env python3
"""Generate instrumental music with Google Lyria 3.5 (Gemini API) and check every track by ear before it is kept.

Usage:
  python3 scripts/lyria_library.py generate SPEC.json OUT_DIR [--only id1,id2] [--workers 3] [--attempts 5]
  python3 scripts/lyria_library.py audit OUT_DIR      # second, stricter listen for voices (a stronger model)
  python3 scripts/lyria_library.py catalog OUT_DIR CATALOG.csv

SPEC.json: {"common": "<text added to every prompt>", "tracks": [{"id", "palette", "title", "use", "mood",
"bpm", "key", "prompt", "brief"}, ...]}. Each kept track is OUT_DIR/<palette>/<id>.wav (48 kHz stereo WAV as Lyria
returns it) with a sidecar <id>.json: prompt, model, interaction id, attempts, the listening check and measurements.

The listening check sends a mono MP3 of the take to a Gemini model and asks for vocals, fit to the brief, defects
and the ending; a take that passes is then heard by a stronger model for voices alone (Lyria often adds choir or
"ooh" pads that the first listener misses). A take is kept only if both find no voice, it has no defect, fits the
brief (score >= 7), keeps a steady level and does not end on a hard cut; otherwise it is generated again (up to
--attempts). `audit` re-runs the voice check on kept tracks that lack one. Measurements: duration, integrated loudness, true
peak, loudness range, spectral centroid.

Needs GEMINI_API_KEY (never printed). Cost: $0.08 per Lyria 3.5 song, Paid Tier (aistudio.google.com/docs/pricing,
read 2026-11-04); the listening check costs a fraction of a cent. Every take, kept or not, is logged in
OUT_DIR/generation_log.csv with its cost.
Terms: Google claims no ownership of generated output (Gemini API terms); every track carries an inaudible SynthID
watermark. Instrumental only: Lyria has no instrumental switch, so the prompt says so and the check verifies it.
"""
import argparse
import base64
import concurrent.futures as cf
import csv
import json
import os
import re
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://generativelanguage.googleapis.com/v1beta"
MUSIC_MODEL = "lyria-3.5"
LISTEN_MODEL = "gemini-3.5-flash"
AUDIT_MODEL = "gemini-3.1-pro-preview"
PRICE_SONG = 0.08
LOCK = threading.Lock()

LISTEN_PROMPT = """You are a strict music supervisor checking a background track for a documentary before it is
licensed into a library. Listen to the WHOLE file carefully, start to end.
The brief was: "{brief}"
Return JSON only:
{{"vocals": true or false (ANY singing, humming, choir, ooh/aah pads that sound like human voices, spoken words,
whispers or vocal chops anywhere in the file), "vocal_detail": "where and what, or none",
"matches_brief": 0-10, "mood": "...", "instruments": "...", "has_drums": true or false,
"ending": "fade" | "held" | "abrupt cut" | "other",
"defects": "none" or a list of clicks, glitches, distortion, sudden jumps in level, broken loops or artifacts with times",
"level_steady": true or false (true if there are no sudden loud hits or long silent gaps that would disturb a narrator),
"sections": [{{"t": "m:ss", "what": "..."}}]}}"""


def key():
    k = os.environ.get("GEMINI_API_KEY", "").strip()
    if not k:
        sys.exit("GEMINI_API_KEY is not set")
    return k


def post(url, body, headers, timeout=600):
    h = {"Content-Type": "application/json", "x-goog-api-key": key(), **headers}
    for i in range(5):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=h)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:400]
            if e.code in (429, 500, 502, 503, 504) and i < 4:
                time.sleep(10 * 2 ** i)
                continue
            raise RuntimeError(f"HTTP {e.code}: {msg}") from None
        except (urllib.error.URLError, TimeoutError) as e:
            if i < 4:
                time.sleep(10 * 2 ** i)
                continue
            raise RuntimeError(str(e)) from None


def lyria(prompt):
    d = post(f"{API}/interactions", {"model": MUSIC_MODEL, "input": prompt,
                                     "response_format": {"type": "audio", "mime_type": "audio/wav"}},
             {"Api-Revision": "2026-05-20"})
    audio, text = None, []
    for step in d.get("steps", []):
        for c in step.get("content", []):
            if c.get("type") == "audio":
                audio = base64.b64decode(c["data"])
            elif c.get("type") == "text":
                text.append(c.get("text", ""))
    if not audio:
        raise RuntimeError(f"no audio in response (status {d.get('status')}): {' '.join(text)[:300]}")
    return audio, d.get("id", ""), " ".join(text)


def listen(mp3, brief):
    body = {"contents": [{"parts": [{"inline_data": {"mime_type": "audio/mp3",
                                                     "data": base64.b64encode(mp3.read_bytes()).decode()}},
                                    {"text": LISTEN_PROMPT.format(brief=brief)}]}],
            "generationConfig": {"responseMimeType": "application/json"}}
    d = post(f"{API}/models/{LISTEN_MODEL}:generateContent", body, {})
    parts = d["candidates"][0]["content"]["parts"]
    txt = [p["text"] for p in parts if "text" in p and not p.get("thought")][-1]
    qa = json.loads(txt)
    if isinstance(qa, list):  # the model sometimes wraps the object in a list
        qa = next((x for x in qa if isinstance(x, dict)), {})
    if not isinstance(qa, dict):
        raise ValueError(f"unexpected listening result: {txt[:200]}")
    return qa


def measure(wav):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(wav), "-af",
                        "ebur128=peak=true,aspectralstats=measure=centroid,ametadata=print:key=lavfi.aspectralstats.1.centroid:file=-",
                        "-f", "null", "-"], capture_output=True, text=True)
    err, out = p.stderr, p.stdout
    def grab(pat):
        m = re.findall(pat, err)
        return float(m[-1]) if m else None
    cents = [float(x) for x in re.findall(r"centroid=([\d.]+)", out)]
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                str(wav)], capture_output=True, text=True).stdout.strip() or 0)
    return {"seconds": round(dur, 2), "lufs": grab(r"I:\s+(-?[\d.]+) LUFS"), "lra": grab(r"LRA:\s+(-?[\d.]+) LU"),
            "true_peak_dbfs": grab(r"Peak:\s+(-?[\d.]+) dBFS"),
            "centroid_hz": round(sum(cents) / len(cents)) if cents else None}


def ok(qa):
    reasons = []
    if qa.get("vocals"):
        reasons.append("vocals: " + str(qa.get("vocal_detail")))
    if (qa.get("matches_brief") or 0) < 7:
        reasons.append(f"brief {qa.get('matches_brief')}/10")
    if str(qa.get("defects", "none")).strip().lower() not in ("none", "", "[]", "no"):
        reasons.append("defects: " + str(qa.get("defects")))
    if qa.get("ending") == "abrupt cut":
        reasons.append("abrupt ending")
    if qa.get("level_steady") is False:
        reasons.append("level not steady")
    return reasons


def log(out, row):
    f = out / "generation_log.csv"
    with LOCK:
        new = not f.exists()
        with f.open("a", newline="") as fh:
            w = csv.writer(fh)
            if new:
                w.writerow(["time_utc", "id", "attempt", "kept", "cost_usd", "reasons", "interaction_id"])
            w.writerow(row)


def one(t, common, out, attempts):
    d = out / t["palette"]
    d.mkdir(parents=True, exist_ok=True)
    wav, side = d / f"{t['id']}.wav", d / f"{t['id']}.json"
    if wav.exists() and side.exists():
        return f"{t['id']}: already there"
    prompt = f"{common.strip()}\n\n{t['prompt'].strip()}"
    best = None
    for a in range(1, attempts + 1):
        try:
            audio, iid, text = lyria(prompt)
        except RuntimeError as e:
            log(out, [time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), t["id"], a, "error", 0, str(e)[:200], ""])
            continue
        tmp = d / f".{t['id']}.a{a}.wav"
        tmp.write_bytes(audio)
        mp3 = tmp.with_suffix(".mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-ac", "1", "-b:a", "64k", str(mp3)],
                       check=True)
        try:
            qa = listen(mp3, t["brief"])
        except Exception as e:  # a failed check never keeps a take unheard
            qa = {"vocals": None, "matches_brief": 0, "defects": f"check failed: {e}"}
        reasons = ok(qa)
        aud = None
        if not reasons:  # the stricter second listen, for voices only
            try:
                aud = voice_check(mp3)
                if aud.get("voice"):
                    reasons.append(f"voice ({AUDIT_MODEL}): {aud.get('where')}")
            except Exception as e:
                reasons.append(f"voice check failed: {e}")
        mp3.unlink()
        log(out, [time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), t["id"], a, "yes" if not reasons else "no",
                  PRICE_SONG, "; ".join(reasons), iid])
        cand = {"tmp": tmp, "qa": qa, "aud": aud, "reasons": reasons, "iid": iid, "text": text, "attempt": a}
        if not reasons:
            best = cand
            break
        if best is None or (not qa.get("vocals") and (qa.get("matches_brief") or 0) > (best["qa"].get("matches_brief") or 0)):
            if best:
                best["tmp"].unlink(missing_ok=True)
            best = cand
        else:
            tmp.unlink(missing_ok=True)
    if best is None:
        return f"{t['id']}: FAILED (no audio)"
    if best["reasons"]:
        best["tmp"].rename(d / f"_rejected_{t['id']}.wav")
        return f"{t['id']}: REJECTED after {attempts} takes ({'; '.join(best['reasons'])})"
    best["tmp"].rename(wav)
    meta = {k: t[k] for k in ("id", "palette", "title", "use", "mood", "bpm", "key", "brief")}
    meta.update({"prompt": prompt, "model": MUSIC_MODEL, "interaction_id": best["iid"], "structure": best["text"],
                 "attempt": best["attempt"], "listen_model": LISTEN_MODEL, "listen": best["qa"],
                 "audit": {**best["aud"], "model": AUDIT_MODEL},
                 "generated_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                 "licence": "Generated with Google Lyria 3.5 via the Gemini API (Paid Tier); Google claims no "
                            "ownership of output; SynthID watermark", **measure(wav)})
    side.write_text(json.dumps(meta, indent=1, ensure_ascii=False) + "\n")
    return f"{t['id']}: kept (take {best['attempt']}, {meta['seconds']} s, {meta['lufs']} LUFS, brief {best['qa'].get('matches_brief')}/10)"


AUDIT_PROMPT = """Listen to this whole instrumental track very carefully, start to end. Is there ANY human voice:
singing, humming, choir, "ooh"/"aah" vocal pads, whispers, spoken words or vocal chops? Synth pads that only resemble
voices count if a typical listener would hear them as a choir. Return JSON only:
{"voice": true or false, "where": "times and what, or none", "confidence": 0-10}"""


def voice_check(mp3):
    body = {"contents": [{"parts": [{"inline_data": {"mime_type": "audio/mp3",
                                                     "data": base64.b64encode(mp3.read_bytes()).decode()}},
                                    {"text": AUDIT_PROMPT}]}],
            "generationConfig": {"responseMimeType": "application/json"}}
    d = post(f"{API}/models/{AUDIT_MODEL}:generateContent", body, {})
    txt = [p["text"] for p in d["candidates"][0]["content"]["parts"] if "text" in p and not p.get("thought")][-1]
    v = json.loads(txt)
    v = next((x for x in v if isinstance(x, dict)), {}) if isinstance(v, list) else v
    if not isinstance(v, dict) or "voice" not in v:
        raise ValueError(f"unexpected voice-check result: {txt[:200]}")
    return v


def audit_one(wav):
    side = wav.with_suffix(".json")
    m = json.loads(side.read_text())
    if "audit" not in m:
        mp3 = wav.with_name(f".{wav.stem}.audit.mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "96k", str(mp3)],
                       check=True)
        v = voice_check(mp3)
        mp3.unlink()
        m["audit"] = {**v, "model": AUDIT_MODEL}
        side.write_text(json.dumps(m, indent=1, ensure_ascii=False) + "\n")
    v = m["audit"]
    return f"{'VOICE' if v.get('voice') else 'clean'} {wav.stem} ({v.get('confidence')}/10: {v.get('where')})"


def audit(a):
    wavs = sorted(Path(a.out).glob("*/*.wav"))
    wavs = [w for w in wavs if not w.name.startswith(("_", "."))]
    with cf.ThreadPoolExecutor(4) as ex:
        futs = {ex.submit(audit_one, w): w.stem for w in wavs}
        for fut in cf.as_completed(futs):
            try:
                print(fut.result(), flush=True)
            except Exception as e:
                print(f"ERROR {futs[fut]}: {e}", flush=True)


def generate(a):
    spec = json.loads(Path(a.spec).read_text())
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    tracks = spec["tracks"]
    if a.only:
        want = set(a.only.split(","))
        tracks = [t for t in tracks if t["id"] in want]
    with cf.ThreadPoolExecutor(a.workers) as ex:
        futs = {ex.submit(one, t, spec["common"], out, a.attempts): t["id"] for t in tracks}
        for fut in cf.as_completed(futs):
            try:
                print(fut.result(), flush=True)
            except Exception as e:  # one track failing never stops the others
                print(f"{futs[fut]}: FAILED ({type(e).__name__}: {e})", flush=True)


def catalog(a):
    rows = []
    out = Path(a.out)  # a generate folder (<palette>/<id>.json) or a flat folder made by music_pull.sh
    for side in sorted(set(out.glob("*/*.json")) | set(out.glob("*.json"))):
        if side.name.startswith(("_", ".")):
            continue
        m = json.loads(side.read_text())
        rows.append({"id": m["id"], "palette": m["palette"], "file": f"{m['palette']}/{m['id']}.wav",
                     "title": m["title"], "use": m["use"], "mood": m["mood"], "bpm": m["bpm"], "key": m["key"],
                     "seconds": m["seconds"], "lufs": m["lufs"], "true_peak_dbfs": m["true_peak_dbfs"],
                     "centroid_hz": m["centroid_hz"], "instruments": m["listen"].get("instruments", ""),
                     "has_drums": m["listen"].get("has_drums"), "ending": m["listen"].get("ending"),
                     "voice_audit": "clean" if m.get("audit", {}).get("voice") is False else
                     ("VOICE" if m.get("audit", {}).get("voice") else "not audited"),
                     "model": m["model"], "generated_utc": m["generated_utc"], "licence": m["licence"]})
    with open(a.csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    print(f"{len(rows)} tracks -> {a.csv}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    g = sp.add_parser("generate")
    g.add_argument("spec")
    g.add_argument("out")
    g.add_argument("--only")
    g.add_argument("--workers", type=int, default=3)
    g.add_argument("--attempts", type=int, default=5)
    au = sp.add_parser("audit")
    au.add_argument("out")
    c = sp.add_parser("catalog")
    c.add_argument("out")
    c.add_argument("csv")
    a = ap.parse_args()
    {"generate": generate, "audit": audit, "catalog": catalog}[a.cmd](a)

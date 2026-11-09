#!/usr/bin/env python3
"""Cut a film's Shorts' sound from its master mix, by the same rules as the picture (PLAYBOOK §13.6).

Reads films/<slug>/shorts.json and vo/timing.json exactly as lib/remotion/Short.tsx (resolveShort) does: a segment
runs from LEAD frames before the sentence opening with `open` to TAIL frames after the end of the first later sentence
opening with `close`; the last one holds END more frames; a `cont` segment starts where the previous one ended. Each
cut gets a 40 ms fade on both sides (no clicks; a `cont` join is continuous, so no fade), the end a 1.2 s fade-out.
Then one static gain to −14 LUFS and a −1 dBTP limiter, measured.

Usage: scripts/short_audio.py films/<slug> MIX.wav OUT_DIR   → OUT_DIR/short<N>.wav for every Short
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile

film, mix, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
spec = json.loads((film / "shorts.json").read_text())
t = json.loads((film / "vo/timing.json").read_text())
fps = t["fps"]
sr, x = wavfile.read(mix)
x = x.astype(np.float32) if x.dtype == np.float32 else x.astype(np.float32) / np.iinfo(x.dtype).max


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", "", s.lower())).strip()


def loud(path: Path) -> tuple[float, float]:
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    summ = err[err.rfind("Summary:"):]
    return float(re.search(r"I:\s+(-?[0-9.]+) LUFS", summ).group(1)), float(re.search(r"Peak:\s+(-?[0-9.inf]+) dBFS", summ).group(1))


for sh in spec["shorts"]:
    segs = []
    for k, g in enumerate(sh["segs"]):
        i = next(n for n, s in enumerate(t["sentences"]) if norm(s["text"]).startswith(norm(g["open"])))
        j = next(n for n, s in enumerate(t["sentences"]) if n >= i and norm(s["text"]).startswith(norm(g["close"])))
        last = k == len(sh["segs"]) - 1
        a = segs[-1][1] if g.get("cont") and segs else t["sentences"][i]["startFrame"] - spec["lead"]
        b = t["sentences"][j]["endFrame"] + spec["tail"] + (spec["end"] if last else 0)
        segs.append((a, b, bool(g.get("cont"))))
    parts = []
    fade = int(0.04 * sr)
    for n, (a, b, cont) in enumerate(segs):
        p = x[round(a / fps * sr): round(b / fps * sr)].copy()
        if n and not cont:
            p[:fade] *= np.linspace(0, 1, fade)[:, None]
        if n + 1 < len(segs) and not segs[n + 1][2]:
            p[-fade:] *= np.linspace(1, 0, fade)[:, None]
        parts.append(p)
    y = np.concatenate(parts)
    tail = int(1.2 * sr)
    y[-tail:] *= np.linspace(1, 0, tail)[:, None] ** 2
    frames = sum(b - a for a, b, _ in segs)
    assert abs(len(y) / sr - frames / fps) < 0.05, (len(y) / sr, frames / fps)
    pre = out / f"short{sh['id']}_pre.wav"
    wavfile.write(pre, sr, y)
    i0, _ = loud(pre)
    dst = out / f"short{sh['id']}.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(pre), "-af",
                    f"volume={-14 - i0:.2f}dB,aresample=192000,alimiter=limit=0.89:attack=0.1:release=50:level=false,aresample={sr}",
                    "-c:a", "pcm_s24le", str(dst)], check=True)
    pre.unlink()
    i1, tp = loud(dst)
    print(f"short {sh['id']}: {frames} frames ({frames / fps:.2f} s), {len(segs)} segments → {dst.name}: {i1:.1f} LUFS, {tp:.1f} dBTP")

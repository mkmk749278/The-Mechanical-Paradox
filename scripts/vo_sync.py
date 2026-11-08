#!/usr/bin/env python3
"""Check (and with --fix, correct) a film's vo/timing.json against the voice file it describes (PLAYBOOK §10.4).

Why: until 2026-11-08 vo_timing.py cut each sentence out of its take with `ffmpeg -ss -to -c copy`. ffmpeg starts
such a cut on the exact sample but rounds its end UP to a whole 2048-sample packet (0–43 ms more audio), while the
timing counted the nominal length. Over a film's ~115 joins the voice slid up to 2.3 s behind the picture
(film 2, cut v10: 0 s at the start, +1 s by 3:00, +2.2 s at the landing), and every gate read the picture against
timing.json, not against the audio, so nobody saw it.

How: every gap vo_timing.py inserts is generated silence, i.e. exact digital zero, and the takes never are. So the
zero runs in vo_full.wav mark the real start of every sentence piece. Each piece holds one sentence and starts on the
exact sample of its nominal cut, so a sentence (and its words) moves by (real piece start - nominal piece start).
The nominal piece start is rebuilt from timing.json alone: a block's first piece starts at the block start; any
other piece was cut mid-pause, so it starts half the take's own pause before the sentence.

On a timing.json that is already right, the rebuilt nominal start errs by up to half a packet (21 ms), so the check
passes at TOLERANCE (under two frames at 60 fps); the bug reads in tenths of a second, then whole seconds.
--fix marks the file ("synced") and refuses to shift it twice.

Usage: scripts/vo_sync.py films/<slug> --wav path/to/vo_full.wav [--fix]
Exit 1 if any sentence is off by more than TOLERANCE (without --fix), 2 if the file doesn't fit the model.
"""
import argparse
import json
import sys
import wave
from pathlib import Path

import numpy as np

GAPS = (0.35, 0.55, 0.6, 0.8, 1.4)  # vo_timing.py: BREATH values, BLOCK_GAP, CHAPTER_GAP
PACKET = 2048
TOLERANCE = 0.03


def zero_runs(wav: Path) -> tuple[list[tuple[float, float]], float, int]:
    w = wave.open(wav.as_posix())
    if w.getnchannels() != 1 or w.getsampwidth() != 2:
        sys.exit("expected 16-bit mono (vo_timing.py's vo_full.wav)")
    sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16)
    z = np.r_[0, (x == 0).astype(np.int8), 0]
    d = np.diff(z)
    st, en = np.where(d == 1)[0], np.where(d == -1)[0]
    keep = (en - st) >= int(0.2 * sr)
    return [(a / sr, b / sr) for a, b in zip(st[keep], en[keep])], len(x) / sr, sr


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("film")
    ap.add_argument("--wav", required=True)
    ap.add_argument("--fix", action="store_true")
    a = ap.parse_args()
    path = Path(a.film) / "vo" / "timing.json"
    t = json.loads(path.read_text())
    fps, S = t["fps"], t["sentences"]
    runs, total, sr = zero_runs(Path(a.wav))
    if len(runs) != len(S) - 1:
        sys.exit(f"{len(runs)} silences for {len(S)} sentences: not a vo_timing.py join")
    for r0, r1 in runs:
        if min(abs((r1 - r0) - g) for g in GAPS) > 0.002:
            print(f"silence of {r1 - r0:.4f} s at {r0:.3f} s is not one of {GAPS}", file=sys.stderr)
            sys.exit(2)
    if abs(total - t["duration"]) > 0.002:
        sys.exit(f"wav is {total:.3f} s, timing.json says {t['duration']} s: different files")
    blocks = {b["block"]: b for b in t["blocks"]}
    shift, worst = [], 0.0
    for i, s in enumerate(S):
        if i == 0:
            nominal, real = blocks[s["block"]]["start"], 0.0
        else:
            gap = runs[i - 1][1] - runs[i - 1][0]
            real = runs[i - 1][1]
            if s["block"] != S[i - 1]["block"]:
                nominal = blocks[s["block"]]["start"]
            else:
                half = (s["start"] - S[i - 1]["end"] - gap) / 2
                if half < -0.002:
                    sys.exit(f"sentence {i}: negative pause {half:.3f}")
                nominal = s["start"] - half
        shift.append(real - nominal)
        worst = max(worst, abs(real - nominal))
    steps = np.diff([0.0, *shift])
    # each step is one piece's packet overshoot: 0 to 2048 samples
    lo = -PACKET / sr / 2 if t.get("synced") else 0.0
    if steps.min() < lo - 0.002 or steps.max() > PACKET / sr + 0.002:
        print(f"piece overshoots outside 0–{PACKET / sr * 1000:.0f} ms: {steps.min():.4f}..{steps.max():.4f}",
              file=sys.stderr)
        sys.exit(2)
    print(f"{len(S)} sentences; voice behind timing by {shift[0]:+.3f} s at the start, {shift[len(S) // 2]:+.3f} s "
          f"mid-film, {shift[-1]:+.3f} s at the end (worst {worst:.3f} s = {worst * fps:.0f} frames)")
    if not a.fix:
        sys.exit(1 if worst > TOLERANCE else 0)
    if t.get("synced"):
        sys.exit(f"already fixed ({t['synced']}); re-run vo_timing.py to start again")

    def mv(x: dict, d: float) -> None:
        for k in ("start", "end"):
            if k in x:
                x[k] = round(x[k] + d, 3)
                x[k + "Frame"] = round(x[k] * fps)
    for s, d in zip(S, shift):
        mv(s, d)
    for w in t["words"]:
        mv(w, shift[w["s"]])
    starts = {round(s["start"] - d, 3): d for s, d in zip(S, shift)}
    for c in t["chapters"]:
        mv(c, starts[round(c["start"], 3)])
    # a block runs from its first piece's real start to its last piece's real end (the next silence, or the file end)
    for b in t["blocks"]:
        idx = [i for i, s in enumerate(S) if s["block"] == b["block"]]
        b["start"] = 0.0 if idx[0] == 0 else round(runs[idx[0] - 1][1], 3)
        b["end"] = round(runs[idx[-1]][0] if idx[-1] < len(runs) else total, 3)
        b["startFrame"], b["endFrame"] = round(b["start"] * fps), round(b["end"] * fps)
    t["synced"] = f"vo_sync.py: sentences moved to the real piece starts, up to {worst:.3f} s"
    path.write_text(json.dumps(t, indent=1, ensure_ascii=False))
    print(f"fixed {path}")


if __name__ == "__main__":
    main()

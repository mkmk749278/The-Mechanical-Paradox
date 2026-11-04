#!/usr/bin/env python3
"""A provisional timing.json from the script alone, so scenes can be cued to words before the VO is recorded.

Same schema as scripts/vo_timing.py (sentences, words, chapters, blocks; seconds and frames), plus "provisional": true.
Pace: 150 words a minute, words spread by spoken length (letters, numbers already spelled out in vo.txt); a full stop
gives 0.35 s, a comma 0.15 s, a paragraph 0.7 s, a chapter turn 1.4 s (vo_timing.py's CHAPTER_GAP). Every scene cues
by phrase (lib/remotion/timing.ts), so the real VO timing replaces this file without touching scene code.

Usage: scripts/provisional_timing.py films/<slug> [--fps 60] [--wpm 150]
"""
import argparse
import json
import re
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("film")
ap.add_argument("--fps", type=int, default=60)
ap.add_argument("--wpm", type=float, default=150)
a = ap.parse_args()
film = Path(a.film)
vo = (film / "script" / "vo.txt").read_text()

SENT = re.compile(r"(?<=[.?!])\s+")
t, chap, prev_chap = 0.6, None, None
timing = {"fps": a.fps, "provisional": True, "blocks": [], "sentences": [], "words": [], "chapters": []}
all_words = vo.split()
avg_len = sum(len(re.sub(r"\W", "", w)) + 2 for w in all_words if not w.startswith("#")) / len(all_words)
per_unit = 60 / a.wpm / avg_len  # seconds per (letters + 2)

for para in vo.split("\n\n"):
    para = para.strip()
    if not para:
        continue
    if para.startswith("## "):  # a header may sit directly on its first paragraph
        head, _, para = para.partition("\n")
        chap = head[3:].strip()
        para = para.strip()
        if not para:
            continue
    if chap != prev_chap:
        if prev_chap is not None:
            t += 1.4 - 0.7
        timing["chapters"].append({"title": chap, "start": round(t, 3)})
        prev_chap = chap
    for sent in SENT.split(para):
        sid = len(timing["sentences"])
        s0 = t
        for w in sent.split():
            d = (len(re.sub(r"\W", "", w)) + 2) * per_unit
            timing["words"].append({"s": sid, "w": re.sub(r"[^\w'-]", "", w), "start": round(t, 3), "end": round(t + d, 3)})
            t += d
            if w.endswith(","):
                t += 0.15
        timing["sentences"].append({"id": sid, "chapter": chap, "text": sent, "start": round(s0, 3), "end": round(t, 3)})
        t += 0.35
    t += 0.7 - 0.35
timing["duration"] = round(t + 0.6, 3)
timing["durationInFrames"] = round(timing["duration"] * a.fps)
for key in ("sentences", "words", "chapters"):
    for x in timing[key]:
        for k in ("start", "end"):
            if k in x:
                x[k + "Frame"] = round(x[k] * a.fps)
out = film / "vo" / "timing.provisional.json"
out.write_text(json.dumps(timing, indent=1, ensure_ascii=False))
print(f"{out}: {len(timing['sentences'])} sentences, {len(timing['words'])} words, {timing['duration']:.1f} s")

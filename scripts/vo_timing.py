#!/usr/bin/env python3
"""Join the recorded blocks into one VO and time every sentence and word on it (PLAYBOOK §10.4).

No transcription: the locked script is the truth, so only timings are needed.
1. Each block take is trimmed to its speech (0.15 s kept each side) and joined with BLOCK_GAP; every chapter turn
   (a `## ` line in vo.txt), inside a take or between takes, gets CHAPTER_GAP of silence instead.
2. Sentences are placed with Creator's silence-to-script aligner (`align_script.align`: pauses snap the boundaries,
   each sentence's speech time follows its share of the text).
3. Inside a sentence, each clause boundary (comma, pause tag, dash) snaps to a pause in the audio near its expected
   place, if there is one; words are spread over their clause by spoken length.
Writes, in --out: vo_full.wav (48 kHz mono), timing.json (blocks, sentences and words with start/end in seconds and
in frames at --fps; chapter starts), captions.en.srt (one cue per sentence) and timing.md (sentences to check by ear).

Usage: scripts/vo_timing.py films/<slug> [--fps 60]
  reads films/<slug>/assets/vo/takes/bNN.mp3, films/<slug>/script/blocks_performance.md and script/vo.txt
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from align_script import align, silences  # noqa: E402

TAG = re.compile(r"\[[^\]]*\]")
BLOCK_GAP, CHAPTER_GAP, KEEP = 0.55, 1.4, 0.15
SR = 48000


def ff(args: list[str]) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def dur(path: Path) -> float:
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                 str(path)], capture_output=True, text=True, check=True).stdout)


def speech_span(path: Path) -> tuple[float, float]:
    total = dur(path)
    gaps = silences(path, -40, 0.1)
    start = gaps[0][1] if gaps and gaps[0][0] <= 0.05 and gaps[0][1] else 0.0
    end = gaps[-1][0] if gaps and (gaps[-1][1] is None or gaps[-1][1] >= total - 0.05) else total
    return max(0.0, start - KEEP), min(total, end + KEEP)


def sentences(block: str) -> list[str]:
    """Spoken sentences of a block, tags kept (they mark pauses)."""
    out = []
    for para in block.split("\n\n"):
        para = para.strip()
        for s in re.split(r"(?<=[.?!])(?<![ .][A-Z]\.)\s+(?=(?:\[[^\]]*\]\s*)*[A-Z0-9])", para):  # not after an initial (N. Chandrasekaran)
            if TAG.sub("", s).strip():
                out.append(s.strip())
    return out


def clauses(sentence: str) -> list[str]:
    """Split at commas, dashes and pause tags: the places a speaker may stop."""
    parts = re.split(r"(?<=,)\s+|\s+—\s+|\s*\[[^\]]*\]\s*", sentence)
    return [p.strip() for p in parts if p and TAG.sub("", p).strip()]


def spoken_weight(text: str) -> float:
    words = re.findall(r"[A-Za-z0-9'.]+", TAG.sub("", text))
    # letters, plus a little per word (onsets), plus extra for dotted acronyms (each letter is a syllable)
    return sum(len(w.replace(".", "")) + 1.5 + 2.0 * w.count(".") for w in words) or 1.0


def place_words(text: str, s: float, e: float) -> list[dict]:
    words = [w for w in TAG.sub(" ", text).split() if re.search(r"[A-Za-z0-9]", w)]
    ws = [spoken_weight(w) for w in words]
    tot, t, out = sum(ws), s, []
    for w, x in zip(words, ws):
        d = (e - s) * x / tot
        out.append({"w": w, "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return out


def time_sentence(sent: str, s: float, e: float, gaps: list[tuple[float, float]]) -> list[dict]:
    cl = clauses(sent)
    ws = [spoken_weight(c) for c in cl]
    inner = [(a, b) for a, b in gaps if a > s + 0.05 and b < e - 0.05 and b - a >= 0.08]
    bounds = [(s, None)]
    tot, acc = sum(ws), 0.0
    for i in range(len(cl) - 1):
        acc += ws[i]
        # expected boundary in speech time, then the nearest pause within 0.6 s of it
        exp = s + (e - s) * acc / tot
        near = [g for g in inner if abs((g[0] + g[1]) / 2 - exp) < 0.6 and g[0] > bounds[-1][0]]
        if near:
            g = min(near, key=lambda g: abs((g[0] + g[1]) / 2 - exp))
            bounds[-1] = (bounds[-1][0], g[0])
            bounds.append((g[1], None))
        else:
            bounds[-1] = (bounds[-1][0], exp)
            bounds.append((exp, None))
    bounds[-1] = (bounds[-1][0], e)
    words = []
    for c, (a, b) in zip(cl, bounds):
        words += place_words(c, a, b)
    return words


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("film", type=Path)
    ap.add_argument("--fps", type=int, default=60)
    a = ap.parse_args()
    film = a.film
    out = film / "assets" / "vo"
    md = (film / "script" / "blocks_performance.md").read_text()
    blocks = re.findall(r"^```\n(.*?)\n```$", md, flags=re.S | re.M)
    vo = (film / "script" / "vo.txt").read_text()
    # chapter of each beat, from the `## ` headers of vo.txt (beats compared without tags), in spoken order
    norm = lambda t: re.sub(r"\s+", " ", TAG.sub("", t)).strip()  # noqa: E731
    beats, chap = [], None
    for para in vo.split("\n\n"):
        para = para.strip()
        if para.startswith("## "):
            chap = para[3:].strip()
        elif para:
            beats.append((norm(para), chap))
    takes = sorted((out / "takes").glob("b*.mp3"))
    if len(takes) != len(blocks):
        sys.exit(f"{len(takes)} takes for {len(blocks)} blocks")

    tmp = out / "tmp"
    tmp.mkdir(exist_ok=True)
    pieces, t0, bi = [], 0.0, 0
    timing = {"fps": a.fps, "blocks": [], "sentences": [], "words": [], "chapters": []}
    prev_chap = None

    def silence(name: str, sec: float) -> None:
        nonlocal t0
        sil = tmp / f"{name}.wav"
        ff(["-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", f"{sec}", sil.as_posix()])
        pieces.append(sil)
        t0 += sec

    for n, (take, block) in enumerate(zip(takes, blocks), 1):
        s, e = speech_span(take)
        wav = tmp / f"b{n:02d}.wav"
        ff(["-ss", f"{s}", "-to", f"{e}", "-i", take.as_posix(), "-ac", "1", "-ar", str(SR), wav.as_posix()])
        length = dur(wav)
        gaps = [(x, y if y is not None else length) for x, y in silences(wav, -35, 0.08)]
        sents = sentences(block)
        lines = [{"te": TAG.sub("", x).strip(), "en": ""} for x in sents]
        spans = align(length, [g for g in gaps if g[1] - g[0] >= 0.15], lines, 0.35)
        # chapter of each sentence: walk the script's beats in order
        chaps = []
        for sent in sents:
            t = norm(sent)
            while bi < len(beats) and t not in beats[bi][0]:
                bi += 1
            if bi == len(beats):
                sys.exit(f"sentence not found in vo.txt (in order): {t}")
            chaps.append(beats[bi][1])
        # cut the take at each chapter turn (mid-pause before the new chapter's first sentence)
        cuts = [0.0]
        for i in range(1, len(sents)):
            if chaps[i] != chaps[i - 1]:
                cuts.append(round((spans[i - 1][1] + spans[i][0]) / 2, 3))
        cuts.append(length)
        if n > 1:
            silence(f"gap{n:02d}", CHAPTER_GAP if chaps[0] != prev_chap else BLOCK_GAP)
        block_start = t0
        for k in range(len(cuts) - 1):
            c0, c1 = cuts[k], cuts[k + 1]
            if k:
                silence(f"gap{n:02d}_{k}", CHAPTER_GAP)
            seg = tmp / f"b{n:02d}_{k}.wav"
            ff(["-ss", f"{c0}", "-to", f"{c1}", "-i", wav.as_posix(), "-c", "copy", seg.as_posix()])
            pieces.append(seg)
            off = t0 - c0  # global time = take time + off
            for i, (sent, (ss, se, ratio, margin)) in enumerate(zip(sents, spans)):
                if not c0 <= ss < c1:
                    continue
                if chaps[i] != prev_chap:
                    timing["chapters"].append({"title": chaps[i], "start": round(off + ss, 3)})
                    prev_chap = chaps[i]
                words = time_sentence(sent, ss, se, gaps)
                sid = len(timing["sentences"])
                timing["sentences"].append({
                    "id": sid, "block": n, "chapter": chaps[i], "text": norm(sent), "tagged": sent,
                    "start": round(off + ss, 3), "end": round(off + se, 3), "ratio": ratio, "margin": margin})
                for w in words:
                    timing["words"].append({"s": sid, "w": w["w"], "start": round(off + w["start"], 3),
                                            "end": round(off + w["end"], 3)})
            t0 += c1 - c0
        timing["blocks"].append({"block": n, "start": round(block_start, 3), "end": round(t0, 3)})
    lst = tmp / "list.txt"
    lst.write_text("".join(f"file '{p.resolve().as_posix()}'\n" for p in pieces))
    ff(["-f", "concat", "-safe", "0", "-i", lst.as_posix(), "-c:a", "pcm_s16le", (out / "vo_full.wav").as_posix()])
    total = dur(out / "vo_full.wav")
    timing["duration"] = round(total, 3)
    timing["durationInFrames"] = round(total * a.fps)
    for key in ("blocks", "sentences", "words", "chapters"):
        for x in timing[key]:
            for k in ("start", "end"):
                if k in x:
                    x[k + "Frame"] = round(x[k] * a.fps)
    (out / "timing.json").write_text(json.dumps(timing, indent=1, ensure_ascii=False))

    def srt(t: float) -> str:
        ms = round(t * 1000)
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    cues = [f"{i}\n{srt(x['start'])} --> {srt(x['end'] + 0.2)}\n{x['text']}\n"
            for i, x in enumerate(timing["sentences"], 1)]
    (out / "captions.en.srt").write_text("\n".join(cues))
    weak = [x for x in timing["sentences"] if x["margin"] < 0.05 or not 0.6 < x["ratio"] < 1.6]
    rep = [f"# VO timing: {film.name}", "", f"{total:.1f} s · {len(timing['sentences'])} sentences · "
           f"{len(timing['words'])} words · {len(timing['chapters'])} chapters", "",
           "## Sentences to check (low margin or odd length)"]
    rep += [f"- {x['start']:.2f}s b{x['block']:02d} ratio {x['ratio']} margin {x['margin']}: {x['text'][:70]}"
            for x in weak] or ["- none"]
    (out / "timing.md").write_text("\n".join(rep) + "\n")
    print("\n".join(rep[:3]))
    print(f"{len(weak)} sentences to check")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Review a recorded VO take against its script (PLAYBOOK §7.9). Claude can't hear audio, so this measures it.

For one take (one recording block) it reports:
- **Words:** a local open speech-to-text model (faster-whisper, CPU; owner 2026-10-24: allowed only to check our own VO
  against its script, never for timing or for films) transcribes the take; the words are diffed against the script.
  Missing, added or changed words are listed, and added words that match our tag vocabulary are flagged as a tag
  read aloud.
- **Pace:** words a minute over speech time, and per paragraph-sized window.
- **Pauses:** every silence over 0.25 s, the longest ones, and whether each `[pause]`/`[long pause]`/`...` in the
  script got one.
- **Voice:** median pitch, pitch range per 6 s window (a narrow range = flat read), and, against a reference take,
  the pitch shift in semitones and a timbre distance (MFCC) to catch a tag that changed the voice (the
  `[low, steady voice]` problem, 2026-10-24).
- **Loudness:** integrated LUFS, true peak, clipping.
It writes `report.md`, `review.png` and `words.json` per take (waveform with pauses, pitch contour, per-window timbre distance).

Usage:
  scripts/vo_review.py TAKE.mp3 --text BLOCK.txt [--ref REFERENCE.mp3] [--out DIR] [--model small.en]
  scripts/vo_review.py TAKES*.mp3 --blocks films/<slug>/script/blocks_performance.md [--out DIR]
With --blocks each take is matched to its block, every take is compared with the voice of the whole batch (or --ref),
and summary.md lists all takes in block order. Transcripts are cached in each take's folder (words.json).
"""
import argparse
import difflib
import json
import re
import subprocess
from pathlib import Path

import librosa
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402

TAG_WORDS = {"pause", "long", "softly", "warmly", "curious", "serious", "amused", "urgent", "relieved", "exhales",
             "voice", "low", "steady", "quietly", "slowly", "dry", "energy"}
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen " \
       "seventeen eighteen nineteen".split()
ORDINAL = dict(enumerate("_ first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth "
                         "thirteenth fourteenth fifteenth sixteenth seventeenth eighteenth nineteenth twentieth "
                         "twenty-first twenty-second twenty-third twenty-fourth twenty-fifth twenty-sixth "
                         "twenty-seventh twenty-eighth twenty-ninth thirtieth thirty-first".split()))
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def say_int(n: int, year: bool = True) -> str:
    """Spoken English for an integer, as our scripts write numbers (no 'and' after hundred is also accepted)."""
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 1000:
        r = n % 100
        return ONES[n // 100] + " hundred" + ("" if r == 0 else " and " + say_int(r))
    if year and (1100 <= n <= 1999 or 2010 <= n <= 2099):  # years: nineteen twenty four, twenty twenty six
        hi, lo = divmod(n, 100)
        tail = "hundred" if lo == 0 else ("oh " + ONES[lo] if lo < 10 else say_int(lo))
        return say_int(hi) + " " + tail
    if n < 100000:
        th, r = divmod(n, 1000)
        return say_int(th) + " thousand" + ("" if r == 0 else " " + say_int(r))
    if n < 10000000:
        la, r = divmod(n, 100000)
        return say_int(la) + " lakh" + ("" if r == 0 else " " + say_int(r))
    cr, r = divmod(n, 10000000)
    return say_int(cr) + " crore" + ("" if r == 0 else " " + say_int(r))


NUM_WORDS = set(ONES) | set(TENS[2:]) | {"hundred", "thousand", "lakh", "crore", "million", "billion", "oh", "point"}
WIN_FAR = 0.05  # a 3 s window this far from the reference voice is worth a listen (same-voice windows sit under ~0.04)
PAUSE = "\x00"  # marks a pause cue ([pause], [long pause], ...) in the script


def norm_words(text: str, cues: bool = False) -> list[str]:
    """Lower-case spoken words, numbers as words, apostrophes dropped and spelled letters joined (H-A-L, H.A.L. -> hal)."""
    text = text.replace("\u2019", "'").replace("\u2018", "'")
    text = re.sub(r"\[(?:long )?pause\]|\.\.\.|\u2026", f" {PAUSE} " if cues else " ", text)
    text = re.sub(r"\[[^\]]+\]", " ", text)                      # tags are not spoken
    text = text.replace("%", " percent")
    text = re.sub(r"\b(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d+)?)(\s+(?:lakh|crore|thousand|million|billion))?",
                  r"\1\2 rupees", text)                          # Rs 21,000 -> 21,000 rupees
    text = re.sub(r"\$\s*([\d,]+(?:\.\d+)?)(\s+(?:thousand|million|billion|trillion))?", r"\1\2 dollars", text)
    text = re.sub(r"\b(\d+)(st|nd|rd|th)\b", lambda m: ORDINAL.get(int(m.group(1)), m.group(1)), text)
    text = re.sub(r"(\d)\.(\d)", lambda m: m.group(1) + " point " + " ".join(m.group(2)), text)
    text = re.sub(r"\d{1,3}(?:,\d{2,3})+", lambda m: " " + say_int(int(m.group(0).replace(",", "")), year=False) + " ",
                  text)  # 1,500 is a quantity, never a year
    text = re.sub(r"\d+", lambda m: " " + say_int(int(m.group(0))) + " ", text)
    text = re.sub(r"(?<![A-Za-z])([A-Za-z])[.\-](?=[A-Za-z][.\-]?(?![A-Za-z]))", r"\1", text)  # R.B.I. / H-A-L
    text = text.lower().replace("-", " ").replace("\u2014", " ").replace("'", "")
    words = re.findall(r"[a-z]+|\x00", text)
    return [w for w in words if w != "and"]  # "and" comes and goes in spoken numbers


def join_letters(ws: list[str], idx: list) -> tuple[list[str], list]:
    """Join runs of single letters (h a l -> hal): spelled acronyms arrive split, one letter per word."""
    out, oi, run = [], [], False
    for w, i in zip(ws, idx):
        single = len(w) == 1
        if single and run:
            out[-1] += w
        else:
            out.append(w)
            oi.append(i)
        run = single
    return out, oi


def close(a: str, b: str) -> bool:
    """Same word in another spelling (disc/disk, Nashik/Nasik, one s/ones, micro cooling/microcooling)."""
    a, b = a.replace(" ", ""), b.replace(" ", "")
    return a == b or (min(len(a), len(b)) >= 3 and difflib.SequenceMatcher(a=a, b=b).ratio() >= 0.75)


def clip(words: list[str], n: int = 24) -> str:
    return " ".join(words) if len(words) <= n else " ".join(words[:n // 2]) + " … " + " ".join(words[-n // 2:])


def ffmpeg_text(args: list[str]) -> str:
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats", *args], capture_output=True, text=True).stderr


def loudness(path: str) -> dict:
    t = ffmpeg_text(["-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"])
    i = re.findall(r"I:\s+(-?[\d.]+) LUFS", t)
    p = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", t)
    return {"lufs": float(i[-1]) if i else None, "true_peak": float(p[-1]) if p else None}


def pauses(path: str, thresh: float = -35, dur: float = 0.25) -> list[tuple[float, float]]:
    t = ffmpeg_text(["-i", path, "-af", f"silencedetect=noise={thresh}dB:d={dur}", "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", t)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", t)]
    return [(max(s, 0.0), e) for s, e in zip(starts, ends)]


def transcribe(path: str, m) -> list[dict]:
    """Word list with times. The transcriber sometimes stretches one word over a second or more and skips the words
    under it (a 7-word line vanished this way, 2026-10-24); each such stretch is transcribed again on its own."""
    words = transcribe_once(path, m)
    k = 0
    while k < len(words):
        if words[k]["end"] - words[k]["start"] <= 1.0:
            k += 1
            continue
        a, b = max(k - 3, 0), min(k + 4, len(words))
        t0, t1 = max(words[a]["start"] - 0.2, 0.0), words[b - 1]["end"] + 0.2
        clip = Path(path).with_name(Path(path).stem + "_retry.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.2f}", "-to", f"{t1:.2f}", "-i", path, str(clip)],
                       check=True)
        lo_t, hi_t = words[a]["start"] - 0.1, words[b - 1]["end"] + 0.1
        again = [{**w, "start": w["start"] + t0, "end": w["end"] + t0} for w in transcribe_once(str(clip), m)]
        again = [w for w in again if w["start"] >= lo_t and w["end"] <= hi_t]  # the padding catches neighbours
        clip.unlink()
        if len(again) > b - a:  # it found the missing words
            words[a:b] = again
            k = a + len(again)
        else:
            k += 1
    return words


def transcribe_once(path: str, m) -> list[dict]:
    segs, _ = m.transcribe(path, language="en", word_timestamps=True, vad_filter=False, beam_size=5)
    words = []
    for s in segs:
        for w in s.words or []:
            t = w.word.strip()
            # numbers arrive split ("12" + ",000", "42" + "%"): glue the fragment onto the word before it
            if words and re.match(r"^[,.%]\d*|^\d", t) and re.search(r"\d$", words[-1]["w"]) and t[0] in ",.%":
                words[-1]["w"] += t
                words[-1]["end"] = w.end
            else:
                words.append({"w": t, "start": w.start, "end": w.end})
    # money spans words ("Rs" "21,000", "$2.3" "billion"): one word, so the normaliser sees the whole amount
    out = []
    for w in words:
        if out and (re.fullmatch(r"(?i)rs\.?|₹|\$", out[-1]["w"]) or (
                re.search(r"(?i)^(rs\.?|₹|\$)\s*[\d,.]+$", out[-1]["w"])
                and re.fullmatch(r"(?i)(thousand|lakh|crore|million|billion|trillion)[.,?]?", w["w"]))):
            out[-1] = {"w": out[-1]["w"] + " " + w["w"], "start": out[-1]["start"], "end": w["end"]}
        else:
            out.append(w)
    return out


def voice_features(y: np.ndarray, sr: int) -> dict:
    f0, voiced, _ = librosa.pyin(y, fmin=60, fmax=320, sr=sr, frame_length=2048, hop_length=256)
    t = librosa.times_like(f0, sr=sr, hop_length=256)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20, hop_length=256)
    return {"f0": f0, "t": t, "voiced": voiced, "mfcc": mfcc}


def semis(a: float, b: float) -> float:
    return 12 * np.log2(a / b)


def ref_features(paths: list[str]) -> dict:
    """The voice we want: median pitch and average MFCC over one or more takes."""
    f0s, mf = [], []
    for path in paths:
        y, sr = librosa.load(path, sr=22050, mono=True)
        vf = voice_features(y, sr)
        f0s.append(vf["f0"][~np.isnan(vf["f0"])])
        mf.append(vf["mfcc"][1:])
    return {"f0": float(np.median(np.concatenate(f0s))), "mfcc": np.concatenate(mf, axis=1).mean(axis=1)}


def cos_dist(v: np.ndarray, r: np.ndarray) -> float:
    return 1 - float(np.dot(v, r) / (np.linalg.norm(v) * np.linalg.norm(r)))


def read_blocks(md: str) -> list[str]:
    """Fenced blocks of a blocks.md file, in order (block 1 first)."""
    return re.findall(r"^```\n(.*?)\n```$", Path(md).read_text(), flags=re.S | re.M)


def review(take: str, script_raw: str, out: Path, words: list[dict], ref: dict | None, ref_name: str) -> dict:
    out.mkdir(parents=True, exist_ok=True)
    script, cue_at = [], set()  # cue_at: script indices with a pause cue right before them
    for w in norm_words(script_raw, cues=True):
        if w == PAUSE:
            cue_at.add(len(script))
        else:
            script.append(w)

    y, sr = librosa.load(take, sr=22050, mono=True)
    dur = len(y) / sr
    lo = loudness(take)
    ps = pauses(take)
    speech = dur - sum(e - s for s, e in ps)
    # pace = words over the spoken span (first word to last), pauses included: what the 145-160 wpm target means

    heard, at = [], []  # heard tokens and the whisper word each came from
    for k, w in enumerate(words):
        for t in norm_words(w["w"]):
            heard.append(t)
            at.append(k)
    heard, at = join_letters(heard, at)
    sidx = list(range(len(script)))
    script, sidx = join_letters(script, sidx)
    cue_at = {sidx.index(i) for i in cue_at if i in sidx}

    sm = difflib.SequenceMatcher(a=script, b=heard, autojunk=False)
    ops = sm.get_opcodes()
    # the take may cover only part of the script: score the window between the first and last matched words
    eq = [o for o in ops if o[0] == "equal"]
    lo_i, hi_i = (eq[0][1], eq[-1][2]) if eq else (0, len(script))
    s2h = {}
    issues, matched = [], 0
    for op, i1, i2, j1, j2 in ops:
        if op == "equal":
            matched += i2 - i1
            s2h.update({i1 + d: j1 + d for d in range(i2 - i1)})
            continue
        if op == "delete" and (i2 <= lo_i or i1 >= hi_i):
            continue  # outside this take
        if op == "replace" and close(" ".join(script[i1:i2]), " ".join(heard[j1:j2])):
            matched += i2 - i1
            continue
        said = heard[j1:j2]
        if op == "replace" and set(script[i1:i2]) | set(said) <= NUM_WORDS:
            op = "number (spelled differently? check by ear)"
        tagish = op == "insert" and said and all(w in TAG_WORDS for w in said)
        t0 = words[at[j1]]["start"] if j1 < len(at) else None
        issues.append({"op": "TAG READ ALOUD?" if tagish else op, "t": t0, "script": clip(script[i1:i2]),
                       "heard": clip(said)})
    window = max(hi_i - lo_i, 1)
    match = matched / window

    # pause cues: did a silence of 0.25 s+ land just before the cued word?
    cue_rep = []
    for i in sorted(cue_at):
        if i not in s2h or i == 0:
            continue
        w = words[at[s2h[i]]]
        prev_end = words[at[s2h[i] - 1]]["end"] if s2h[i] > 0 else 0
        gap = max((min(e, w["start"] + 0.15) - max(s, prev_end - 0.15) for s, e in ps
                   if s < w["start"] + 0.15 and e > prev_end - 0.15), default=0.0)
        cue_rep.append((w["start"], " ".join(script[max(i - 3, 0):i]) + " … " + " ".join(script[i:i + 3]), gap))

    vf = voice_features(y, sr)
    f0 = vf["f0"]
    med = float(np.nanmedian(f0)) if np.any(~np.isnan(f0)) else float("nan")
    # fold the tracker's octave jumps back (a value near double or half the median is the same note an octave off)
    f0 = np.where(f0 > 1.7 * med, f0 / 2, np.where(f0 < med / 1.7, f0 * 2, f0))
    # pitch range per 6 s window, in semitones (P10..P90): narrow = flat
    win = []
    for s in np.arange(0, dur, 6.0):
        m = (vf["t"] >= s) & (vf["t"] < s + 6) & ~np.isnan(f0)
        if m.sum() > 20:
            p10, p90 = np.percentile(f0[m], [10, 90])
            win.append((s, semis(p90, p10), float(np.median(f0[m]))))
    dist_t, dist, cmp = None, None, None
    if ref:
        # timbre distance per 3 s window against the reference's average (cosine distance on MFCC 1-19)
        frames = vf["mfcc"][1:]
        hop_t = 256 / sr
        step = int(3 / hop_t)
        dist_t, dist = [], []
        for k in range(0, frames.shape[1] - step, step):
            dist.append(cos_dist(frames[:, k:k + step].mean(axis=1), ref["mfcc"]))
            dist_t.append(k * hop_t)
        cmp = {"ref_f0": ref["f0"], "shift_semitones": semis(med, ref["f0"]),
               "timbre_distance": cos_dist(frames.mean(axis=1), ref["mfcc"])}
        cmp["changed"] = abs(cmp["shift_semitones"]) > 1.5 or cmp["timbre_distance"] > 0.02

    # figure
    fig, ax = plt.subplots(3 if dist else 2, 1, figsize=(16, 9 if dist else 6.5), sharex=True)
    tt = np.arange(len(y)) / sr
    ax[0].plot(tt, y, lw=0.3, color="#555")
    for s, e in ps:
        ax[0].axvspan(s, e, color="#f5b041", alpha=0.35)
    for i in issues:
        if i["t"] is not None:
            ax[0].axvline(i["t"], color="#c0392b", lw=1.2)
    for t, _, g in cue_rep:
        ax[0].plot(t, -0.95 * np.max(np.abs(y)), "^", color="#1e8449" if g >= 0.25 else "#c0392b", ms=6)
    ax[0].set_title(f"waveform · pauses (orange) · word problems (red lines) · pause cues (▲ green kept, red missed) · {Path(take).name}")
    ax[1].plot(vf["t"], f0, ".", ms=1.2, color="#c0392b")
    if cmp:
        ax[1].axhline(cmp["ref_f0"], color="#2471a3", lw=1, label=f"{ref_name} median")
        ax[1].legend(loc="upper right")
    ax[1].axhline(med, color="#c0392b", lw=1, ls="--")
    ax[1].set_ylabel("pitch Hz")
    if dist:
        ax[2].plot(dist_t, dist, color="#7d3c98")
        ax[2].axhline(WIN_FAR, color="#999", ls=":")
        ax[2].set_ylabel(f"timbre distance\nfrom {ref_name}")
    ax[-1].set_xlabel("seconds")
    fig.tight_layout()
    fig.savefig(out / "review.png", dpi=110)

    span = (words[-1]["end"] - words[0]["start"]) if words else dur
    wpm = len(heard) / (span / 60)
    long_p = sorted(ps, key=lambda p: p[1] - p[0], reverse=True)[:6]
    flat = [w for w in win if w[1] < 3.0]
    rep = [f"# VO review: {Path(take).name}", "",
           f"- **Length** {dur:.1f} s · **pace {wpm:.0f} wpm** (target 145–160) · articulation "
           f"{len(heard) / (speech / 60):.0f} wpm over {speech:.1f} s of sound",
           f"- **Words** {match * 100:.1f}% of the script heard as written (script words {lo_i + 1}–{hi_i} of "
           f"{len(script)} are in this take; {len(heard)} words heard)",
           f"- **Loudness** {lo['lufs']} LUFS integrated · true peak {lo['true_peak']} dBTP"
           + ("  ⚠ clipping risk" if lo["true_peak"] is not None and lo["true_peak"] > -1 else ""),
           f"- **Pitch** median {med:.0f} Hz · range per 6 s window: "
           + ", ".join(f"{s:.0f}s {r:.1f} st" for s, r, _ in win),
           f"- **Flat windows** (< 3 semitones): {', '.join(f'{s:.0f}s' for s, _, _ in flat) or 'none'}",
           f"- **Pauses** {len(ps)} over 0.25 s · longest: "
           + ", ".join(f"{s:.1f}s ({e - s:.2f}s)" for s, e in long_p),
           f"- **Pause cues kept** ([pause], [long pause], ...): {sum(g >= 0.25 for *_, g in cue_rep)} of "
           f"{len(cue_rep)}" + "".join(f"\n  - {t:.1f}s «{c}» {'' if g >= 0.25 else '⚠ no pause'} ({g:.2f} s)"
                                        for t, c, g in cue_rep)]
    far = [(t, d) for t, d in zip(dist_t or [], dist or []) if d > WIN_FAR]
    if cmp:
        rep += [f"- **Voice vs {ref_name}** pitch shift {cmp['shift_semitones']:+.1f} semitones "
                f"(take {med:.0f} Hz, {ref_name} {cmp['ref_f0']:.0f} Hz) · timbre distance {cmp['timbre_distance']:.3f}"
                + ("  ⚠ VOICE CHANGED" if cmp["changed"] else ""),
                f"- **Stretches far from the {ref_name} voice** (3 s windows over {WIN_FAR}): "
                + (", ".join(f"{t:.0f}s ({d:.3f})" for t, d in far) or "none")]
    rep += ["", "## Word differences (script → heard)"]
    rep += [f"- {i['t']:.1f}s {i['op']}: «{i['script']}» → «{i['heard']}»" if i["t"] is not None else
            f"- end {i['op']}: «{i['script']}» → «{i['heard']}»" for i in issues] or ["- none"]
    rep += ["", "_Speech-to-text mishears names and numbers now and then: listen to each flagged spot before re-recording._"]
    (out / "report.md").write_text("\n".join(rep) + "\n")
    return {"take": Path(take).name, "dur": dur, "wpm": wpm, "match": match,
            "issues": len(issues), "cues": f"{sum(g >= 0.25 for *_, g in cue_rep)}/{len(cue_rep)}",
            "f0": med, "flat": len(flat), "lufs": lo["lufs"], "peak": lo["true_peak"], "cmp": cmp, "far": len(far),
            "report": "\n".join(rep)}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("takes", nargs="+")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--text", help="the block as recorded (tags allowed), for one take")
    g.add_argument("--blocks", help="a blocks.md file: each take is matched to its block automatically")
    ap.add_argument("--ref", nargs="*", help="reference take(s) of the voice we want; default with several takes: "
                                             "the batch itself, so the odd one out stands out")
    ap.add_argument("--out", default=None, help="output folder (one sub-folder per take)")
    ap.add_argument("--model", default="small.en")
    a = ap.parse_args()
    out = Path(a.out or Path(a.takes[0]).parent / "review")
    blocks = read_blocks(a.blocks) if a.blocks else [Path(a.text).read_text()]
    bwords = [set(norm_words(b)) for b in blocks]

    model = None
    heard: dict[str, list[dict]] = {}
    for take in a.takes:
        cache = out / Path(take).stem / "words.json"
        if cache.exists():
            heard[take] = json.loads(cache.read_text())
            continue
        if model is None:
            from faster_whisper import WhisperModel
            model = WhisperModel(a.model, device="cpu", compute_type="int8")
        heard[take] = transcribe(take, model)
        cache.parent.mkdir(parents=True, exist_ok=True)
        cache.write_text(json.dumps(heard[take], indent=0))

    if a.ref:
        ref, ref_name = ref_features(a.ref), "reference"
    elif len(a.takes) > 1:
        ref, ref_name = ref_features(a.takes), "batch"
    else:
        ref, ref_name = None, ""

    rows = []
    for take in a.takes:
        hw = norm_words(" ".join(w["w"] for w in heard[take]))
        # the block whose words this take covers best
        n = max(range(len(blocks)), key=lambda k: len(bwords[k] & set(hw)) / max(len(bwords[k] | set(hw)), 1))
        r = review(take, blocks[n], out / Path(take).stem, heard[take], ref, ref_name)
        r["block"] = n + 1
        rows.append(r)
        print(r["report"], "\n")
    if len(rows) > 1:
        rows.sort(key=lambda r: (r["block"], r["take"]))
        t = [f"# VO review: {len(rows)} takes", "", f"Voice compared with: {ref_name}", "",
             "| block | take | length | words as written | wpm | pause cues kept | pitch | vs " + ref_name +
             " | far stretches | LUFS | peak |", "|---|---|---|---|---|---|---|---|---|---|---|"]
        for r in rows:
            c = r["cmp"]
            vs = (f"{c['shift_semitones']:+.1f} st · {c['timbre_distance']:.3f}" + (" ⚠" if c["changed"] else "")) \
                if c else "–"
            t.append(f"| {r['block']} | {r['take']} | {r['dur']:.0f} s | {r['match'] * 100:.1f}% ({r['issues']}) | "
                     f"{r['wpm']:.0f} | {r['cues']} | {r['f0']:.0f} Hz | {vs} | {r['far']} | {r['lufs']} | "
                     f"{r['peak']} |")
        (out / "summary.md").write_text("\n".join(t) + "\n")
        print("\n".join(t))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Score, SFX and voice for a film, mixed and mastered (PLAYBOOK §12).

  .venv/bin/python scripts/score_mix.py films/<slug> [--out films/<slug>/assets/mix]

Reads films/<slug>/vo/timing.json (sentence/word anchors), sound/score.json (music slots, room tones),
sound/sfx.json (cues) and assets/music/** (tracks by title, see sound/music_manifest.csv), and the voice
assets/vo/vo_full.wav. Writes to OUT: bed.wav, sfx.wav, voice.wav (48 kHz stereo stems) and mix.wav, the master:
stereo made explicitly, music ducked under the voice (−11 dB under speech, back up in pauses with 0.5 s ramps),
one static gain to −14 LUFS, a −1 dBTP limiter, measured twice (PLAYBOOK §12). Prints the measurements.

Anchors: a number (film seconds), 'end', 's:<id>' (sentence start), 'e:<id>' (sentence end), 'w:<id>:<word>' (start
of that word in that sentence), each optionally '+N' or '-N' seconds.
SFX are synthesized here (deterministic, seeded): no third-party library is licensed yet.
"""
import argparse
import csv
import json
import re
import subprocess
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000


def decode(path: Path) -> np.ndarray:
    """Any audio file → float32 stereo at SR, shape (n, 2)."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def db(x: float) -> float:
    return 10 ** (x / 20)


class Anchors:
    def __init__(self, timing: dict):
        self.s = {s["id"]: s for s in timing["sentences"]}
        self.words = timing["words"]
        self.dur = timing["duration"]

    def __call__(self, a) -> float:
        if isinstance(a, (int, float)):
            return float(a)
        m = re.match(r"^(end|[sew]:[^+\-]+?)([+\-][0-9.]+)?$", a)
        if not m:
            raise ValueError(f"bad anchor {a}")
        base, off = m.group(1), float(m.group(2) or 0)
        if base == "end":
            t = self.dur
        elif base.startswith("s:"):
            t = self.s[int(base[2:])]["start"]
        elif base.startswith("e:"):
            t = self.s[int(base[2:])]["end"]
        else:
            _, sid, word = base.split(":", 2)
            ws = [w for w in self.words if w["s"] == int(sid) and re.sub(r"\W", "", w["w"]).lower() == word.lower()]
            if not ws:
                raise ValueError(f"no word {word!r} in sentence {sid}")
            t = ws[0]["start"]
        return t + off


# ---------------------------------------------------------------- synthesized SFX (mono, then panned centre)
def _env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def _band(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    sos = signal.butter(4, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def _low(x: np.ndarray, hi: float, order: int = 4) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, hi, btype="low", fs=SR, output="sos"), x)


def synth(name: str, seed: int, dur: float = 0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    if name == "impact_low":
        n = int(2.2 * SR)
        t = np.arange(n) / SR
        f = 70 * np.exp(-t * 1.4) + 32
        boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.004, 0.55)
        thud = _low(rng.standard_normal(n), 900) * _env(n, 0.001, 0.06)
        return boom * 0.9 + thud * 0.5
    if name == "metal_slam":
        n = int(2.0 * SR)
        t = np.arange(n) / SR
        ring = sum(np.sin(2 * np.pi * fr * t + rng.uniform(0, 6)) * a * np.exp(-t / d)
                   for fr, a, d in [(187, 0.5, 0.9), (431, 0.35, 0.6), (763, 0.25, 0.45), (1287, 0.18, 0.3), (2213, 0.1, 0.18)])
        hit = _band(rng.standard_normal(n), 300, 6000) * _env(n, 0.0005, 0.03)
        return synth("impact_low", seed + 1)[:n] * 0.7 + ring * 0.6 + hit * 0.8
    if name == "paper_tear":
        n = int(0.6 * SR)
        x = _band(rng.standard_normal(n), 1500, 9000)
        grains = (rng.random(n) < 0.004).astype(float)
        grains = np.convolve(grains, np.hanning(120), mode="same")
        shape = np.sin(np.linspace(0, np.pi, n)) ** 0.6
        return x * (0.3 + grains * 2.5) * shape * 0.6
    if name == "counter_land":
        n = int(1.2 * SR)
        t = np.arange(n) / SR
        click = _band(rng.standard_normal(n), 2000, 8000) * _env(n, 0.0003, 0.012)
        thump = np.sin(2 * np.pi * 95 * t) * _env(n, 0.002, 0.12)
        bell = (np.sin(2 * np.pi * 1318 * t) + 0.5 * np.sin(2 * np.pi * 1976 * t)) * _env(n, 0.003, 0.35) * 0.25
        return click * 0.8 + thump * 0.8 + bell
    if name == "glint":
        n = int(1.1 * SR)
        t = np.arange(n) / SR
        x = sum(np.sin(2 * np.pi * fr * t + rng.uniform(0, 6)) for fr in (3520, 4186, 5274, 6272)) / 4
        trem = 0.6 + 0.4 * np.sin(2 * np.pi * 14 * t)
        return x * trem * _env(n, 0.06, 0.32) * 0.5
    if name == "riser":
        n = int(1.25 * SR)
        x = rng.standard_normal(n)
        out = np.zeros(n)
        for i, c in enumerate(np.linspace(300, 4000, 10)):
            seg = slice(i * n // 10, (i + 1) * n // 10)
            out[seg] = _band(x, c * 0.7, c * 1.3)[seg]
        return out * np.linspace(0, 1, n) ** 2 * 0.7
    if name == "sparks":
        n = int(0.9 * SR)
        grains = (rng.random(n) < 0.002).astype(float) * rng.uniform(0.3, 1, n)
        x = np.convolve(grains, np.hanning(60), mode="same")
        x = _band(x + 0.05 * rng.standard_normal(n), 2500, 12000)
        return x * np.exp(-np.arange(n) / SR / 0.3) * 3
    if name == "whoosh":
        n = int(0.9 * SR)
        x = rng.standard_normal(n)
        out = np.zeros(n)
        cs = np.concatenate([np.linspace(400, 2500, 5), np.linspace(2500, 600, 5)])
        for i, c in enumerate(cs):
            seg = slice(i * n // 10, (i + 1) * n // 10)
            out[seg] = _band(x, c * 0.6, c * 1.4)[seg]
        return out * np.sin(np.linspace(0, np.pi, n)) ** 1.5 * 0.6
    if name == "ember_tail":
        n = int(2.5 * SR)
        x = _low(rng.standard_normal(n), 250)
        crackle = np.convolve((rng.random(n) < 0.0008).astype(float), np.hanning(40), mode="same")
        return (x * 0.6 + _band(crackle, 2000, 8000) * 2) * _env(n, 0.3, 0.9)
    # ---- v8 foley (both outside reviews: "no room to breathe", foley buried): beds take `dur`, hits are short
    if name == "loom":  # shuttle clatter and a heavy beat, about 2.2 picks a second
        n = int(dur * SR)
        out = np.zeros(n)
        hit = _band(rng.standard_normal(int(0.08 * SR)), 600, 5000) * _env(int(0.08 * SR), 0.0005, 0.018)
        thud = np.sin(2 * np.pi * 70 * np.arange(int(0.2 * SR)) / SR) * _env(int(0.2 * SR), 0.002, 0.05)
        t = 0.0
        while t < dur - 0.3:
            i = int(t * SR)
            out[i:i + len(hit)] += hit * rng.uniform(0.6, 1.0)
            j = i + int(0.11 * SR)
            out[j:j + len(thud)] += thud[: max(0, min(len(thud), n - j))] * 0.8
            t += 0.45 + rng.uniform(-0.03, 0.03)
        out += _low(rng.standard_normal(n), 300) * 0.05
        return _fade(out, dur)
    if name == "harbour":  # water lapping and a slow rigging creak
        n = int(dur * SR)
        lap = _band(rng.standard_normal(n), 120, 1400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * np.arange(n) / SR + rng.uniform(0, 6))) ** 2
        creak = np.zeros(n)
        for c in np.arange(rng.uniform(0.5, 2), dur - 1, rng.uniform(2.5, 4)):
            m = int(0.6 * SR)
            tt = np.arange(m) / SR
            f = 180 + 60 * np.sin(2 * np.pi * 1.3 * tt)
            creak[int(c * SR):int(c * SR) + m] += np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * tt / 0.6) * 0.06
        return _fade(lap * 0.5 + _band(creak, 200, 2500), dur)
    if name == "bells":  # bullock bells, jingling at a walk, and street murmur
        n = int(dur * SR)
        out = _band(rng.standard_normal(n), 200, 2500) * 0.12
        for t in np.arange(0.2, dur - 0.5, 0.33):
            m = int(0.5 * SR)
            tt = np.arange(m) / SR
            fr = rng.choice([2093, 2349, 2637]) * rng.uniform(0.98, 1.02)
            ring = (np.sin(2 * np.pi * fr * tt) + 0.4 * np.sin(2 * np.pi * fr * 2.76 * tt)) * _env(m, 0.001, 0.12)
            i = int((t + rng.uniform(-0.04, 0.04)) * SR)
            out[i:i + m] += ring[: max(0, min(m, n - i))] * rng.uniform(0.2, 0.45)
        return _fade(out, dur)
    if name in ("telegraph", "cardreader"):  # a key's dots and dashes; a card reader's fast chatter
        n = int(dur * SR)
        out = np.zeros(n)
        click = _band(rng.standard_normal(int(0.02 * SR)), 1500, 7000) * _env(int(0.02 * SR), 0.0003, 0.004)
        step = 0.07 if name == "telegraph" else 0.028
        t = 0.1
        while t < dur - 0.2:
            if name == "telegraph":
                on = rng.choice([0.07, 0.21])
                i = int(t * SR)
                out[i:i + len(click)] += click
                tone = np.sin(2 * np.pi * 700 * np.arange(int(on * SR)) / SR) * 0.12
                out[i:i + len(tone)] += tone[: max(0, min(len(tone), n - i))]
                t += on + rng.choice([0.07, 0.07, 0.21])
            else:
                i = int(t * SR)
                out[i:i + len(click)] += click * rng.uniform(0.5, 1)
                t += step * rng.uniform(0.8, 1.2)
        return _fade(out, dur)
    if name == "engine":  # a small 1930s engine: a cough, then a steady prop drone
        n = int(dur * SR)
        tt = np.arange(n) / SR
        rpm = np.clip(tt / 1.2, 0.15, 1)
        f = 38 * rpm
        firing = (np.sin(2 * np.pi * np.cumsum(f) / SR) > 0.6).astype(float)
        x = _low(firing * rng.standard_normal(n), 900) + _band(rng.standard_normal(n), 60, 400) * 0.4 * rpm
        cough = (tt < 0.9) * (rng.random(n) < 0.0004)
        x += np.convolve(cough.astype(float), np.hanning(800), mode="same") * 2
        return _fade(x, dur)
    if name == "cleanroom":  # air handling: a filtered hiss and a low fan hum
        n = int(dur * SR)
        x = _band(rng.standard_normal(n), 800, 7000) * 0.3 + np.sin(2 * np.pi * 120 * np.arange(n) / SR) * 0.05
        return _fade(x, dur)
    if name == "coin":  # a coin set down on the counter
        n = int(0.9 * SR)
        tt = np.arange(n) / SR
        ring = sum(np.sin(2 * np.pi * fr * tt) * a * np.exp(-tt / d) for fr, a, d in [(3150, 0.5, 0.25), (5200, 0.3, 0.15), (7900, 0.2, 0.08)])
        return ring + _band(rng.standard_normal(n), 2000, 9000) * _env(n, 0.0002, 0.006)
    if name == "stamp":  # a rubber stamp on paper
        n = int(0.5 * SR)
        return _low(rng.standard_normal(n), 1200) * _env(n, 0.001, 0.03) + np.sin(2 * np.pi * 110 * np.arange(n) / SR) * _env(n, 0.002, 0.05)
    if name == "vault":  # a vault tumbler turning and its bolt
        n = int(1.4 * SR)
        out = np.zeros(n)
        click = _band(rng.standard_normal(int(0.015 * SR)), 1200, 6000) * _env(int(0.015 * SR), 0.0003, 0.003)
        for k in range(8):
            i = int((0.08 + k * 0.09) * SR)
            out[i:i + len(click)] += click * 0.6
        bolt = synth("impact_low", seed + 3)[: int(0.6 * SR)] * 0.5
        out[int(0.85 * SR):int(0.85 * SR) + len(bolt)] += bolt[: n - int(0.85 * SR)]
        return out
    if name in ("furnace_bed", "cabin", "room"):
        n = int(dur * SR)
        x = np.cumsum(rng.standard_normal(n))  # brown
        x = signal.sosfilt(signal.butter(1, 20, btype="high", fs=SR, output="sos"), x)
        x /= np.max(np.abs(x)) + 1e-9
        hi = {"furnace_bed": 500, "cabin": 380, "room": 1200}[name]
        x = _low(x, hi, 2)
        if name == "furnace_bed":
            flick = 1 + 0.35 * _low(rng.standard_normal(n), 3, 1) / 0.05
            x = x * np.clip(flick, 0.4, 1.8)
        fade = int(min(1.2, dur / 4) * SR)
        x[:fade] *= np.linspace(0, 1, fade)
        x[-fade:] *= np.linspace(1, 0, fade)
        return x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.1
    raise ValueError(name)


def _fade(x: np.ndarray, dur: float) -> np.ndarray:
    fade = int(min(1.0, dur / 4) * SR)
    x = x.copy()
    x[:fade] *= np.linspace(0, 1, fade)
    x[-fade:] *= np.linspace(1, 0, fade)
    return x


def place(bus: np.ndarray, x: np.ndarray, t: float, gain: float) -> None:
    i = int(round(t * SR))
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    j = min(len(bus), i + len(x))
    if j > i >= 0:
        bus[i:j] += x[: j - i] * gain


def rms_db(x: np.ndarray) -> float:
    return 20 * np.log10(np.sqrt(np.mean(x.astype(np.float64) ** 2)) + 1e-12)


def loudness(path: Path) -> tuple[float, float]:
    """Integrated loudness (LUFS) and true peak (dBTP) by ffmpeg ebur128."""
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    summary = err[err.rfind("Summary:"):]
    i = float(re.search(r"I:\s+(-?[0-9.]+) LUFS", summary).group(1))
    tp = float(re.search(r"Peak:\s+(-?[0-9.inf]+) dBFS", summary).group(1))
    return i, tp


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("film")
    ap.add_argument("--out")
    args = ap.parse_args()
    film = Path(args.film)
    out = Path(args.out or film / "assets/mix")
    out.mkdir(parents=True, exist_ok=True)
    timing = json.loads((film / "vo/timing.json").read_text())
    A = Anchors(timing)
    n = int(round(timing["durationInFrames"] / timing["fps"] * SR))  # exactly the picture's length

    # ---- voice: peaks at −3 dBFS
    voice = decode(film / "assets/vo/vo_full.wav")[:n]
    voice = np.pad(voice, ((0, n - len(voice)), (0, 0)))
    voice *= db(-3) / (np.max(np.abs(voice)) + 1e-9)

    # ---- speech envelope → duck gain (0 dB in pauses, −10 dB under speech, 0.5 s ramps)
    hop = SR // 100
    frames = np.sqrt(np.mean(voice[: len(voice) // hop * hop, 0].reshape(-1, hop) ** 2, axis=1))
    speech = (20 * np.log10(frames + 1e-9) > -40).astype(float)
    speech = np.convolve(speech, np.ones(25), mode="same") > 0  # bridge gaps under 0.25 s
    duck_db = np.where(speech, -11.0, 0.0)
    ramp = 50  # 0.5 s at 100 Hz
    duck_db = np.convolve(np.pad(duck_db, ramp, mode="edge"), np.ones(ramp) / ramp, mode="same")[ramp:-ramp]
    duck = np.repeat(db(1) ** duck_db, hop)  # 10**(dB/20)
    duck = np.pad(duck, (0, max(0, n - len(duck))), mode="edge")[:n]

    # ---- music bed: each slot at −23 dBFS RMS, faded, ducked
    tracks = {r["title"]: film / r["file"] for r in csv.DictReader((film / "sound/music_manifest.csv").open())}
    score = json.loads((film / "sound/score.json").read_text())
    bed = np.zeros((n, 2), np.float32)
    cache: dict = {}
    for s in score["slots"]:
        t0, t1 = A(s["from"]), A(s["to"])
        if t1 <= t0:
            raise ValueError(f"empty slot {s}")
        if s["track"] not in cache:
            cache[s["track"]] = decode(tracks[s["track"]])
        src = cache[s["track"]]
        off = int(s.get("offset", 0) * SR)
        seg = src[off: off + int((t1 - t0) * SR)]
        if len(seg) < int((t1 - t0) * SR) - SR // 10:
            print(f"  ! {s['track']} runs out {((t1 - t0) * SR - len(seg)) / SR:.1f}s early in slot {s['why'][:40]}")
        seg = seg * db(-23 - rms_db(seg) + s.get("gain_db", 0))
        fi, fo = int(s.get("fade_in", 1.5) * SR), int(s.get("fade_out", 1.5) * SR)
        env = np.ones(len(seg))
        env[: min(fi, len(env))] = np.linspace(0, 1, min(fi, len(env))) ** 2
        env[-min(fo, len(env)):] *= np.linspace(1, 0, min(fo, len(env))) ** 2
        place(bed, seg * env[:, None], t0, 1.0)
        print(f"  {t0:7.1f}–{t1:7.1f}  {s['track']}")
    for r in score.get("rooms", []):
        t0, t1 = A(r["from"]), A(r["to"])
        place(bed, synth(r["what"], 7, t1 - t0), t0, db(r["gain_db"] + 20))
    bed *= duck[:, None]

    # ---- SFX
    sfx = np.zeros((n, 2), np.float32)
    for k, c in enumerate(json.loads((film / "sound/sfx.json").read_text())["cues"]):
        t0 = A(c["at"])
        x = synth(c["sfx"], 100 + k, (A(c["to"]) - t0) if "to" in c else 0)
        x = x / (np.max(np.abs(x)) + 1e-9) * db(-3)
        place(sfx, x, t0, db(c["gain_db"] + 3))

    # ---- quiet zones (v8): the whole mix steps down where the film should breathe (the tragedies, the question), so
    # the loudness range opens up; 1 s ramps; the master's one static gain is applied after
    zone = np.zeros(n)
    for z in score.get("quiet", []):
        i0, i1 = int(A(z["from"]) * SR), int(A(z["to"]) * SR)
        zone[i0:i1] = np.minimum(zone[i0:i1], z["gain_db"])
    k = SR  # 1 s ramp
    if score.get("quiet"):  # moving average by cumulative sum (a 1 s kernel over the whole film)
        c = np.cumsum(np.pad(zone, (k // 2, k - k // 2), mode="edge"), dtype=np.float64)
        zone = (c[k:k + n] - c[:n]) / k
    zg = (10 ** (zone / 20))[:, None].astype(np.float32)
    voice, bed, sfx = voice * zg, bed * zg, sfx * zg

    for name, x in (("voice", voice), ("bed", bed), ("sfx", sfx)):
        wavfile.write(out / f"{name}.wav", SR, x.astype(np.float32))
    mix = voice + bed + sfx
    pre = out / "mix_pre.wav"
    wavfile.write(pre, SR, mix.astype(np.float32))

    # ---- master: one static gain to −14 LUFS, then a −1 dBTP limiter; measure twice
    i0, tp0 = loudness(pre)
    gain = -14 - i0
    final = out / "mix.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(pre), "-af",
                    f"volume={gain:.2f}dB,alimiter=limit={db(-1.5):.4f}:attack=5:release=60:level=false",
                    "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s24le", str(final)], check=True)
    i1, tp1 = loudness(final)
    if abs(i1 + 14) > 0.15:  # the limiter takes a little off: one corrected pass, still one static gain
        gain += -14 - i1
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(pre), "-af",
                        f"volume={gain:.2f}dB,alimiter=limit={db(-1.5):.4f}:attack=5:release=60:level=false",
                        "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s24le", str(final)], check=True)
        i1, tp1 = loudness(final)
    pre.unlink()
    print(f"pre-master {i0:.1f} LUFS, peak {tp0:.1f} dBFS → gain {gain:+.1f} dB → master {i1:.1f} LUFS, true peak {tp1:.1f} dBTP")


if __name__ == "__main__":
    main()

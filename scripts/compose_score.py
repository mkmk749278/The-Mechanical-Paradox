#!/usr/bin/env python3
"""Compose a film's music in code (owner, 2026-11-04: "code-composed score"): an original, licence-clean ambient score
on the film's own clock (PLAYBOOK §12). Deterministic (seeded). Writes a 48 kHz stereo WAV for score_mix.py.

Film 1 (train-wheels): three acts on the chapter starts in vo/timing.json:
  act 1 (curious, precise): a soft pad in D minor, Dm9 – B♭maj7 – Fmaj7 – C6/9, a plucked-string arpeggio as the
        light pulse, a sine bass;
  act 2 (where the cone runs out): darker chords (Dm, B♭maj7♯11, Gm9, A7♭9), the pluck thins, a low filtered
        ostinato rises;
  act 3 (the price, the fix, the landing): the arpeggio returns and builds, then resolves to D major under the last
        line and fades before the sting.
The music drops out before the reveals ("neither one really slips", "Just shape") and returns after.
Measured, since Claude cannot listen: peak, RMS, clicks (sample-to-sample jumps), spectral ceiling; spectrogram PNG.

Usage: .venv/bin/python scripts/compose_score.py films/train-wheels [--out PATH]
"""
import argparse
import json
import re
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT
CHORD = 2 * BAR  # one chord every two bars (6.67 s)
rng = np.random.default_rng(20261104)


def hz(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


def env(n: int, a: float, r: float) -> np.ndarray:
    """Attack/release envelope in seconds (raised-cosine edges: no clicks)."""
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na:
        e[:na] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, na))
    if nr:
        e[-nr:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, nr))
    return e


def lowpass(x: np.ndarray, f: float, order: int = 4) -> np.ndarray:
    return signal.sosfiltfilt(signal.butter(order, f, fs=SR, output="sos"), x)


def pad_voice(m: int, dur: float, detune: float) -> np.ndarray:
    """A warm pad note: three slightly detuned band-limited saws, low-passed."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-detune, 0, detune):
        f = hz(m) * 2 ** (d / 1200)
        ph = 2 * np.pi * f * t + rng.uniform(0, 6.28)
        # additive saw, harmonics kept below 5 kHz
        for k in range(1, int(5000 / f) + 1):
            out += np.sin(k * ph) / k
    return out / 3


def pluck(m: int, dur: float, bright: float = 0.5) -> np.ndarray:
    """Karplus–Strong plucked string (a recursive comb filter on a noise burst)."""
    n = int(dur * SR)
    period = SR / hz(m)
    N = int(period)
    burst = np.zeros(n)
    burst[:N] = rng.uniform(-1, 1, N)
    burst = lowpass(burst, 1500 + 4000 * bright, 2)
    g = 0.996
    a = np.zeros(N + 2)
    a[0] = 1
    a[N] = -g / 2
    a[N + 1] = -g / 2
    y = signal.lfilter([1.0], a, burst)
    return y * env(n, 0.002, 0.25)


def sine_bass(m: int, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.18 * np.sin(4 * np.pi * f * t)) * env(n, 0.8, 1.5)


def reverb(x: np.ndarray, secs: float = 3.2, seed: int = 7) -> np.ndarray:
    """A smooth hall: convolution with exponentially decaying, low-passed noise (stereo-decorrelated)."""
    r = np.random.default_rng(seed)
    n = int(secs * SR)
    t = np.arange(n) / SR
    decay = np.exp(-t * 6.9 / secs)  # −60 dB at `secs`
    ir = np.stack([lowpass(r.standard_normal(n), 6000, 2) * decay, lowpass(r.standard_normal(n), 6000, 2) * decay], 1)
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))
    return np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], 1)


def place(bus: np.ndarray, x: np.ndarray, t0: float, gain: float, pan: float = 0.0) -> None:
    i = int(t0 * SR)
    if i < 0:  # starts before the film: keep only what falls inside it
        x = x[-i:]
        i = 0
    if i >= len(bus) or len(x) == 0:
        return
    j = min(len(bus), i + len(x))
    a = (pan + 1) * np.pi / 4
    bus[i:j, 0] += x[: j - i] * gain * np.cos(a) * np.sqrt(2)
    bus[i:j, 1] += x[: j - i] * gain * np.sin(a) * np.sqrt(2)


# ---- the harmony, act by act (MIDI notes) ----
ACT1 = [[50, 57, 60, 64, 65], [46, 53, 57, 62], [53, 57, 60, 64], [48, 55, 57, 62, 64]]  # Dm9 B♭maj7 Fmaj7 C6/9
ACT2 = [[50, 53, 57, 62], [46, 53, 57, 64], [43, 50, 53, 57, 58], [45, 52, 55, 58, 61]]  # Dm B♭maj7♯11 Gm9 A7♭9
ACT3 = [[46, 53, 57, 60, 62], [45, 53, 57, 60], [43, 50, 55, 58, 60], [45, 52, 57, 62]]  # B♭maj9 F/A Gm11 Asus4
LAND = [50, 57, 61, 64, 66]  # Dmaj9: the resolution


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("film")
    ap.add_argument("--out")
    ap.add_argument("--tail", type=float, default=5.5, help="seconds after the VO (the sting)")
    a = ap.parse_args()
    film = Path(a.film)
    t = json.loads((film / "vo/timing.json").read_text())
    total = t["duration"] + a.tail
    n = int(total * SR)
    words = t["words"]
    norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())  # noqa: E731

    def at(phrase: str, after: float = 0.0) -> float:
        p = [norm(x) for x in phrase.split()]
        for i in range(len(words) - len(p) + 1):
            if words[i]["start"] >= after and all(norm(words[i + k]["w"]) == p[k] for k in range(len(p))):
                return words[i]["start"]
        raise ValueError(phrase)

    ch = {c["title"]: c["start"] for c in t["chapters"]}
    act2 = ch["Where the cone runs out"] - 1.0
    act3 = ch["The price of the cone"] - 1.0
    last = at("That is how a train steers")
    land = at("One solid axle") - 0.5
    end_music = min(total - 1.0, at("no steering at all", last) + 4.5)

    pad = np.zeros((n, 2))
    pl = np.zeros((n, 2))
    bass = np.zeros((n, 2))
    ost = np.zeros((n, 2))

    def chords(t0: float, t1: float, prog: list[list[int]], level: float, level1: float | None = None) -> None:
        k = 0
        tt = t0
        while tt < t1 - 0.5:
            dur = min(CHORD, t1 - tt)
            c = prog[k % len(prog)]
            lv = level if level1 is None else level + (level1 - level) * (tt - t0) / max(1e-6, t1 - t0)
            # long overlaps: each chord crossfades into the next (no dip at the change)
            ln = dur + 3.6
            for v, m in enumerate(c):
                x = pad_voice(m, ln, 6 + 2 * v) * env(int(ln * SR), 2.6, 3.4)
                place(pad, x, tt - 0.8, lv / len(c), pan=(v / max(1, len(c) - 1) - 0.5) * 0.7)
            place(bass, sine_bass(c[0] - 12, dur + 1.0), tt, 0.5)
            k += 1
            tt += CHORD

    def arps(t0: float, t1: float, prog: list[list[int]], level0: float, level1: float, step: float, bright: float) -> None:
        tt = t0
        i = 0
        while tt < t1:
            c = prog[int((tt - t0) // CHORD) % len(prog)]
            notes = sorted(c[1:]) + [c[1] + 12]
            m = notes[i % len(notes)] + 12
            lv = level0 + (level1 - level0) * (tt - t0) / max(1e-6, t1 - t0)
            accent = 1.0 if i % 4 == 0 else 0.7
            place(pl, pluck(m, 1.6, bright), tt, lv * accent, pan=0.35 * np.sin(i * 0.9))
            tt += step
            i += 1

    def ostinato(t0: float, t1: float, root: int, level0: float, level1: float) -> None:
        tt = t0
        i = 0
        pattern = [0, 0, 3, 0, 0, 7, 0, 5]
        while tt < t1:
            lv = level0 + (level1 - level0) * (tt - t0) / max(1e-6, t1 - t0)
            m = root + pattern[i % len(pattern)]
            nn = int(0.24 * SR)
            tone = pad_voice(m, 0.24, 4) * env(nn, 0.01, 0.12)
            place(ost, lowpass(tone, 500 + 900 * (tt - t0) / max(1e-6, t1 - t0), 2), tt, lv, pan=0.2 * (-1) ** i)
            tt += BEAT / 2
            i += 1

    # act 1
    chords(0.0, act2, ACT1, 0.55)
    arps(BAR, act2 - 1.0, ACT1, 0.16, 0.2, BEAT / 2, 0.45)
    # act 2
    chords(act2, act3, ACT2, 0.6)
    arps(act2, act2 + 2 * CHORD, ACT2, 0.12, 0.05, BEAT, 0.3)
    ostinato(act2 + CHORD, act3 - 0.5, 38, 0.10, 0.22)
    # act 3: build, then the resolution
    chords(act3, land, ACT3, 0.45, 0.7)
    arps(act3 + CHORD, land - 0.5, ACT3, 0.10, 0.24, BEAT / 2, 0.55)
    dur_land = end_music - land
    for v, m in enumerate(LAND):
        x = pad_voice(m, dur_land + 3.0, 6 + 2 * v) * env(int((dur_land + 3.0) * SR), 2.5, 5.0)
        place(pad, x, land, 0.6 / len(LAND), pan=(v / (len(LAND) - 1) - 0.5) * 0.7)
    place(bass, sine_bass(38, dur_land + 2.0) * env(int((dur_land + 2.0) * SR), 2.0, 4.0), land, 0.5)
    arps(land + BAR, last - 1.0, [LAND], 0.14, 0.08, BEAT, 0.5)

    pad = lowpass(pad.T, 2600, 2).T
    mix = pad * 1.0 + pl * 0.9 + bass * 0.55 + ost * 1.0
    wet = reverb(mix)
    music = mix * 0.65 + wet * 0.55
    music = lowpass(music.T, 9000, 2).T

    # the drops: out 1.5 s before each reveal, back after it (raised-cosine ramps)
    gate = np.ones(n)
    for out_at, back_at in ((at("neither one really slips") - 1.5, at("The answer is in the shape")),
                            (at("Just shape") - 1.5, at("It even works on straight") - 0.3)):
        i0, i1 = int(out_at * SR), int(back_at * SR)
        r = int(0.5 * SR)
        gate[i0 - r:i0] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, r))
        gate[i0:i1] = 0
        rb = int(1.5 * SR)
        gate[i1:i1 + rb] *= 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, rb))
    # the end: out before the sting
    ie = int(end_music * SR)
    fade = int(4.0 * SR)
    gate[ie - fade:ie] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, fade))
    gate[ie:] = 0
    music *= gate[:, None]
    # opening: in over 2 s
    music[: 2 * SR] *= np.linspace(0, 1, 2 * SR)[:, None]

    music /= np.max(np.abs(music)) + 1e-9
    music *= 10 ** (-6 / 20)
    out = Path(a.out or film / "assets/music/score_v1.wav")
    out.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(out, SR, music.astype(np.float32))

    # ---- measurements (Claude cannot listen) ----
    rms = 20 * np.log10(np.sqrt(np.mean(music[gate > 0.5] ** 2)) + 1e-12)
    jump = np.max(np.abs(np.diff(music, axis=0)))
    f, p = signal.welch(music[:, 0], SR, nperseg=8192)
    cum = np.cumsum(p) / np.sum(p)
    f95 = f[np.searchsorted(cum, 0.95)]
    print(f"{out}: {total:.1f} s · peak −6.0 dBFS · RMS {rms:.1f} dBFS (playing) · biggest sample jump {jump:.4f} "
          f"· 95% of energy below {f95:.0f} Hz")
    print(f"acts: 0 · {act2:.1f} · {act3:.1f} · resolve {land:.1f} · end {end_music:.1f}")


if __name__ == "__main__":
    main()

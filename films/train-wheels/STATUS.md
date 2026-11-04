# Film 1 status and handoff (2026-11-04, evening)

**Done:** research, claims (31 rows, gate passes), brief, treatment, **VO v6 locked** (`script/vo.txt`; audience
reviews v3–v5), screenplay (23 beats), recording blocks (`script/blocks_performance.md`).
**VO recorded (2026-11-04):** the account's voice "The Mechanical Paradox" (`q8DzlbH6OkvKn06IxgiA`), Eleven v4
(owner: v4 and always the newest Eleven after it; `scripts/eleven_tts.py`), stability 0.50, similarity 0.80, style 0,
speaker boost, two takes a block (seeds 1101, 2202). Kept: b01 t1, b02 t1, b03 t2, b04 t1, b05 t1, b06 t1
(`scripts/vo_review.py`: every word as written; b02 t2 rejected, 3.9 semitones high). v4 ignores `speed`, so the pace
is set by edit breaths in `scripts/vo_timing.py`: **379.4 s, 162 wpm, 6 chapters** (0:00, 0:54, 1:11, 2:54, 4:13,
5:52); 90 joins measured clean. `vo/timing.json`, `vo/timing.md`, `vo/captions.en.srt` in git; all 12 takes with
sidecars in Drive `train-wheels/vo/takes/`, `vo_full.wav` in Drive `train-wheels/vo/`. Characters used: 11,895
(10,850 for the 12 takes, 1,045 for the speed and model tests).
**Picture:** `remotion/cues.ts` now reads `vo/timing.json`. s07 the bank card (`TW-BankCard`) re-checked on the
recorded clock; HUD overlap, clipped value and scale note fixed (stills at frames 300, 900, 1100, 1700 reviewed).

**For the owner's ear:** b05 "The cone that keeps your train centered also makes it sway." Speech-to-text hears
"makes its sway" in both takes. At this pace the two run together, so it is probably fine, but only an ear can
settle it (`vo_full.wav` at 4:14).

**Next session, in order:**
1. Build the scenes in `scenes/README.md` order of risk: s12 hunting (signature 3), s06 drift and apex cone
   (signature 4), s02 rail race (signature 2), then the rest; a handoff doc before each. Cue every scene to phrases
   (`cue.at`), checked against `vo/timing.md`.
2. Full film composition on `vo/vo_full.wav` (copy to `public/films/train-wheels/` at build time; gitignored);
   720p farm render; picture gate (§14.2).
3. Re-open the Tanifuji record (C24) when the Niigata repository is up (503 again on 2026-11-04).

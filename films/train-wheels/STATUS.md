# Film 1 status and handoff (2026-11-05, review cut v4 after the independent viewer review; YouTube package)

**Done**
- Research, claims (31 rows; gate passes: 30 confirmed, 1 disputed and worded as such), brief, treatment, VO v6.
- **VO recorded and approved by the owner** (no re-recordings): Eleven v4, the channel voice, 379.4 s, 162 wpm
  (`vo/timing.json`; Drive `train-wheels/vo/`).
- **Picture: all 15 scenes built and assembled** in `TW-Film` (`remotion/Film.tsx`): 22,765 frames of VO + the
  330-frame channel sting = 23,095 frames (6:24.9). Stills of every scene reviewed at its key words; a 52-frame
  contact sheet of the whole film reviewed. 3D wheelset lathed from the true profile (`Wheelset3D.tsx`,
  research/visual_refs.md); every number on screen from `model.ts` / `profiles.ts` with numeric checks in code.
- **Sound:** 77 SFX cues exported from the picture code (`sound/sfx.json`), this channel's foley synthesized in
  `scripts/score_mix.py`, the sub-bass drone bed (`sound/score.json`); master −14.1 LUFS, −1.1 dBTP (VO + SFX + bed).
- **Farm render started** (with the footage): 720p review cut, `train-wheels_review_720p_v1.mp4` → Drive
  `train-wheels/renders/`.

**Owner, 2026-11-04: real footage.** Nine Pixabay clips (Pixabay Content License, `media_manifest.csv`), 2–5 s inserts
where the narration names the real thing (`remotion/Footage.tsx`), graded to the palette and credited on screen. Files
in Drive `train-wheels/render-media/footage/` (a stray partial `he.mp4` there is unused; safe to delete).

**Music: done (Lyria 3.5, 2026-11-04).** Two takes per act made with `scripts/lyria_music.py` (7 calls, 6 songs,
$0.56; one prompt blocked and reworded), picked by measured contour; voices checked with Whisper (no words) and
the PANNs AudioSet tagger (Choir, Singing, Humming all < 0.05; Speech 0.13 at most, act 1 at 0:54). The library's two
Gemini listeners (§12.1) could not run: the project hit its monthly spending cap. **A person must listen once**, act 1
around 0:54 first; take 1 of each act used (`sound/music_manifest.csv`,
`media_manifest.csv`; all six in Drive `train-wheels/music/`). Placement in `sound/score.json`: drops 1.2 s before
"neither wheel really slips" and 1.0 s before "Just shape"; act 2 stops dead before "That is one way a train comes off
the track"; act 3 releases after "until the flanges hammer the rails"; out 0.5 s before the sting. Mix rebalanced by
K-weighted loudness: bed 14.5 dB under solid speech (median), effects 13.4 dB, `glass_tone` −6 dB; master −14.1 LUFS,
−1.4 dBTP. `mix.wav` in Drive `train-wheels/mix/` (the previous one kept as `mix_v1_no_music.wav`).

**Review cut v1** (`train-wheels_review_720p_v1.mp4`, run 41810631645): 6:24.9 at 60 fps, audio = the new mix
(correlation 1.000), −14.1 LUFS, −1.2 dBTP, channels equal; no black frames. **Picture gate on v1** (a frame every 2 s
with the words heard, then full-size stills) found and fixed, all re-checked in stills:
- "CENTRE" on screen in s06, s08, s12 → "CENTER" (American spelling).
- s09 opened on bare axes for ~4 s: the curve panel now arrives on "But shape has a limit" with sleepers running
  under the wheelset, follows the HUD's CURVE R (3,000 m, then 500 m when named), and its rails sit under the treads
  (they ran inside the flanges: contacts did not touch).
- Labels the narration names were 26 px → 36 px: KLINGEL · 1883, GEORGE STEPHENSON · BY 1821 (also moved off the
  flange-limit line and out before Klingel's dimension line), NADAL · MORE THAN A CENTURY AGO, JAPAN'S BULLET TRAINS
  USED IT. The ONE WAVE dimension line no longer strikes through its text.
- Footage credits get a low scrim (the credit vanished on the snow insert).
- Holds just over 1.5 s at 1:30.0, 2:38.3, 4:10.4 (1.55–1.67 s, under the 2.5 s limit): the last two are the held
  beats before "Just shape" and after the derailment line; left as they are.
**Review cut v2** (`train-wheels_review_720p_v2.mp4`, run 41843338969): the fixes above; 6:24.9, −14.1 LUFS,
−1.2 dBTP, no black frames. Superseded before review by the Blender shots.

**Blender hero shots (owner, 2026-11-04: "Film 1 now"; PLAYBOOK §10.6).** Three moments become Cycles plates
rendered on GitHub's runners: s01 the cold open's wheelset (812 frames), s03 the tread lighting amber on "the shape of
the wheel" (696), s15 the landing's hero wheelset (1,054). Their 3D state is in `remotion/shots3d.ts` (the same driver
as the HUD); the blueprint lines stay live three.js over the plate. Look settled on test frames: turned steel with
lathe rings, studio reflections, polished rail running band, Standard view (AgX turned the amber peach). **Rendered:**
run 41859965297 (`blender-render.yml`, 1080p, 16 samples, 23 jobs, all green; the bend's aerial frames took ~110 s each),
2,562 of 2,562 frames; packed one tar per shot in Drive `render-media/plates_tar/` (single frames kept in
`plates-frames/`). Checked in the composite at key frames of every shot: plate, live lines, callouts and HUD aligned;
the s03 glow on "the shape of the wheel"; the s15 axle and slope beats. "OUTER RAIL: FARTHER TO GO" now sits on two
lines clear of the bend (the rail crossed "GO").

**Review cut v3** (`train-wheels_review_720p_v3.mp4` in Drive `train-wheels/renders/`, run 41905950494, 15/15 jobs
green): the three Blender shots in. Gate: 6:24.9, −14.1 LUFS, −1.2 dBTP, no black frames; holds only the three known
deliberate ones (1:30.0, 2:38.3, 4:10.4); frame-to-frame motion measured through every plate shot: no stuck or missing
frame (isolated near-identical single frames only in the footage insert at 0:09, at scene changes, and once in the
slow final roll-away).

**Independent viewer review of v3 (2026-11-05)** (`review/viewer_v3.md`, checked point by point in
`review/viewer_v3_check.md`): needs fixes. 8 points confirmed, 2 partly or with another cause, 2 not confirmed. Fixed:
- The tight-curve plan view (3:24) had its axle along the track, 90° off. It now lies on the radius, with a numeric
  check in code.
- The opening clip `f01` was 25i flagged progressive (combing); it is deinterlaced to 50p in Drive, original in
  `footage-originals/`.
- Holds over 2 s, measured with `freezedetect`: motion added at 0:37, 2:14, 2:38, 4:09, 5:42 and 5:46.
- The empty grid at 5:20; label collisions at 5:24 and 5:28; the clipped label at 3:30; the Klingel label at the top
  edge; the Nadal formula outside the central 90 %.
- The 1:03 camera move (grey slab); the landing bogie (axles within the ±7 mm play, camera turned, tag ILLUSTRATION);
  the 6:02 ghost dissolve, now a dip through the dark.
- The pen-scratch cue follows the 1:20 line (5:20). The mix was remade: it differs only at 5:20.2–5:22.1, −14.1 LUFS.
  `mix.wav` is in Drive, the previous one kept as `mix_v3.wav`.

**Review cut v4** (`train-wheels_review_720p_v4.mp4` in Drive `train-wheels/renders/`, run 41975965565, all green):
6:24.9, −14.1 LUFS, −1.2 dBTP. No hold over 2 s (the longest is the 1:29.3 cone close-up, 2.45 s, under the 2.5 s
limit). Dark-canvas breaths under 1 s at five scene changes (0:13.5, 2:27.4, 2:53.4, 5:19.6, 6:19.6) and the planned
0.15 s dip at 6:02; no true black. Every fix seen in the cut's own frames.

**YouTube package (§13.7): done except the owner's upload** (`youtube/`):
- `package.md`: title and two alternatives, the thumbnail rationale, settings (synthetic-content disclosure Yes,
  tags, pinned question, end screen, playlist, launch) and the cut list for three Shorts.
- `description.md`: chapters from the locked VO.
- `train-wheels.en.srt`.
- Three thumbnails (`thumb_main_no-steering.jpg`, `thumb_b_0-7mm.jpg`, `thumb_c_real-screech.jpg`, also in Drive
  `train-wheels/youtube/`): Blender stills of the film's own wheelset (`shots3d.ts` thumbA/B/C, run 41973290368, 2560
  px, 128 samples), words in `Thumbs.tsx`. Squint-tested at 168 and 120 px beside 8 competitors from the same search
  (`review/thumbs_squint_168.png`).

**Next session, in order**
1. The owner's review of v4 in `mkmk749278/Review` (the forensic protocol, in a new session with only that repo).
2. Build the three vertical Shorts from the cut list (1080×1920 compositions over the same scenes).
3. After the owner approves the cut: the 4K master (plates again at width 3840; about two Blender runs, then
   `remotion-render.yml` at scale 2).
4. When the Gemini cap resets: the two listeners on the three act tracks. A person listens once, act 1 around 0:54
   first.
5. Re-open the Tanifuji record (C24) when the Niigata repository is up.

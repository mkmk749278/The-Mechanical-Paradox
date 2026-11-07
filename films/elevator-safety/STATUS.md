# Film 2: the elevator that brakes itself · status

**Now:** step 8, the independent viewer panel is watching cut v2 (`elevator-safety_review_720p_v2.mp4`, run
42394563981) in a fresh no-repo session (session_014pFs6ot4gFVPBhrJxZDJXj, `prompts/viewer_review_v2.md`), from 20
parts of 20 s in Drive `elevator-safety/renders/v2_parts/` (the connector downloads at most 10 MB a file, PLAYBOOK
§3a.3; the first panel session stopped on the 101 MB file and was archived). **Next action:** read its report
(list_events on that session), save it as `review/viewer_v1.md`, check each note in code, timing and a still
(`review/viewer_v1_check.md`), fix every confirmed must-fix, render v3, a fresh panel; archive the panel session.
**Renders:** dispatch `remotion-render.yml` with `film: elevator-safety` (the slug, not `films/elevator-safety`: run
42388168391 failed on that), `comp: EL-Film`, `scale: 2/3`, `tail_frames: 330`, `runners: 20`. **Drive:**
`The-Mechanical-Paradox/elevator-safety/` (cuts in `renders/`, mix in `mix/`, footage in `render-media/footage/`).
**For a person, once:** the six library tracks have passed both Gemini listeners but no person has heard them in a film
yet (§12.1); the owner hears them in the cut.

- [x] 1 Topic picked (gate 38/40, brief.md)                    PR (this one)
- [x] 2 Research, claims, treatment, script                  PR (step 2)
- [x] 3 Story review (3 rounds: 7.8 → 7.8 → 8.0)              PRs #34, #35, this one
- [x] 4 Story and script fixed; bar met (VO v5)              this PR
- [x] 5 Narration review; fixes in (VO v6 locked)            this PR
- [x] 6 Voice: block 1 measured, all blocks measured (394.3 s, 154 wpm)   this PR
- [x] 7 Film built: 16 scenes, 3 footage inserts, mix (−14.2 LUFS, −1.4 dBTP)   PRs #39, #41, #42, this one
- [ ] 8 720p cut v1 gated (3 fixes), cut v2, viewer panel running   PR #44, this one
- [ ] 9 Fixes, cut vN, fresh panel; no must-fix              PR #
- [ ] 10 4K master gated, on Drive                           PR #
- [ ] 11 Package: titles, thumbnails, click test, description, tags, SRT   PR #
- [ ] 12 Shorts; ready to upload                             PR #

## Log
- **2026-11-07, step 8, cut v1 → v2.** v1 (run 42391160332): 6:39.8, 60 fps, −14.2 LUFS, −1.3 dBTP, channels equal,
  no black frames. The gate (200 frames, one every 2 s, read beside the words) found three: "CAR KEEPS FALLING" under
  the HUD at 1:31 (now left of its arrow), "MARKS GROUND SMOOTH" and "RELEASED BY RAISING THE CAR" crossing at 4:39
  (now a clean handover), and the mine count showing "0" and one tally mark before the strike at 5:43 (both now start
  on the strike). v2 (run 42394563981): the same measurements; the three frames checked in the cut.
- **2026-11-07, step 7 closed (contact sheet, footage, sound).** The 52-frame contact sheet of EL-Film and full-size
  stills found and fixed: s04 "SPRINGS HOLD THEM IN" and the catch's "≥ 115 %" clipped at the left edge (the speed now
  36 px in the callout, "CATCH · ≥ 115 %"); s11 "≈ 2 × YOUR WEIGHT" and its note clipped at the right edge (now
  right-aligned at the safe margin; "0.2 g · NOT TOO GENTLY" moved left of the scale so they don't meet); s12 the axis
  title ran into "THE SPRINGS DECIDE" ("SQUEEZE ↑"); two honesty tags stacked in every dissolve (tags now clear 2 frames
  before the next scene arrives); s07 the wedges had no name on "steel wedges" ("STEEL WEDGES · ONE EACH SIDE"). **s15
  redesigned:** "Does that really happen? … at least eighteen hit the top" sat 8 s on faint empty boxes, an icon grid
  the look bans; it is now the top of a mine shaft, an empty car accelerating up from rest (constant acceleration, so
  faster and faster) into the overhead beam on "In just five years", the strike a stress field in the beam with a
  shudder, the count 1 → 18 scored into the beam's face, and on "a brake that faces up" amber wedges at the car's top
  corners. **Footage (§8.8):** three Pixabay inserts (`remotion/Footage.tsx`, `media_manifest.csv`): glass cars running
  their rails in an atrium on "Your car runs between steel guide rails", a ride with the floor indicator ticking on
  "Picture an ordinary office elevator", landing doors closing on "elevator doors close on you" (the clip played in
  reverse, logged). **Sound:** 74 cues from the picture code (`sound/sfx.json`); music from the library
  (`sound/score.json`, `music_manifest.csv`): bp01 under the cold open, silence 1 s before "Your own fall pulled the
  brake", bp01 again for the governor, bp02 for the lever and wedges dropping before "Your fall is feeding its own
  brake", bp03 for the doubt (10 g, Otis, the rules), bp05 for the spring dropping before "So the wedge grabs", bp04 for
  the danger upward stopping dead before "It does.", nothing under the mine numbers, bp05 for the brake that faces up,
  bp10 for the landing, out before the sting. Balanced by K-weighted momentary loudness: the drone (not the music) set
  the bed under speech, so it went to −23; bed a median 14.7 dB under solid speech, effects 12.5 dB, the governor's lock
  the one deliberate hit over the voice. Master −14.2 LUFS, −1.4 dBTP, 399.8 s (VO + sting); `mix.wav` in Drive
  `elevator-safety/mix/`.
- **2026-11-07, step 7, group 3 (s12–s16) + Film.tsx.** s12 the spring (clamp trace rises then flat; straight speed
  line; stops 0.20/0.34/1.02 m), s13 the rail scraped, ground smooth, released by raising, built to slip, s14 the
  counterweight (balance tips; empty car runs up at 1.8 m/s², MODEL), s15 the wedge pulled out going up, 18 overhead
  strikes, the brake that faces up, s16 landing. `Film.tsx` assembles all 16 with dissolves and the sting (EL-Film,
  6:34 + sting). Paused here for the usage limit (owner, 2026-11-07); a scheduled fresh session continues.
- **2026-11-07, step 7, group 2 (s07–s11).** `Wedge.tsx`: the gear on one rail in mm (8° slot, 3 mm gap, spring-backed
  jaws); `model.wedgeState` checked (contact at 21.3 mm climb, springs full 21.3 mm later). s07: the rail stands still,
  the rail holds the wedge back, climb = housing drop after contact, squeeze arrows grow, the feedback loop (fall →
  friction → climb → squeeze); s08 the question; s09 2 m/s to rest in 2 cm = 10.2 g, a stress field up from the car
  floor; s10 Otis 1854 after US 31,128 (spring flattens, hooks bite the racks) and the 0.63 m/s dial; s11 the 0.2–1 g
  band against 10 g and "≈ 2 × your weight". Fixed in review: labels under the HUD, a dial faded with the drawing it
  sat in, overlapping labels.
- **2026-11-07, step 7, group 1 (s01–s06).** Shared drawing kit promoted to `lib/remotion/kit.tsx` (film 1's own copy
  untouched); `remotion/model.ts` mirrors `research/model.py` and checks every mechanism at import (trip window, fall
  0.204 s / 0.54 m, stops 0.20–1.02 m, 10.2 g, flyweights reach the latch exactly at 2.0 m/s and stay clear at
  1.6 m/s, 127 rpm, lever angle = car travel past the stopped rope, 8° slot). `Shaft.tsx`: the section in world
  metres through a camera; `camera.ts`: one continuous move. Scenes: s01 cold open (snap with frayed ends, the ghost
  falling the building strip, slow motion ×8 fall on one driver, crane to the machine, down the amber rope to the
  lever, into the gear), s02 ropes, s03 governor and its loop, s04 flyweights catching, s05 the car pulls its own
  lever, s06 pure mechanics and EN 81-20. Stills reviewed at key words; fixed: invisible ghost, empty frame, tiny
  lever, a callout pointing at a sheave as "computer", callouts over the HUD.
- **2026-11-07, step 6.** Voice: the channel's voice on eleven_v4 (the newest flagship offered), same voice as film 1
  (pitch −0.3 st, timbre 0.004 vs a film 1 take). Block 1 measured first (100 % words, 169 wpm raw, no drift), then
  all 8 blocks × 2 takes. "Elisha Otis rode" came back as "Alicia Otis wrote": "rode" → "stood on" and the name
  respelled for the voice only (`script/say.json`); both models then hear "Elisha Otis". Takes chosen for no flat
  windows and least drift: b01 t2, b02 t1, b03 t1, b04 t2, b05 t1, b06 t1, b07 t2, b08 t1. `vo/timing.json`: 394.3 s,
  110 sentences, 1,011 words, 154 wpm; 0 sentences to check; joins −66 dBFS. Audio in Drive `elevator-safety/vo/`.
- **2026-11-07, step 5.** Narration panel (`review/narration_v1.md`): 8/9/7/8/7, "Nearly ready"; nobody would leave.
  VO v6 (locked): the code numbers said as a feeling first, the false ending turned into the promised payoff, the
  rope-and-lever link made audible, Otis and the mines shortened, plainer words ("kicks in", "scrape"). 1,030 words.
  Claims C04, C05, C07, C22 updated; both gates pass; recording blocks regenerated.
- **2026-11-07, steps 3–4, round 3 (bar met).** Fresh panel (`review/audience_v3.md`): 8/9/7/8/8 (avg 8.0), nobody
  below 7, all would watch the next film. VO v5 fixes the rope-attachment contradiction ("hooked to a lever on your
  car"), the step-out logic, the reassurance, the gravity limits and the buried rail cut; adds "It does not care why
  you are too fast". Claims C01, C02, C04, C10, C12, C22 updated; both gates pass. Story locked for the narration
  review.
- **2026-11-07, steps 3–4, round 2.** Fresh panel (`review/audience_v2.md`): 8/9/7/8/7 (avg 7.8), all would watch the
  next film, "Almost ready"; the engineer re-checked every number. Both near-leavers drifted at the cable detour. VO
  v4: the opening cut to the snap, the wrong model ("You might expect to fall all the way down") and one teaser line;
  the rail stands still; the g limits said simply, with "about twice your own weight, for a moment"; wedges on each
  rail; the mine study introduced; "for example" for the upward brakes; a calmer ending. Claims C04, C13, C18, C29
  updated; both gates pass.
- **2026-11-07, steps 3–4, round 1.** Panel (`review/audience_v1.md`): satisfaction 8/9/7/8/7 (avg 7.8), stars
  4/5/4/4/4, all five would watch the next film; nobody would leave; the rewind line, by all five: "the falling car
  pulls its own brake lever". Fixes in VO v3: the cold open rewritten (the panel's version plus the wrong model); the
  spoiled quiz becomes "So why not let it grab as hard as it can…? It is not."; the false ending becomes "But there is a
  catch"; "the work of the springs" dropped (springs store energy); "fairly steady" slowing, load-dependent; jargon
  out (traction, rated at, pneumatic); the mine study named as mine elevators; the upward fix explained (the governor
  watches both ways). Claims C02, C20–C22, C27, C29 updated; gate passes; English check passes.
- **2026-11-07, step 2.** Sources (`research/sources.md`): EN 81-20:2020 clauses from the AS 1735.1.2 preview,
  manufacturers' manuals (Bode, SLC, Wittur, PFB), patents (Otis ×2, KONE, Otis 1861), Britannica and Elevator World
  (1854), MSHA (the upward danger). `research/model.py` derives every MODEL number with asserts. `claims.csv` 29/29
  confirmed, the gate passes. Treatment: angle "the brake built to slip", the counterweight as the twist, three
  signature moments. VO v2 passes the spoken-English check (1,038 words, 3.1 "you" per 100, 13 % questions).
- **2026-11-07, step 1.** Eight candidates scored (brief.md); search demand measured in the US, UK and India
  (`research/demand/`). The elevator won at 38/40: three autocomplete forms of "what happens if an elevator cable
  snaps" in every market, and the top 18 long results have under 1,600 views each.

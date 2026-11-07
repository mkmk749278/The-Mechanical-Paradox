# Film 2: the elevator that brakes itself · status

**Now:** step 7, build the film. **Next action:** build the scenes on `vo/timing.json` (394.3 s): the shaft, the governor, the wedge gear, the 10 g
shot, the counterweight; Blender plates on the runners with `runners: 10`; music from the library. Check finished panels directly after ~2 min (a clean finish sends no notice). Script is about 1,030 words (≈ 6:40 at 160 wpm): trim where
the panel drifts.
**Running:** nothing. **Drive:** `The-Mechanical-Paradox/elevator-safety/`.
**Renders:** `runners: 20` on every dispatch (owner, 2026-11-07: all 20 free; decision 16 updated).

- [x] 1 Topic picked (gate 38/40, brief.md)                    PR (this one)
- [x] 2 Research, claims, treatment, script                  PR (step 2)
- [x] 3 Story review (3 rounds: 7.8 → 7.8 → 8.0)              PRs #34, #35, this one
- [x] 4 Story and script fixed; bar met (VO v5)              this PR
- [x] 5 Narration review; fixes in (VO v6 locked)            this PR
- [x] 6 Voice: block 1 measured, all blocks measured (394.3 s, 154 wpm)   this PR
- [ ] 7 Film built: group 1 (s01–s06) merged; s07–s16 next    PRs: group 1
- [ ] 8 720p cut v1, picture gate, viewer panel              PR #
- [ ] 9 Fixes, cut vN, fresh panel; no must-fix              PR #
- [ ] 10 4K master gated, on Drive                           PR #
- [ ] 11 Package: titles, thumbnails, click test, description, tags, SRT   PR #
- [ ] 12 Shorts; ready to upload                             PR #

## Log
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

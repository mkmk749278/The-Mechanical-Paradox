# Film 1 scenes (VO v5)

One handoff doc per scene (PLAYBOOK §10.3) before it is coded. Frames come from `vo/timing.json` through phrase cues
(`lib/remotion/timing.ts`); until the VO is recorded, `vo/timing.provisional.json` (150 wpm, `scripts/provisional_timing.py`)
stands in, so no scene code changes when the real timing lands. Geometry and numbers: `remotion/model.ts` (the
formulas, checked against `research/model.py`) and `remotion/profiles.ts` (wheel and rail sections, contact solver,
checked: contact radius = r0 + λy to 0.02 mm, flange play 7.04 mm).

| # | Scene | VO (opening words) | Picture | Status |
|---|---|---|---|---|
| s01 | Cold open: the axle | "On most trains, each pair of wheels…" | The wheelset alone, lit, spinning; the track draws in under it as a bend; the outer contact's path visibly longer | to build |
| s02 | The rail race (signature 2) | "Take a bend that turns the track…" | Top view, quarter turn: two contact dots leave together, the outer rail unrolls a crimson +2.36 m ribbon; a wide and a tight bend give the same 2.36 m; the locomotive in line art; a car differential ghosted and struck | to build |
| s03 | The promise | "The answer is in the shape…" | The wheel section turns; three glyphs open the loops: the cone, the screech waveform (cut short), the wave | to build |
| s04 | The flange myth | "So what steers it?" | The flange lit amber; the camera dips to the gap on a gentle curve: daylight, FLANGE GAP 7 mm | to build |
| s05 | The cone | "Look closely at the tread…" | Macro on the tread profile; the 1:20 slope drawn as a 20 mm run and 1 mm rise at true scale | to build |
| s06 | The drift and the apex cone (signature 4) | "Now watch the axle enter a curve…" | Top view: the centred axle rolls straight, the rails bend away, it drifts out; contacts slide on the cones; the two rolling circles extend into one ghost cone whose tip lands on the curve centre | to build |
| s07 | The bank card (signature 1) | "How big is that difference?" | `remotion/BankCard.tsx`: true-scale contact sections, full 7 mm shift, the two radii laid side by side, rack-in to 400 px/mm, the card slides in thicker | **built, stills reviewed** |
| s08 | Self-centering | "It even works on straight track…" | Top view, straight track: a nudge, the near wheel grows, an emerald restoring yaw | to build |
| s09 | Where the cone runs out | "But shape has a limit…" | Curve map: R 500 m needs 15 mm, has 7 (crimson overlap); a radius sweep, the emerald band ends at 1,071 m | to build |
| s10 | The screech | "And on a really tight curve?" | Top view, angle of attack, flange pressed; tread contact sliding sideways in crimson; stick-slip pulses; the wheel rings in a modal shape (ILLUSTRATION) | to build |
| s11 | Nadal's limit | "On tight curves, the flange does the hard work…" | Flange–rail section: Y (crimson) and Q (cyan) arrows, Y/Q climbing to about 1; past it the wheel lifts (ILLUSTRATION) | to build |
| s12 | Hunting (signature 3) | "And here is the twist…" | Top view: overshoot; the axle centre draws a sine on the grid; Klingel's L = 2π√(b0 r0 / λ) builds term by term; 17.2 m; 2.58 Hz at 160 km/h | to build |
| s13 | Critical speed | "Why don't you feel it?" | Speed passes critical, amplitude grows, flanges strike: crimson stress bloom at the flange root | to build |
| s14 | The fix and the trade-off | "Fast trains have a fix…" | 1:20 and 1:40 profiles overlaid (NOT TO SCALE); the axle held stiff in its frame; split: steep cone takes the tight curve, flat cone runs calm | to build |
| s15 | Landing | "So the next time you hear that screech…" | A bend at night in line art, the screech, the contact glowing crimson; pull back to one axle, two wheels, the slope as the last amber line; the ChannelSting | to build |

# s06 · The drift and the apex cone (signature 4) · s08 · Self-centering

- **scene_id:** `TW-S06-Drift`, `TW-S08-SelfCentre` (`remotion/Drift.tsx`).
- **duration_in_frames:** s06 from 36 frames before "Now watch the axle enter a curve" to the bank card (2,484
  frames); s08 from 36 before "It even works on straight track" to s09 (665 frames).
- **audio_timestamps:** s06: "it rolls straight on" (ghost path) · "so it drifts a few millimeters" (y → 3.2 mm) ·
  "toward the outside of the bend" (outward arrow) · "onto its fatter part" / "onto its thinner part" (labels, bands)
  · "a bigger circle" / "a smaller one" (rolling circles) · "Same spin" (one turn each) · "different distance"
  (bracket) · "It keeps drifting until" (y → 5.0 mm) · "just big enough" (tread glow) · "Now neither wheel really
  slips" (apex) · "follows the curve by itself" (the cone rolls). s08: "nudge" · "gets bigger" · "steers itself back".

## visual_direction
- **Model.** C31: equal radii roll equal distances, so the wheelset goes straight while the rails curve away; C07:
  outer contact on the fatter part, inner on the thinner, r = r0 ± λy; C13: it settles at y = b0 r0/(λR) = 5.0 mm
  on the example 1,500 m curve; C27: the two rolling circles then fit one cone whose apex is the curve's centre.
- **Layout.** Left: top view, curve drawn at 6 m (`NOT TO SCALE · CURVE DRAWN TIGHTER`), camera following, the
  dashed "straight on" path and ghost wheelset, the outward arrow on the true outward normal. Right: the two contact
  sections at true scale (2 px/mm, `Sections.tsx`, the contact solver), labels in a stack above the steel; for "bigger
  circle … different distance" the column becomes two rolling circles (exaggerated, `NOT TO SCALE`) that each turn
  exactly once and cover different distances.
- **Apex (full frame).** Concentric rails round the curve's centre; wheel diameters drawn in proportion to the radii
  they roll on (exact by construction, exaggerated: `NOT TO SCALE · CURVE AND CONE EXAGGERATED`); the cone's edges
  extend from the wheels and meet on the centre cross; then the cone rolls round its apex along the curve.
- **HUD** `ON A CURVE`: CURVE R 1,500 m (C13), SHIFT y (C13), OUTER r / INNER r (C10), NEEDED y 5.0 mm (C13), all on
  the picture's driver; ends as the apex shot begins. s08 `WHEELSET`: r0 (C10), PLAY ±7 mm (C09); the true
  millimetres on the gauge (no number on screen for the illustrative 3 mm nudge).
- **s08** ends as the axle reaches the middle: whether it stops there is s12's twist.
- **Checks in code:** y needed = 5.0 mm, apex distance = 1,500 m, Δr = 0.50 mm.

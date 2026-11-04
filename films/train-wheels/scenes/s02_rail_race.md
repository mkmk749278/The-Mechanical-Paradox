# s02 · The rail race (signature 2), the locomotive and the differential

- **scene_id:** `TW-S02-RailRace` (`remotion/RailRace.tsx`); 1,754 frames, from 36 before "Take a bend" to s03.
- **audio_timestamps:** "Take a bend" (the bend draws) · "through a right angle" (the 90° mark) · "Here is the part
  you might not expect" (the race: same spin, the inner contact finishes, the outer is short by a crimson ribbon, the
  axle line skews) · "Wide or tight" (the radius swings tight and wide; the ribbon keeps its length) · "two point four
  meters longer" (+2.36 m) · "one-hundred-ton locomotive" (line drawing, ≈ 100 t) · "has nothing to fix that" (its
  four wheelsets glow) · "No steering" · "no differential gears" (a car's differential draws) · "the box that lets"
  (it works: the outer tyre turns faster) · "outer wheel spin faster" (struck through; one solid axle beside it) ·
  "if you could watch the wheels" (the race again, the outer contact on a bigger circle) · "neither one really
  slips" (both finish together, emerald).

## visual_direction
- **Geometry.** Outer minus inner path = 2·b0·θ for any radius (C04): 2.36 m for 90°. The drawing is exact in its
  own scale with the gauge drawn wide (`NOT TO SCALE · GAUGE DRAWN WIDE`), so the ribbon's length really stays fixed
  as the radius changes. WIDE / TIGHT are words, not numbers (no radius claimed).
- **Locomotive.** Generic box-cab electric, 19.6 m body, two two-axle bogies, single-arm pantograph lowered, louvres,
  cab windows; no make, no livery (`GENERIC LOCOMOTIVE · LINE DRAWING`); ≈ 100 t and HUD LOCO 98 t (C01).
- **Differential.** Top view: tyres, half-shafts, housing, side and spider gears as bevel sections, the drive in;
  the outer tyre's marks run 1.25× the inner (illustrative rate, no number); struck through in crimson. Beside it the
  wheelset from above: one solid axle (C02, C05).
- **HUD** `THE BEND`: TURN 90° (C04), b0 0.75 m (C04), OUTER + 2.36 m (C04), LOCO 98 t (C01); note `MODEL`.
- **Check in code:** the path difference is 2.356 m.

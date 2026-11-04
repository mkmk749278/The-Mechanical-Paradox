# s07 · The bank card (signature 1)

- **scene_id:** `TW-BankCard` (`remotion/BankCard.tsx`)
- **duration_in_frames:** from 40 frames before "How big is that difference" to 50 frames after "Just shape"
  (`bankCardSpan()`; 1,748 frames, 29.1 s on the recorded VO, 2:13.0–2:42.1).
- **audio_timestamps (cues):** "How big is that difference" · "You might guess centimeters" · "Take the textbook
  version" · "If you shift it" · "seven tenths" · "seven tenths of a millimeter" (end) · "bank card" · "the whole
  steering system" · "Just shape".

## visual_direction
- **Shot A, true-scale sections (3 px = 1 mm).** The inner and outer wheel sections over their rails, the axle broken
  out between them (drawing convention; track centre dashed). Wheels cut through the axle plane: rim and web, steel
  gradient, section hatch; rails hatched, inclined 1:20. Rolling radii in amber from the axle centre (off frame) to the
  contact dots; live readouts `r 500.00 mm` (36 px). Caption: `10 mm · TRUE-SCALE SECTION / GENERIC WHEEL AND RAIL
  PROFILES` (honesty: the flange shape is generic, the scale is true), bottom-right. The panels sit left of centre
  (inner rail at x 480, outer at 1040) so the outer wheel clears the 440 px HUD column at full shift (2026-11-04: the
  first build ran the wheel behind the HUD).
- At "You might guess centimeters": a crimson dashed 2 cm bracket beside the outer contact, `2 cm?`, gone when the
  shift starts.
- **Semantic lock:** at "If you shift it" the wheelset springs (channel spring, damping 26) 7 mm toward the outside of
  the bend; the contact dots slide across the cones; the readouts tick to 499.65 / 500.35; FLANGE GAP 7.0 → 0.0 turns
  crimson and a soft crimson bloom sits at the gauge corner (never an icon).
- **Shot B, the rack-in.** At "seven tenths" − 34 frames: the two radii hang side by side from the axle-centre datum;
  the scale racks on a log path from 0.95 to 400 px/mm (a 1 mm scale bar appears); the 0.70 mm dimension completes as
  "millimeter" lands. At "bank card" − 26: a plain, unbranded card, edge-on, at the same scale, springs in between the
  extension lines and is visibly thicker (0.76 vs 0.70: 12 px proud each side); label `BANK CARD · 0.76 mm`. A slow
  7 % push holds the frame alive.
- **Shot C.** At "the whole steering system": rack back out, the sections return; at "Just shape" the two treads glow
  amber, drawn along their length.
- **HUD** `WHEELSET`: SHIFT y (emerald, C09), Δr (amber, C10), CARD (C11, from the card's entrance); all driven by the
  same `shiftAt()` as the picture; note `TEXTBOOK MODEL`.
- **SFX** (`bankCardCues()`): pen_scratch (draw), glass_tone (shift), whoosh (rack-in), quartz_tick (0.70 lands),
  whoosh (card), relay_click (Just shape). Music drops out 1.5 s before "the whole steering system" (treatment).
- **Checks in code:** `model.ts` (Δr = 0.70 mm, card > Δr) and `profiles.ts` (contact radius r0 + λy within 0.02 mm
  at 0–7 mm; flange play 7.04 mm; contact stays on the crown).

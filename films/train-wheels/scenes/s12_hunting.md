# s12 · Hunting (signature 3) and s13 · Critical speed

- **scene_id:** `TW-S12-Hunting`, `TW-S13-Critical` (`remotion/Hunting.tsx`), one continuous run on one clock.
- **duration_in_frames:** s12 from 36 frames before "And here is the twist" to s13's start (3,021 frames, 50.4 s);
  s13 to 36 frames before "Fast trains have a fix" (1,025 frames).
- **audio_timestamps (cues):** "If you push the axle" (nudge) · "the cone steers it back" (bigger wheel glows) ·
  "stop in the middle" (centre crossing) · "It overshoots" (far side) · "If you watched from above" (camera rises) ·
  "call it hunting" · "George Stephenson" · "an engineer called Klingel" / "how long each wave is" (formula) · "about
  seventeen meters" (one wave dimensioned) · "At a hundred and sixty" (speed) · "two and a half sways every second" ·
  s13: "below a certain speed" (decay) · "called the critical speed" · "Above it" (growth) · "the flanges hammer the
  rails" (strikes, inset).

## visual_direction
- **Model.** y(s) = A(s) cos(2π(s − s0)/L), L = 2π√(b0 r0/λ) = 17.2 m (C20, C21); yaw = slope (C12, C18). The
  wave is a function of distance, so it is the same wave at 3 m/s and at 160 km/h; at 160 km/h the wheelset sways
  at 2.58 Hz on screen, in real time (C21). A(s): the 3 mm nudge (never shown as a number), then (s13) a decay over
  distance below critical and a growth above it, ILLUSTRATIVE; the flange is a hard stop at ±7 mm (C09, smooth
  minimum), and every crest that reaches it is a strike.
- **Honesty.** The true sway is millimeters on a 17 m wave. Close up (until "If you watched from above"): rails and
  wheelset true; only the yaw is exaggerated (the wheels stay on the rails), tag `YAW EXAGGERATED`; a gauge reads the
  true millimeters against the ±7 mm flange marks. From above: the drawing becomes a plot, rails give way to the
  centreline and the ±7 mm limits, sideways motion exaggerated, tag `NOT TO SCALE · SIDEWAYS MOTION EXAGGERATED`.
- **Colour.** Emerald: the axle centre and its trace (balance); amber: the bigger wheel's band, the flange limits;
  crimson: strikes. s13's status line in emerald (dies away) then crimson (grows).
- **HUD.** s12 `WHEELSET`: r0 (C10), b0 (C04), WAVE L 17.2 m (C21, on "seventeen meters"), SPEED and SWAY f (C21,
  from the 160 km/h beat, same driver as the picture), note `TEXTBOOK MODEL`. s13 `HUNTING` (top-left, the plot needs
  the top-right): SPEED, CRITICAL 180, SWAY: all `ILLUSTRATIVE VALUES` (no source gives this wheelset's critical speed).
- **Klingel formula** builds on its words: `L =` on "Klingel", `2π` and the radical on "how long", `b0 r0 / λ` on
  "each wave is"; values on "For the textbook wheelset"; `L = 17.2 m` on "seventeen meters". Dated notes: `KLINGEL ·
  1883` (C20), `GEORGE STEPHENSON · BY 1821` (C19).
- **Strike inset (s13).** The outer wheel at full play against the rail, from `profiles.ts` and `contact(7)`; the
  contact is found numerically (closest outline points); iso-stress bands in the FEA ramp clipped inside each part,
  stretched along the 70° flank; grows with each strike. `FLANGE STRIKE · ILLUSTRATION`.
- **SFX:** glass_tone (push), whoosh (rise), pen_scratch (formula), quartz_tick (17.2 m), flow_sweep (160 km/h);
  s13: metal_snap_sub on every strike, panned to its side (`criticalCues()`).
- **Checks in code:** L = 17.21 m, 2.58 Hz at 160 km/h.

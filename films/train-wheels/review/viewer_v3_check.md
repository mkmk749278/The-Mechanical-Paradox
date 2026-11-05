# Viewer review v3: each point checked (PLAYBOOK §14.2)

Checked against the v3 file (frames pulled with ffmpeg), the code, `vo/timing.json` and new stills; holds measured with
`freezedetect` (n = 0.002, d = 1.5 s, on a 320 px copy of the whole cut).

| # | Point | Verdict | What was found → what was done |
|---|---|---|---|
| 1 | 3:24 plan view wrong | **CONFIRMED** | `Screech` gave `TopWheelset` the heading `phi + π/2`. The component's forward is (sin h, −cos h), so that laid the axle along the track, 90° off (81° once the 9° attack turned in). Now heading = phi + attack: the axle lies on the radius at 0°, the wheels' contact lines (±750 mm × 0.2 px/mm) land on the drawn rails, and the FLANGE PRESSED dot is computed from the wheelset's own frame at the leading end of the outer flange. |
| 2 | 0:00 combing | **CONFIRMED** | `f01_bogies.mp4` is 25i top-field-first, flagged progressive (`idet`: 125/125 TFF; the other 8 clips progressive). Deinterlaced with `bwdif` (send_field) to 50p and replaced in Drive `render-media/footage/`; original kept in `footage-originals/`; noted in `media_manifest.csv`. |
| 3 | 5:20 empty grid | **CONFIRMED** | Only THE FIX for 2 s. The 1:20 line now draws from "Fast trains have a fix" (scene in at `fix − 10`). |
| 4 | 5:24 / 5:28 collisions | **CONFIRMED** | The "half as steep" bars stood at x1 + 330/380, across the caption: now the two rises stand under the line ends (x1 ± 8), HALF AS STEEP beside them. The SLOPES ×10 tag moved bottom-right (the footage credit owns bottom-left). |
| 5 | 3:30 clipped label | **CONFIRMED** | Two lines: TURNED FROM THE RADIUS / ANGLE EXAGGERATED. |
| 6 | 0:10–0:13 wheel off rail | **NOT CONFIRMED** | At 0:11.3 (full size) the right wheel sits on its rail; the orange line is the drawn path ahead of the wheel. From 0:12 the camera swoops into the close-up by design. No change. |
| 7 | 5:52–6:02 bogie | **PARTLY** | No float found (same contact code as every wheelset), but the bogie frames sat on the chord, so each axle was 13 mm inside the centreline (d²/2R, 1.25 m, R 60 m), beyond the 7 mm play: the frames now sit 6.5 mm out, with a check in code. The camera is 8 m ahead and 4.2 m beside (was 7 and 5.5), so the two axles separate. The tag is now ILLUSTRATION. |
| 8 | 1:03–1:06 grey slab | **CONFIRMED** | The move swept through a head-on midpoint (camera at the gauge face). Now the three-quarter view holds through "But here is the surprise" and racks straight in to the gap. A scrim was added under GAP 2.0 mm (the rail's edge line crossed "2.0"). |
| 9 | Holds | **CONFIRMED** (several) | Measured: 0:37.3 + 0:38.9 (1.6 s each, still drawing under "if you could watch the wheels"), 2:13.9 (2.7 s), 2:38.3 (3.2 s), 4:09.4 (2.7 s), 5:42.1 (2.2 s), 5:46.6 (2.3 s). The v1 gate had read the last three as 1.55–1.67 s by another measure. Fixed: the wheels roll the bend from "Yet" to "neither"; a slow push on the bank-card panels (3 %, then 3.5 % after the ruler); the Nadal climb keeps rising to the scene's end; sleepers run under the trade-off's curve panels, with a 5 % push. |
| 10 | Small text | **NOT CONFIRMED** | No text in the film is under 26 px at 1080 (grep of every `size`/`fontSize`); HUD labels 26 px, values 38 px. The reviewer's 9–11 px was a cap height read at 720p. The Nadal formula (38 px) ran past the central 90%, so it now sits on two lines at 40 px. |
| s | 4:45 Klingel label | **CONFIRMED** (another cause) | The label was there, but at the top edge under the scene push: the formula block moved down 80 px. |
| s | 3:38 pixelated blobs | Not acted | The ringing-wheel nodes are blurred SVG; nothing here goes below the 720p review scale. Look again in the 4K master. |
| s | 6:02 ghosted crossfade | **CONFIRMED** | Now a dip through the dark (night out over 16 frames, hero in over 18), no dissolve. |

# Viewer review v1: each point checked (PLAYBOOK §14.2)

Checked against the real 720p cut v2 (frames with ffmpeg, `silencedetect`, `ebur128`), the code, `vo/timing.json` and new
stills. The panel watched a 30 fps review proxy, so its sound and sharpness readings were checked on the real file.

| # | Point | Verdict | What was found → what was done |
|---|---|---|---|
| 1 | Wedges stand proud of the housing | **CONFIRMED** | The slot ended at 110 mm and a fully climbed wedge reaches 112.7 mm. `Wedge.tsx`: the housing now runs to 130 mm with a stop across the slot at 120 mm, and a numeric check at import (full climb + wedge height < stop). |
| 2 | Locks at 125 % under a "≥ 115 %" label | **PARTLY** | Not wrong physics: this governor is set at 125 % (2.0 m/s on 1.6 m/s rated) and the code asks for at least 115 %; the label said only the code. Now "CATCH · SET AT 125 %" / "THE CODE: AT LEAST 115 %". |
| 3 | SPRINGS row before springs; CAR DROP froze at 60 mm | **CONFIRMED** | The SPRINGS row and the cyan spring stacks are out of s07. Once the springs are full the wedges ride down with the car: the gear stays in frame and the rail slides up past it, slowing (`railShift`); CAR DROP counts on to ≈ 340 mm, inside "twenty centimeters to a meter". This also ends the 2:24–2:31 hold. |
| 4 | "WEDGES BOTH WAYS" drawn one-way | **CONFIRMED** | Now a two-way gear: the upward-narrowing pair and a mirrored pair narrowing downward, the rail clipped clear of the label. |
| 5 | "CANADA 1990 · EUROPE (EN 81-20)" clipped | **CONFIRMED** | Two lines, "CANADA 1990" / "EUROPE · EN 81-20", block moved to x 1120. |
| 6 | Rail through "WEDGES BOTH WAYS"; clamp label on the panel border | **CONFIRMED** | Rail clipped; clamp moved 40 px right. |
| 7 | Shaft line on "CAR + 45 % LOAD"; see-saw touching the shaft | **CONFIRMED** | The balance moved 100 px right; labels 30 px and offset off the shaft. |
| 8 | Labels on the spring chevrons (2:20–2:31) | **CONFIRMED** | "THE RAIL HOLDS IT BACK" to x 1240; the feedback loop's centre to 1570, its caption to 1480. |
| 9 | "IT IS NOT." near the edge | **CONFIRMED** | Centred at 1520 (was 1640). |
| 10 | A stray "cursor" at the scale | **CONFIRMED** | It was the 0–0.2 g dimension line, its two ticks so close they read as an I-beam. Removed. |
| 11 | 1.33 s of black at 2:38.6; a dip at 2:31.8 | **PARTLY** | Not black (`blackdetect` finds none) but an empty grid: s08's wedge faded in late and out 1.4 s early. It now stays for the whole scene. |
| 12 | Holds | **CONFIRMED** | `Drift.tsx`: a slow camera push (camera ease) over each held stretch, anchored so labels stay inside the safe area; plus real motion where the physics gives it: the rail slipping (s07, s13), a second jolt and three riders pressed down on "takes that jolt" (s09), Otis on his platform (s10). |
| 13 | Small text | **PARTLY** | Every fact met the §6.4a floor (26 px). Raised anyway where a viewer needs the words: callout sub-lines 30 px (new `subSize` on the shared `Callout`, default unchanged for film 1), the stopping-distance labels, the chart axes, the weight note, the see-saw labels. The HUD's 26 px row labels stay (the channel's HUD). |
| 14 | True peak +0.3 dBFS; sting silent | **PARTLY** | The real cut measures −1.3 dBTP (the overs were the proxy's AAC re-encode). The silence was real: the drone stopped at the last word. It now runs to the last frame of the sting; master −14.1 LUFS, −1.4 dBTP. |
| S1 | Disc springs never labelled | **CONFIRMED** | Callout "DISC SPRINGS / THEY LET THE JAWS OPEN" on "stacks of disc springs". |
| S2 | "THE CAR IS LIGHTER" before "The car." | **CONFIRMED** | Now on "The car." (5:17.1). |
| S3 | 1861 caption vs 1854; no person | **CONFIRMED** | Tag "ILLUSTRATION · AFTER OTIS'S PATENT DRAWING"; an outline figure stands on the platform. |
| S4 | Two credits blend at 2:42 | **CONFIRMED** | The footage credit moved bottom-right. |
| S5 | Atrium footage shows no rails | **CONFIRMED** | Insert removed (media_manifest updated). |
| S6 | Empty screen on "And on anything faster?" | **CONFIRMED** | "FASTER THAN 0.63 m/s?" arrives on the question. |
| S7 | 0.6 g bar in amber reads as bad | **CONFIRMED** | All three bars emerald, shaded. |
| S8 | HUD row "MODEL" with no value | **CONFIRMED** | Notes read "MODEL VALUES". |
| S9 | Doors open on "doors close on you" | **CONFIRMED** | The reversed clip now starts fully open and closes from its first frame; shut by 6:10.5. |

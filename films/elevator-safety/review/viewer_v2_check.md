# Viewer review v2: each point checked (PLAYBOOK §14.2)

Checked against the real cut v5, the code, `vo/timing.json` and new stills (`/tmp` frames at every point below).

| # | Point | Verdict | What was found → what was done |
|---|---|---|---|
| 1 | True peak +0.2 dBTP | **NOT CONFIRMED** | The real cut measures −1.3 dBTP; the proxy's AAC 96k re-encode adds the overs (PLAYBOOK §3a.3 now says so). |
| 2 | Orphan red box and leader at 1:48 | **PARTLY** | It is the governor's overspeed switch, not a callout, but it read as a leftover once its label left. `GovernorCloseUp` gained `switchOpacity`; it fades with its callout. |
| 3 | "ONE DANGER IT CAN'T STOP" on the counterweight (0:24) | **CONFIRMED** | Moved 310 px right, clear of the shaft. |
| 4 | "US CODES: AT LEAST 3" on the counterweight (0:32) | **CONFIRMED** | Callout raised and shortened ("US CODE: 3 OR MORE", same claim C04). |
| 5 | A line through the CATCH label (1:12) | **CONFIRMED** | The governor's frame plate edge. The close-up now draws no plate (`plate={false}`) and the wheel sits 50 px right. |
| 6 | "NOT" into the rim (1:24) | **CONFIRMED** | Cleared by the move in 5. |
| 7 | The arrow through "CAR KEEPS FALLING" (1:30) | **CONFIRMED** | Label ends 30 px left of its arrow. |
| 8 | The dashed loop through its labels (2:28) | **CONFIRMED** | The ring is larger (r 220) and the labels sit inside it. |
| 9 | The see-saw over the counterweight sub-line (5:06) | **CONFIRMED** | Callout raised 60 px. |
| 10 | The up-facing brake drawn on a crashed car (5:48) | **CONFIRMED** | On "So the codes added a brake that faces up" the run happens again with that brake: the car rewinds, rises from rest at the same acceleration, the wedges grip at the trip point (grey → amber) and it slows at a constant rate to a stop 120 px under the beam; "STOPPED SHORT OF THE TOP". |
| 11 | "CAR GOING UP" wedges start orange and gripping (5:28) | **CONFIRMED** | They start parked and grey; on "They cannot help" the lever lifts them to the rail and the rail drags them down and out. |
| 12 | "SEVERAL ROPES" reads as one rope (0:32) | **CONFIRMED** | The three ropes are 0.05 m apart; the camera now comes in to 520 px/m on that line so all three show. |
| 13 | Small text | **PARTLY** | All met the 26 px floor. HUD row labels and units now 30 px (`Hud` gained `labelSize`, default unchanged for film 1), the footage credit 30 px. The sting's micro-line is the channel's sting, left as is. |
| 14 | Holds: 5:19.8, 0:38, 2:32, 3:46, 3:16 | **CONFIRMED** (as near-holds; freezedetect found none over 2.5 s in v5) | Pushes added in s03 (released before the camera move: `Drift` gained `release`), s08, s10 (the dial phase), s12 (stronger), s14 (before the drop). |
| 15 | Brightness jumps into and out of the footage | **CONFIRMED** | Dissolves 14 → 30 frames; the footage graded darker (brightness 0.94 → 0.78). |
| S1 | "WITHIN A METER" beside "0.54 m" | **CONFIRMED** | "0.54 m · UNDER A METER". |
| S2 | "ROPE: STOPPED" on "your car does not stop" | **CONFIRMED** | Now on "It keeps falling, past a rope that is no longer moving". |
| S3 | Clause numbers | **CONFIRMED** | "EUROPEAN STANDARD · EN 81-20" in both places; the clause stays in claims.csv. |
| S4 | g needle not parked at zero | **NOT CONFIRMED** | The needle sits at the dial's zero (lower left) until "ten times". |
| S5 | The 0.2–1 g band too small | **PARTLY** | True to the 0–11 g scale (the point is how small it is beside 10 g); left as is. |
| S6 | The face-on rail unlabelled (4:22) | **CONFIRMED** | "THE RAIL, SEEN FROM THE FRONT" until "scrape". |
| S7 | "AT LEAST · IN 5 YEARS" misread | **CONFIRMED** | "AT LEAST" above the count; "IN JUST 5 YEARS" under it. |
| S8 | Clamp and two-way gear never move | **PARTLY** | The clamp already closed; the two-way wedges now climb into the rail and light as they are named. |

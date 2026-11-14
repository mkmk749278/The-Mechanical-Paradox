# Film 3 · viewer panel v2 (cut v3c, 720p, 2026-11-14)

Independent session, no repo; the proxy deleted from Drive after download (404 checked). Mean satisfaction 6.0 (7, 6, 6, 5, 6). Verbatim report:

The video downloaded fine: 6:41.8 long, 1280×720 H.264 at 30 fps, AAC 48 kHz stereo audio at 743 kb/s. ffprobe found nothing wrong with the file itself.

Checks I ran:
- **Frames:** I pulled one frame every 2 s (201 frames) and looked at every one beside its narration line, plus full-size frames at about 25 trouble spots.
- **Detectors:** ffmpeg's black-frame, frozen-picture, interlace (combing), silence, loudness and scene-cut checks.
- **Motion:** a frame-to-frame motion measurement to find long stretches where almost nothing moves.

Results: no combing (12,052 progressive frames, 0 interlaced). No silence longer than 0.8 s. One black stretch, at 6:30.1–6:31.2. Six frozen holds of 2 s or more. Overall loudness is −14.3 LUFS, with peaks up to −0.3 dBFS.

---

## 1. Verdict

**The topic and script are strong and the real crash-test film works, but the key "disc falls behind" shot never shows the disc falling behind. Several renders sit still for 4–6 s, and labels collide with the machinery.**

| Viewer | Satisfaction | Stars | Watch next? |
|---|---|---|---|
| Marcus (54, HVAC, TV) | 7/10 | ★★★★ | Yes. The pendulum-ball idea is "a trick I can use" |
| Helen (66, no maths, TV) | 6/10 | ★★★ | Probably. She liked the child-seat tip, got lost in the gears around 1:22–1:50 |
| Arjun (31, phone, ESL) | 6/10 | ★★★ | Yes, but the small top-right readouts are unreadable on his phone |
| Katrin (44, mech. engineer) | 5/10 | ★★★ | Maybe. The lag counter says 5° while the picture shows 0°, the "torsion bar" is drawn as the whole spool, and the hook floats on the disc face |
| Liam (23, phone) | 6/10 | ★★★ | Yes for the plane-wing hook, though the 2:32–2:55 ball close-up nearly lost him |

## 2. Per chapter

| Chapter | Clarity | Picture | Moment that works best |
|---|---|---|---|
| Cold open (0:00–0:53) | 8 | 7 | 0:30 NHTSA side-on slow-motion crash under "in a crash it's just a strap" |
| Simplest lock (0:53–1:21) | 7 | 5 | 0:56 "RING OF TEETH" label arriving on the word |
| Belt-sensitive disc (1:21–2:17) | 7 | 5 | 2:10 "HOW SUDDENLY, NOT HOW FAST" landing on "It cares how suddenly" |
| Car-sensitive ball (2:17–3:13) | 7 | 5 | 2:42 "CAR DECEL > 0.7 g" flipping on "When the car brakes hard" |
| New problem: chest load (3:13–3:44) | 8 | 7 | 3:26 exterior crumple shot exactly on "The front of the car crumples" |
| Pretensioner (3:44–4:13) | 8 | 6 | 3:48 the callback "Remember the chip you guessed?" over the airbag film |
| Load limiter (4:13–5:31) | 7 | 5 | 4:48 "4 kN ≈ 5 ADULTS ON ONE STRAP" |
| Recap (5:31–5:41) | 8 | 5 | 5:36 the "PULL TIGHT / LOCK / LET GO" three-word recap |
| Child-seat mode and try it (5:41–6:41) | 8 | 5 | 6:04–6:12 the "pull slowly, then sharp tug" call to action |

## 3. Must-fix

**Physics or geometry wrong on screen**
- **1:41–1:49: the core idea is not visible.** The readout climbs "DISC LAG 1.2° … 2.6° … 4.0° … 5.4°", but the white reel bar and the orange disc tab stay perfectly level and parallel in every frame (I compared 1:40 against 1:43). The narration is "it falls behind… that tiny lag is the whole trick", and the picture shows zero lag. Exaggerate the lag (15–30°) so the orange tab visibly trails the white bar.
- **0:56–1:04: the hook floats.** In the "simplest lock" shot, the black hook block sits on the face of the grey disc, well inside the ring of teeth. It never reaches the teeth or drops into them, yet the narration says "a hook that drops into them" and "That stops the belt every time." The hook needs to sit outside the toothed rim and visibly drop into a tooth.
- **4:17–4:45: the torsion bar doesn't twist.** The "TORSION BAR" label points at what reads as the whole webbing spool (a large drum). It glows red at 4.0 kN but does not twist. The ratchet next to it doesn't turn, and no webbing pays out, while the narration says "the bar starts to twist… the reel can turn a little… the belt lets out." Show a thin bar inside the spool, a visible twist (for example a painted stripe that spirals), and webbing feeding out.
- **2:35–2:55: the ball barely moves.** The narration says a "cup shaped like a cone", but the screen shows a V-shaped prism block. At "> 0.7 g" the ball moves only a few pixels, and the lever rises only slightly toward the teeth (compare 2:35 with 2:52). "It keeps going, rolls up the wall of the cup" is not visibly true. Make the ball's roll and the lever's lift large and obvious.
- **3:04–3:12: no sense of which way is down.** The TILT readout goes 15° → 44° → 87° → 122° → 150°, but there is no horizon or gravity arrow. At "TILT 87°" (3:10) the ball still sits in its cup and the picture never shows the lock happening. The orange "45°" is painted on the disc face, and at 3:12 the gear clips it to "45".
- **2:20: the driver isn't wearing a belt.** The narration says "belt on, hands on the wheel" (stock clip, Pixabay 123665), but no belt is visible across her body. Swap the clip or crop to one where the belt shows.

**Holds where nothing visibly moves**
- 0:50.9–0:53.1 (2.2 s) is a frozen hold.
- 1:00.8–1:04.8 (4.0 s) is frozen, under "That stops the belt every time / And that's the problem."
- 2:49.3–2:55.6 (6.3 s) is frozen, the worst one. It comes after a near-static run from 2:32, so the same close-up sits for about 23 s.
- 3:00.8–3:03.2 (2.4 s) holds on "LESS THAN 1 INCH (25 mm)".
- 5:29.4–5:31.8 (2.4 s) is frozen.
- Nearly static, under the threshold but felt: 1:50–2:03 (arm close-up), 4:13–4:22 and 4:35–4:45 (torsion bar), and 5:54–5:58 (child-seat D-ring, where "let it wind back a little" happens with no visible webbing movement).

**Black frames**
- 6:30.1–6:31.2 is 1.1 s of black between the last render and the end card. It is either a gap or should be a deliberate fade.

**Picture and words out of sync**
- 1:40: the red "LOCKED IN 0.2 s" appears on "But jerk the belt… And the disc?", 18 s before the arm and teeth are explained (1:58). It gives away the payoff, and it sits over the gear with a line running through the text.
- 6:25.2: "Next: the plane wing that is built to bend" plays over the seatbelt retractor. There is no wing image, so the teaser has no picture.
- 3:36–3:42 and 4:54–5:00: the credit "STAPP CAR CRASH J. 2001" is placed over the 2017 Mazda CX-3 test footage. That implies the 2017 film comes from a 2001 study, which Katrin will flag.

**Text clipped, overlapping or too small**
- **Internal codes left on screen:** "C06" (2:32–3:02), "C08" (3:04–3:12) and "C13" (4:42–4:48) appear under the readouts. They read as leftover production IDs. Remove them.
- 0:18 and 1:30–1:40: "ILLUSTRATIVE VALUES" has its first letters swallowed by the picture ("I LUSTRATIVE").
- 0:52: the green "LETTING GO" is written across the gear teeth.
- 2:44–2:54: "STEEL BALL" is clipped by the housing block, reading "STEEL BAL".
- 4:48: in "4 kN ≈ 5 ADULTS ON ONE STRAP", "5 ADULTS" sits over the housing and a small white arrow artifact sits next to the "≈".
- 4:54–5:00: in "SERIOUS CHEST INJURIES: ABOUT 3/4 FEWER", "INJURIES" crosses the dark ratchet.
- 5:22–5:31: "TOO HIGH: THE CHEST" is clipped at the right ("THE CHES" at 5:22–5:26). At 5:28–5:30 the gear covers part of "TOO LOW" ("TOO OW").
- 5:38–5:40: "LET GO" is drawn on top of the gear teeth, and the "PULL TIGHT" leader runs off the bottom of the frame.
- **Too small for a phone held sideways:** the top-right readout captions ("DISC LAG", "BELT OUT", "CAR DECEL", "FMVSS 209", "TILT", "LIMIT") are about 14 px at 720p, and the codes are smaller still. The numbers themselves (about 28 px) are borderline. The end-card tagline "The engineering that shouldn't work…" (about 12 px, low contrast) can't be read on a phone.

**Sound**
- Peaks reach −0.3 dBFS, which leaves almost no headroom and risks clipping after YouTube re-encodes. Limit to −1 dBTP.
- Music keeps playing at about −19 LUFS for roughly 13 s after the last spoken line (6:28–6:41). That's fine as an outro, but there's no voice-over for the end card.

## 4. Should-fix
- **1:22–1:28 (Helen, Arjun):** "HEAVY DISC" points at a small orange tab on a big black spoked wheel. Viewers will take the black wheel to be the disc. Show the disc as a disc, for example tinted orange as a whole.
- **0:34–1:04:** one render shot runs about 30 s with no cut while the narration covers the whole hook-and-teeth setup. Liam drifts here.
- **1:13–1:20:** "HOW SUDDENLY THE BELT IS PULLED" (cyan) and "HOW HARD THE CAR IS STOPPING" (orange) are small labels on a wide shot. Helen won't read them in time.
- **The same Mazda CX-3 dummy clip is used four times:** 3:14, 3:34, 4:06 and 5:02–5:08. By the fourth use it stops meaning anything.
- **5:20–5:31:** the bar's colour cycles orange, cyan, white with no key, and "TOO HIGH" and "TOO LOW" point at physical parts (the ratchet rim and the drum edge) when they describe a force setting. Use a simple force slider instead.
- **5:41–6:00:** in the child-seat-mode explanation, the D-ring close-up never shows the webbing going all the way out and then only winding in. Arjun won't follow "now it can only wind in."
- **6:02:** "Want to feel it yourself?" plays over a stock driver whose belt can't be seen.
- **4:41.7 (Katrin):** "Renault set its belts to let go sooner, at four kilo-newtons" is followed by "about three quarters fewer serious chest injuries". Without the fact that the airbag was part of the comparison shown on screen, it reads as if the limiter alone did it. Put "+ AIRBAG" on the 4:56 card.

## 5. Rewind and share moments
- 0:00–0:05, the phone-versus-crash hook.
- 2:03–2:13, "It doesn't care how fast. It cares how suddenly." This is the line people quote.
- 3:03–3:13, "locks with no crash at all… even upside down."
- 4:47, "about the weight of five adults on one strap."
- 5:41–6:01, child-seat mode. This is the most shareable "so that's why my belt does that" moment, and it's what Helen would tell her friends.
- 6:04–6:13, the try-it-yourself tug.

## 5b. Realism
- **Real footage:** the NHTSA crash-test film (0:08–0:13, 0:30, 2:24, 3:14–3:42, 3:26–3:32, 5:12–5:18) is genuine and convincing. The Pixabay driving clips look real.
- **Believable renders:** the D-ring and B-pillar renders (0:04, 0:18, 0:26, 4:02, 6:04–6:12) are believable with a nice depth of field. The webbing is slightly too smooth and plasticky, and the background repeats the same autumn road.
- **Cheap or toy-like:**
  - 0:54–1:04: the "simplest lock" is flat grey, untextured CG with a floating black block. It looks like a placeholder.
  - 4:14–4:48 and 5:20–5:31: the glowing red or cyan "torsion bar" is a sci-fi glow effect, not a steel part.
  - 1:50–2:02: the orange arm looks like translucent candy plastic.
  - 2:32–2:55: the steel ball is convincing, but the V-block reads as a toy prism.
  - 6:31–6:41: the end card is a generic flat template.

## 6. Top 10 fixes, ranked
1. **1:41–1:49:** make the disc visibly lag. The orange tab should trail the white reel bar by 15–30°, in step with the "DISC LAG" readout.
2. **4:17–4:45:** redraw the torsion bar as a thin bar inside the spool, show it twisting (with a stripe spiralling along it), and show the ratchet turning a few degrees and webbing feeding out on "the belt lets out, a little at a time."
3. **2:32–2:55:** cut the 23 s ball close-up to about 10 s and remove the 6.3 s freeze at 2:49–2:55. Show the ball clearly rolling up a cone-shaped cup and the lever clearly entering a tooth on "lifts a small lever into the teeth."
4. **0:56–1:04:** move the hook outside the toothed rim and animate it dropping into a tooth on "a hook that drops into them". Replace the 4 s freeze at 1:00.8–1:04.8 with the reel spinning and then jamming.
5. **Remove the "C06", "C08" and "C13" codes** (2:32–3:12, 4:42–4:48) and enlarge the readout captions to at least 24 px so they work on a phone held sideways.
6. **Fix the overlapping or clipped labels:** 0:52 "LETTING GO", 2:44 "STEEL BAL", 4:48 "5 ADULTS" plus the arrow artifact, 4:56 "INJURIES", 5:22 "THE CHES", 5:28 "TOO OW" and 5:38 "LET GO". Give each a dark backing plate or move it into clear space.
7. **1:40:** move "LOCKED IN 0.2 s" to 2:00, the "Clack" moment, and fix the line running through it.
8. **6:25–6:31:** show a bending wing under "Next: the plane wing…", replace the 1.1 s black at 6:30.1 with a proper transition, and make the end-card tagline bigger or voice it.
9. **2:20 and 6:02:** use driver footage where the seatbelt is visible on "belt on, hands on the wheel" and "Want to feel it yourself?"
10. **3:04–3:12:** add a horizon line or a gravity arrow and show the ball rolling out and locking once the tilt passes 45°. Also fix the source credits: take the 2001 study credit off the 2017 Mazda clip, cut the Mazda reuse down from four times, and limit the audio to −1 dBTP.


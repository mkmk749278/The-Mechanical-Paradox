# Film 3: the seatbelt that knows · status

**Now:** step 9, cut v3d. Viewer panel v2 on cut v3c scored 6.0 (`review/viewer_v2.md`): real footage and D-ring
renders judged real; mechanism shots failed (invisible lag, bar not twisting, ball barely moving, holds, labels). All its
fixes are merged (PR #82). The 28 changed plates were re-rendering on the runners when the session paused (blender-render
run on main, started 2026-11-14 14:06 UTC, 1280 px / 6 samples; stale tars for those shots were deleted from Drive first).
**Next action (resume here):**
1. Check the latest blender-render run on main. If any block failed, re-run it with the `blocks` input; if the run is
   gone, dispatch again with `script: films/seatbelt-lock/blender/render.py`, width 1280, samples 6 and these shots:
   how_know,second_decision,simplest,clues,disc_intro,disc_slow,jerk_real,jerk_disc,jerk_arm,not_speed,left_behind,
   real_crash,reel_still,ball,ball_lock,inch,tilt,two_things,pretension,bar,renault,three_quarters,limit_choice,
   three_moves,all_out,feel,disc_decides,bar_waits
2. remotion-render: comp SB-FilmV3, scale 2/3, tail_frames 820, name seatbelt-lock_cut_v3d_720p.mp4 (mix in Drive is current).
3. Our picture gate (a frame every 4 s; the panel v2 list), then a fresh viewer panel (prompt: the v2 prompt in this
   session's pattern, PLAYBOOK §3a; proxy 720p30 crf 26, share, delete after download).
4. When it passes: 1920 plates for the 4K master (step 10), package (11), Shorts (12).

- [x] 1 Topic picked (gate 37/40, brief.md)                    PR (this one)
- [x] 2 Research, claims, treatment, opening, script          PR (this one)
- [x] 3 Story review (3 rounds: 7.6 → 7.8 → 8.4)              PRs #71, #72, this one
- [x] 4 Story and script fixed; bar met (VO v4 locked)       this PR
- [x] 5 Narration: approved by the owner (2026-11-13)         this PR
- [x] 6 Voice: 9 blocks measured; 388.1 s, 159 wpm, sync 0 frames  this PR
- [x] 7 Film built: 10 scenes, 4 photo inserts, mix (−14.3 LUFS)   this PR
- [ ] 8 720p cut, viewer panel                                PR #
- [ ] 9 Fixes, new cuts, panels                               PR #
- [ ] 10 4K master                                            PR #
- [ ] 11 Package                                              PR #
- [ ] 12 Shorts; ready to upload                              PR #

## Log
- **2026-11-13, step 1.** Five candidates scored; search demand measured in the US, UK and India
  (`research/demand/`). The seatbelt won on the lessons of films 1 and 2: the viewer's own question is in the
  autocomplete ("why does my seatbelt keep locking"), the object is in every viewer's hand daily, and the thumbnail
  can ask (NO CHIP?) without answering.
- **2026-11-13, step 2.** The US standard's own text gave every threshold (0.7 g / 25 mm; 0.3 g / 51 mm; 15° / 45°);
  the patents gave both sensors (the lagging inertia disc, the ball on a cone); NHTSA gave the pretensioner and the
  torsion bar, and the catch's own cost (tall or heavy occupants: a hedged `claim`); Stapp 2001 gave the 6 → 4 kN
  story and the 75–85% result. The UN R16 text is behind a block from here; its 2009 working paper is background
  only, so the film's numbers are FMVSS 209's and the VO says "in the United States". Written to PLAYBOOK §7.9: four
  spoken numbers, none before 0:30; the ratchet shown failing; the catch as an event.
- **2026-11-13, steps 5–6.** The owner approved VO v4 ("Narration approved"). Voice on eleven_v4 with the channel
  voice: block 1 first (both takes 100 % words, t1 livelier), then blocks 2–9 × 2. Block 8 ("One last mystery") came
  back +1.5 and +2.0 semitones in both takes (⚠ voice changed); two more takes: t3 +0.2 st, used. The end of block 9
  "inserted" a sentence in the transcript: every word at the same final instant, a Whisper end-of-file hallucination,
  no audio behind it. Owner, same day: from film 4 the whole narration is one block (PLAYBOOK §7.7).
- **2026-11-13, step 8, cut v1 + our gate.** 720p on 7 runners (run 43400380382); the join failed its length check:
  the mix lacked the 820-frame tail (PLAYBOOK §16), remixed with `--tail-frames 820`, joined from the kept shards (run
  43403972167). Gate (one frame every 3 s against the words, 15 sheets): mechanism, labels and credits on their words;
  fixed for v2: static cabins (a road that scrolls and stops dead at each crash, a slow push), titles under the HUD
  (HUD bottom-right in s03–s05, s07), the disc callout clipped, a blank beat at 4:43, the injury bars starting equal,
  a dip between two landing photos (one photo now).

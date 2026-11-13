# Film 3: the seatbelt that knows · status

**Now:** step 9, rebuilding the picture. Cut v2: our gate passed, the independent viewer panel scored 7.0
(`review/viewer_v1.md`), and the owner's own review rejected the look: "low level visuals, not at all near to reality;
still image while saying reaching phone and jerk; use ultra realistic animation for the science, otherwise mostly real
clips" (PLAYBOOK §16, "Realism over diagrams"). The owner chose photoreal 3D for the everyday shots (Canva's AI video
limit is spent until 2026-12-01). The voice, timing, music and story stay; the picture is rebuilt.
**Next action:** build the photoreal scenes in Blender (Cycles on the runners): the retractor in cutaway (frame,
ratchet ring, spool and webbing, inertia disc, sensor arm, ball-in-cup sensor, torsion bar) driven by `remotion/model.ts`;
the cabin (seat, pillar, belt, a crash-test dummy occupant) for the reach, the jerk, the crash and the child-seat mode;
then public-domain crash-test footage where it exists. The blueprint layer becomes callouts and HUD over the plates.

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

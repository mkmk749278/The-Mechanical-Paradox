# Film 3: the seatbelt that knows · status

**Now:** step 7 built. 10 scenes (`remotion/Part1.tsx`, `Part2.tsx`) on the recorded voice; the mechanism from
`remotion/model.ts` (a spring-coupled inertia disc and a ball-in-cone sensor, with import-time checks: a slow lean
never locks, a jerk locks within 0.2 s, a fast steady pull never locks, the ball's threshold inside FMVSS 209's window);
drawings `Reel.tsx` and `Cabin.tsx`; 4 photo inserts (Pixabay, credited, `media_manifest.csv`); 63 sound cues
(`sound/sfx.json`), the library score (`sound/score.json`), mix −14.3 LUFS, −1.4 dBTP (Drive `seatbelt-lock/mix/`).
**Next action:** step 8: the 720p cut on the runners (`remotion-render.yml`, film `seatbelt-lock`, comp `SB-Film`,
scale 2/3, tail_frames 820, name `seatbelt-lock_v1_720p.mp4`), our picture gate on it, then the independent viewer panel.

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

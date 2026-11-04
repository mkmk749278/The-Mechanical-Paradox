# Film 1 status and handoff (2026-11-04, picture built, music mixed)

**Done**
- Research, claims (31 rows; gate passes: 30 confirmed, 1 disputed and worded as such), brief, treatment, VO v6.
- **VO recorded and approved by the owner** (no re-recordings): Eleven v4, the channel voice, 379.4 s, 162 wpm
  (`vo/timing.json`; Drive `train-wheels/vo/`).
- **Picture: all 15 scenes built and assembled** in `TW-Film` (`remotion/Film.tsx`): 22,765 frames of VO + the
  330-frame channel sting = 23,095 frames (6:24.9). Stills of every scene reviewed at its key words; a 52-frame
  contact sheet of the whole film reviewed. 3D wheelset lathed from the true profile (`Wheelset3D.tsx`,
  research/visual_refs.md); every number on screen from `model.ts` / `profiles.ts` with numeric checks in code.
- **Sound:** 77 SFX cues exported from the picture code (`sound/sfx.json`), this channel's foley synthesized in
  `scripts/score_mix.py`, the sub-bass drone bed (`sound/score.json`); master −14.1 LUFS, −1.1 dBTP (VO + SFX + bed).
- **Farm render started** (with the footage): 720p review cut, `train-wheels_review_720p_v1.mp4` → Drive
  `train-wheels/renders/`.

**Owner, 2026-11-04: real footage.** Nine Pixabay clips (Pixabay Content License, `media_manifest.csv`), 2–5 s inserts
where the narration names the real thing (`remotion/Footage.tsx`), graded to the palette and credited on screen. Files
in Drive `train-wheels/render-media/footage/` (a stray partial `he.mp4` there is unused; safe to delete).

**Music: done (Lyria 3.5, 2026-11-04).** Two takes per act made with `scripts/lyria_music.py` (7 calls, 6 songs,
$0.56; one prompt blocked and reworded), picked by measured contour; voices checked with Whisper (no words) and
the PANNs AudioSet tagger (Choir, Singing, Humming all < 0.05; Speech 0.13 at most, act 1 at 0:54). The library's two
Gemini listeners (§12.1) could not run: the project hit its monthly spending cap. **A person must listen once**, act 1
around 0:54 first; take 1 of each act used (`sound/music_manifest.csv`,
`media_manifest.csv`; all six in Drive `train-wheels/music/`). Placement in `sound/score.json`: drops 1.2 s before
"neither wheel really slips" and 1.0 s before "Just shape"; act 2 stops dead before "That is one way a train comes off
the track"; act 3 releases after "until the flanges hammer the rails"; out 0.5 s before the sting. Mix rebalanced by
K-weighted loudness: bed 14.5 dB under solid speech (median), effects 13.4 dB, `glass_tone` −6 dB; master −14.1 LUFS,
−1.4 dBTP. `mix.wav` in Drive `train-wheels/mix/` (the previous one kept as `mix_v1_no_music.wav`).

**Farm render (720p, with footage and music):** run 41810631645 on commit 30f4cdc; its join step pulls the new
`mix.wav`, so the cut it writes, `train-wheels_review_720p_v1.mp4` in Drive `train-wheels/renders/`, carries the music.
Shards are kept 7 days: a new mix re-joins without re-rendering (`join_from` = 41810631645).

**Next session, in order**
1. Check the joined cut: its audio is the new mix (music audible at 0:12, the stop at 4:09). The landing shard was
   rendered before the fix in `Landing.tsx` (both 3D canvases mounted, 3 h+); the fix halves it for every later render.
   When the Gemini cap resets or is raised, run the two listeners on the three act tracks (`lyria_library.py` `listen`
   and `voice_check`).
2. Picture gate (§14.2) on the 720p cut with music: contact sheet every 4 s, every insert, every dissolve; then the
   owner's review in `mkmk749278/Review`.
3. The YouTube package (§13.7): Shorts (2–3), 3 thumbnails, title, description, SRT (`vo/captions.en.srt`).
4. Re-open the Tanifuji record (C24) when the Niigata repository is up.

# Film 1 status and handoff (2026-11-04, picture built)

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
- **Farm render started:** 720p review cut, run 41797400057, `train-wheels_review_720p_v1.mp4` → Drive
  `train-wheels/renders/`.

**Owner, 2026-11-04: music = licensed tracks fetched on the phone.** Three Pixabay picks, one per act, in
`sound/music_brief.md`; the owner downloads them and uploads to Drive `train-wheels/music/`.

**Next session, in order**
1. When the music lands: pull it, log each track in `media_manifest.csv` (Pixabay Content License, page URL), set
   the slots in `sound/score.json` (act 1 0:00–2:55, act 2 2:55–4:13, act 3 4:13–end; drop 1–1.5 s before "Just
   shape" and before "neither one really slips"), mix with `--tail-frames 330`, upload `mix.wav` to Drive
   `train-wheels/mix/`, and re-join the picture without re-rendering (`join_from` = the render's run id, within 7 days).
2. Picture gate (§14.2) on the 720p cut with music; then the owner's review in `mkmk749278/Review`.
3. Shorts (2–3), thumbnails (3), title, description, SRT (`vo/captions.en.srt`): the YouTube package (§13.7).
4. Re-open the Tanifuji record (C24) when the Niigata repository is up.

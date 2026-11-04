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
- **Farm render started** (with the footage): 720p review cut, `train-wheels_review_720p_v1.mp4` → Drive
  `train-wheels/renders/`.

**Owner, 2026-11-04: real footage.** Nine Pixabay clips (Pixabay Content License, `media_manifest.csv`), 2–5 s inserts
where the narration names the real thing (`remotion/Footage.tsx`), graded to the palette and credited on screen. Files
in Drive `train-wheels/render-media/footage/` (a stray partial `he.mp4` there is unused; safe to delete).

**Music (owner, 2026-11-04): Google Lyria 3.5 through the Gemini API.** History: Pixabay picks were all Content ID
registered; the free ElevenLabs account has no commercial licence; Antigravity could not fetch the YouTube Audio
Library; the owner then chose Lyria and added `GEMINI_API_KEY` as an environment secret (new sessions only). Terms
checked: Google claims no ownership of output and sets no commercial limit (aistudio.google.com/docs/terms); every
track carries an inaudible SynthID watermark. Fallback: `scripts/compose_score.py` (code-composed score, measured
clean; its last edit, chords overlapping across changes, is untested: run it once before relying on it).

**Farm render (720p, with footage):** run 41810631645 on commit 30f4cdc; 8 of 13 shards done at 10:21 UTC, the heavy
3D shards still running. Output `train-wheels_review_720p_v1.mp4` → Drive `train-wheels/renders/`, joined with the
current mix (VO + SFX + drone, no music). Shards are kept 7 days: a new mix re-joins without re-rendering
(`join_from` = 41810631645).

**Next session, in order**
1. **Music with Lyria 3.5** (`GEMINI_API_KEY`; docs aistudio.google.com/docs/music-generation; model `lyria-3.5`,
   `response_format` WAV, 44.1 kHz stereo, "a couple of minutes" per track, prompt for "Instrumental only, no
   vocals"). Three tracks, one per act, at the film's tempo feel: act 1 (0:00–2:53) curious, precise, a light steady
   pulse, soft pad, no big melody; act 2 (2:53–4:12) darker tension, low strings or a synth pulse, building, not
   horror; act 3 (4:12–6:25) building, then warm and resolved, ends gently. Report the cost. Save to
   `assets/music/`, log in `media_manifest.csv` (Lyria 3.5, Gemini API terms, SynthID), add
   `sound/music_manifest.csv`, set `sound/score.json` slots (drop 1–1.5 s before "neither one really slips" and
   before "Just shape"; music out before the sting), mix (`score_mix.py --tail-frames 330`), upload `mix.wav` to
   Drive `train-wheels/mix/`, re-join the farm render (`join_from` 41810631645 if within 7 days, else re-render).
2. Picture gate (§14.2) on the 720p cut with music: contact sheet every 4 s, every insert, every dissolve; then the
   owner's review in `mkmk749278/Review`.
3. The YouTube package (§13.7): Shorts (2–3), 3 thumbnails, title, description, SRT (`vo/captions.en.srt`).
4. Re-open the Tanifuji record (C24) when the Niigata repository is up.

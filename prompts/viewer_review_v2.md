# Viewer review prompt for a cut, v2 (PLAYBOOK §3a.3, steps 8 and 9)

For a 720p review cut. Paste into a **new cloud session with no repository attached**, replacing `{TITLE}`,
`{DRIVE_FILE_ID}`, `{FILE_NAME}` and `{NARRATION_WITH_TIMECODES}` (every sentence with its start time). Fresh session
every round.

---

You are an independent test audience and a forensic picture checker for a YouTube channel that explains everyday
engineering and physics. You have NOT seen the project, its rules or its research. Do not look anything up on the web.

Get the video: open Google Drive file id `{DRIVE_FILE_ID}` ({FILE_NAME}) with the Google Drive tools you have, download
it, and use ffmpeg to pull one frame every 2 seconds plus full-size frames wherever something looks wrong. Look at
every frame you pull, and read the narration below beside it, so you judge what is on screen while each line is heard.
If you cannot get the file, say so and stop.

The video is titled "{TITLE}".
--- NARRATION WITH TIMECODES ---
{NARRATION_WITH_TIMECODES}
--- END ---

Watch as five viewers who choose everyday-physics explainers several times a week: Marcus (54, HVAC technician, Ohio,
TV), Helen (66, retired teacher, Manchester, TV, no maths), Arjun (31, developer, Pune, phone, English second
language), Katrin (44, mechanical design engineer, Munich, catches wrong physics), Liam (23, apprentice electrician,
Brisbane, phone). Then as a picture checker.

Report:
1. Verdict in one line, and each viewer's satisfaction 1–10, stars 1–5, and whether they'd watch the next video.
2. Per chapter: a score for clarity and for picture, and the moment that works best.
3. **Must-fix**, with timecodes: anything physically wrong on screen (parts that don't touch, wrong direction or
   speed, impossible geometry), picture and words out of sync, text too small to read on a phone held sideways,
   clipped or overlapping labels, holds where nothing visibly moves for more than about 2 s, flashes, combing,
   black frames, sound problems.
4. **Should-fix**: places a viewer gets lost, bored or confused; text that fights the narration.
5. The moments people would rewind or share.
6. The top 10 fixes, ranked, each with its timecode and what to change.

Be exact: quote what you see in the frame. Write the whole answer as your final message. Do not create files in any
repository.

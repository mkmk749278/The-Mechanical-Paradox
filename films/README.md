# films/

One folder per film, `films/<slug>/` (PLAYBOOK §5.3): `brief.md` (package first), `research/`, `treatment.md`,
`claims.csv`, `script/` (`screenplay.md` with the Q column, `vo.txt`, `terms.txt`), `vo/` (`timing.json`), `scenes/`
(handoff docs), `remotion/` (the film's components, registered in `src/Root.tsx` inside its own `<Folder>`),
`media_manifest.csv`, `review/`, `youtube/`. Large media in `assets/` (gitignored) and Drive
`The-Mechanical-Paradox/<slug>/`.

## `STATUS.md`: the resume point (PLAYBOOK §3a.2)
Every film starts its `STATUS.md` from this template at step 1 and updates it in every PR. A session that starts or
restarts reads it first and continues from the first open step.

```markdown
# Film N: <title> · status

**Now:** step K, <what>. **Next action:** <one line a fresh session can act on>.
**Running:** <workflow run ids, review session ids, or "nothing">. **Drive:** `The-Mechanical-Paradox/<slug>/`.

- [ ] 1 Topic picked (gate score, brief.md)                  PR #
- [ ] 2 Research, claims, treatment, script                  PR #
- [ ] 3 Story review (panel round N)                         PR #
- [ ] 4 Story and script fixed; bar met                      PR #
- [ ] 5 Narration review; fixes in                           PR #
- [ ] 6 Voice: block 1 measured, all blocks measured          PR #
- [ ] 7 Film built (scenes, plates, music, mix)              PR #s
- [ ] 8 720p cut v1, picture gate, viewer panel              PR #
- [ ] 9 Fixes, cut vN, fresh panel; no must-fix              PR #
- [ ] 10 4K master gated, on Drive                           PR #
- [ ] 11 Package: titles, thumbnails, click test, description, tags, SRT   PR #
- [ ] 12 Shorts; ready to upload                             PR #

## Log
<newest first: what each step made, what passed, numbers that matter>
```

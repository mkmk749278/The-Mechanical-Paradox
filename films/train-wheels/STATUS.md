# Film 1 status and handoff (2026-11-04)

**Done:** research, claims (31 rows, gate passes; C30 re-quoted verbatim; C31 the drift's cause, derived), brief,
treatment, **VO v6 locked** (`script/vo.txt`; audience reviews v3, v4, v5 in `review/`; the lock bar met in v5: no
viewer drifts in the first minute; spoken-English check passes as an explainer), screenplay rebuilt (23 beats),
recording blocks (`script/blocks_performance.md`, 6 blocks), audition paragraph (`vo/voice_audition.md`).
Picture: `remotion/model.ts` and `remotion/profiles.ts` (formulas and the wheel–rail contact, checked in code),
phrase-cued timing (`lib/remotion/timing.ts`, `vo/timing.provisional.json`), scene list (`scenes/README.md`),
**s07 the bank card built** (`remotion/BankCard.tsx`, composition `TW-BankCard`, stills reviewed in-session).
Shared: HUD meets the legibility floors.

**Waiting on the owner:** the voice audition (3 voices × the bank-card paragraph, 2 takes each) and the pick; then the
six recording blocks with the chosen voice.

**Next session, in order:**
1. Measure the audition takes with `scripts/vo_review.py`; owner picks.
2. Build the scenes in `scenes/README.md` order of risk: s12 hunting (signature 3), s06 drift and apex cone
   (signature 4), s02 rail race (signature 2), then the rest; a handoff doc before each.
3. When the takes land: `scripts/vo_timing.py films/train-wheels`, switch `remotion/cues.ts` to `vo/timing.json`,
   check signature cues by ear; full film composition; 720p farm render; picture gate (§14.2).
4. Re-open the Tanifuji record (C24) when the Niigata repository is up (503 again on 2026-11-04).

# The Mechanical Paradox: production playbook

The one reference doc for this repo. `CLAUDE.md` holds the short rules every session must follow; this file holds
everything else: full specs, how-tos, the reason behind each rule, and the owner's blueprint word for word (Part G),
so a future session can tell when a rule applies and when it doesn't. Add new lessons here (with the reason), never in
new doc files.

Many lessons come from the sister channels' repos, `mkmk749278/Built-on-Bharat` and `mkmk749278/Creator` (Oct 2026).
Where a rule came from there, it says so, with the measured reason. Their files are a reference only: their channel
rules (Indian English voice, India-first topics, HyperFrames, Telugu, real archive footage first) do not apply here
unless this file says so.

**Contents**
- Part A: How we work. 1 Owner and delivery · 2 Claude: creative director, and effort · 3 Sessions ·
  **3a The film pipeline (twelve steps, run without waiting)**
- Part B: The channel. 4 Identity, audience and the evidence (topic gate §4.3, research verdicts §4.5) ·
  5 Story architecture (the five beats §5.4) · 6 The look · 7 Narration ·
  8 Visual explanation toolkit
- Part C: Production. 9 Facts and honesty · 10 Remotion engine · 11 Assets and references · 12 Sound ·
  13 Discovery and packaging · 14 Review gates · 15 Tools
- Part D: 16 Lessons log · 17 Decisions and open questions
- Part G: the owner's directives, verbatim

---

# Part A: How we work

## 1. Owner and delivery

- **The owner (Kishore) works only from an Android phone** (GitHub app, Claude app, Termux, SSH to a VPS). No PC.
  *Why:* every step must run in a cloud session, GitHub Actions or the VPS, and every result must open on a phone: a
  Drive link, a JPG contact sheet, a code block in the chat.
- **Polished only** (the sister channel's rule, owner 2026-10-24, adopted here). The owner never receives a test
  render, draft cut, placeholder scene, rough thumbnail or "sample". Tests live and die inside the session. When a
  phase report needs pictures, they are finished frames from the final build. *Why:* the owner judges the channel by
  what he sees; a rough sample wastes his review and lowers the bar.
- **Google Drive is the delivery shelf.**
  - Channel folder: **`The-Mechanical-Paradox`** at the top of My Drive, id `1F4h9HudKHZEAfRNo8bg1S1yMKSaEWqP3`
    (created 2026-10-31). Channel art in `_Channel/` (id `1cFzDoiV3uJt_cB48BgXVdH5Z_Ohtqqar`). One folder per film,
    `The-Mechanical-Paradox/<slug>/`; nothing loose in the top folder. The `Creator` and `Built-on-Bharat` folders
    belong to the other channels: never write there.
  - Videos: `scripts/upload_gdrive.sh --sub <slug> FILE…` (pinned rclone, needs `GDRIVE_RCLONE_TOKEN`, already set).
    Small text files can go through the Google Drive connector (`create_file` with `parentId`,
    `disableConversionToGoogleType: true`); it can't carry video.
  - Deliver the 4K master and a 1080p copy (the phone plays the 1080p one smoothly).
- **Git:** all work lands on `main`. Each session uses its own branch, opens a PR to `main` and merges it the same
  day. Sessions can't delete branches: tell the owner which ones to delete. *Why (Creator):* nine stale session
  branches once hid finished work.
- **Steps, not stops (owner, 2026-11-07):** a film runs through the twelve steps of §3a without waiting for the owner;
  each step ends with a merged PR and one or two lines in the chat: what was built, what was checked, what runs next.
- **Once the owner approves a cut, stop editing it.** *Why (Creator):* edits slipped in after approval cost a round.
- **Ask, don't guess, on the owner's decisions** (voice, topic, cadence, anything paid), with AskUserQuestion: 2–4
  options, the recommended one first with "(Recommended)", one-line reason each. Never ask what a sensible default or
  the repo answers.

## 2. Claude: creative director, and effort

### 2.1 Creative director
Claude owns the creative vision of every film from topic to thumbnail (the sister channels' rule, owner 2026-10-24,
adopted here). A director decides; a template follower repeats.
- **Craft rules are a floor and a reference.** Pacing numbers, structure, lengths, looks: they record what worked and
  why. When a better idea serves the viewer more, break the rule on purpose, write why in `treatment.md`, check it in
  review and log the result in §16.
- **Hard lines never bend:** physics and facts verified (§9), honesty labels (§9.4), licences (§11), no fakes of real
  people, polished-only deliveries (§1), and the owner's decisions (§17).
- **Kill the first idea.** Three angles, three cold opens, three thumbnail concepts per film; keep the one that
  surprises you. Design 2–3 **signature moments** per film: the shot people will rewind and share (the cutaway that
  finally makes the mechanism click, the slow-motion contact patch, the moment the wedge bites).
- **Benchmark against the best.** Before locking a treatment, watch (via transcripts and thumbnails) the 3 strongest
  films on the subject in any language and write what ours does better. Competitors are a reference, never a ceiling.
- **Smart, not just bold:** each creative choice must make the mechanism clearer, the wonder stronger or the curiosity
  sharper. If it only looks clever, cut it.

**The treatment** (`films/<slug>/treatment.md`, one page, after research and before the script): logline with its
tension; the broken intuition in one line; the feeling at the start, the darkest moment and the end; the angle (3
considered, 1 chosen); the visual world inside the brand (§6); the signature moments; the sound palette; the package
(title, thumbnail concepts, search phrases), written first because it is the promise.

### 2.2 Effort
- Don't limit yourself: build real geometry and real simulations instead of icons, write a custom scene instead of a
  template, review every frame instead of a sample. `high`/`xhigh` effort for building, `max` for fact-checks and
  final reviews. Never lower effort or skip a QA round to finish sooner.
- **Name the looks to avoid** (§6.5). Asked for visuals with no direction, a model falls back on stock styles (glass
  cards, neon dashboards, centred title on a gradient, icon grids).
- Knowledge stops at June 2026: every fact and every number comes from collected sources (§9).

## 3. Sessions
- **One session does the work** (the sister channels' rule, owner 2026-10-27): building, research and rendering in
  one session. A new session only for an **independent review** (audience review §7.8, fact-check, fresh-eyes picture
  review §14), archived when done. *Why (owner):* "multiple sessions eat usage, and after the limit resets they
  continue where they left off and eat much more".
- Each cloud session is a VM of about 4 vCPU / 16 GB / 30 GB disk. All sessions share one usage limit and one outbound
  IP. Idle VMs pause and can be reclaimed: start long jobs detached (`setsid nohup … < /dev/null & disown`), watch them
  with Monitor, make them resumable.
- **Full renders run on GitHub's runners, never in the session** (§10.5).

## 3a. The film pipeline: twelve steps, run without waiting (owner, 2026-11-07)

The owner's process for every film, refined. **It runs on its own from topic to package:** Claude does not stop for
approval between steps. Each step ends with its work merged into `main`, so nothing is lost if the usage limit hits
mid-film. The owner can step in at any point; his notes override the pipeline, and once he approves a cut it is not
edited again (§1). **Creativity is the top priority inside every step:** the gates below are the floor, never the
ceiling (§2.1).

### 3a.1 The steps
Each step: what it makes, the gate it must pass, and the PR that saves it (`Film N · step K: <what>`).

| # | Step | Makes | Passes when |
|---|---|---|---|
| 1 | **Pick the topic** | Score at least five candidates on the topic gate (§4.3: the slate §17.3, the pool §17.4, new ideas); check search demand (`scripts/yt_demand.py`, §13.1); pick the highest that passes. `films/<slug>/brief.md` with the scores, the package drafted first (10+ title ideas, 5+ thumbnail concepts, search phrases), `STATUS.md` started. | Score ≥ 35/40 and sourceable. |
| 2 | **Know it completely; write the story** | `research/` from primary sources; `claims.csv` (the gate passes); `treatment.md` with 3+ angles, 3+ cold opens, 2–3 signature moments and the chosen five beats (§5.4); `script/screenplay.md` with the Q column; `script/vo.txt`; `script/terms.txt`. | `claims_check.py` passes; lean-in test and spoken-English check pass (§7.4, §7.8); script gate §14.1. |
| 3 | **Story review** | An independent panel of five everyday-physics fans from around the world (§3a.3, `prompts/audience_review_v2.md`, stage SCRIPT). `review/audience_vN.md`. | Report saved. |
| 4 | **Fix the story and script** | Every fix that keeps the facts true; claims re-checked for every changed line. | The bar of §3a.3. If missed, back to step 3 with a **fresh** panel (at most three rounds; then lock on the bar, never on a perfect verdict). |
| 5 | **Narration review** | The narration as it will be performed (final words, paragraph rhythm, the reveal holds marked) to a fresh panel (stage NARRATION): simplicity, listenability, satisfaction. | The bar of §3a.3; fixes applied. |
| 6 | **Voice** | `script/blocks_performance.md` (decision 7). **Block 1 first** with `scripts/eleven_tts.py`, measured with `scripts/vo_review.py` (words as written, pace, pauses, pitch, voice drift, loudness); settings fixed until block 1 is right; **then every block**, measured together (drift across blocks, every join, total pace 145–165 wpm after `scripts/vo_timing.py`). Takes to Drive `<slug>/vo/` at once. | Every block measured clean; `vo/timing.json` accounts for every word. |
| 7 | **Build the film** | Scenes on the VO clock, Blender plates and music on the runners (§10.5–10.6, §12.1), SFX cues, the mix. Stills of every scene at its key words, looked at. | `tsc` clean; claims gate; every scene's stills pass §14.2's picture points. Merge after each group of scenes, never more than about two hours of work unmerged. |
| 8 | **720p cut and first picture review** | The review cut on the runners; our own picture gate (§14.2: audio-synced frame sheets, `freezedetect`, loudness, legibility); then an independent viewer panel on the cut (`prompts/viewer_review_v2.md`). `review/viewer_vN.md`. | Report saved. |
| 9 | **Fix everything; second review** | Every note checked against code, timing and a still (`review/viewer_vN_check.md`, CONFIRMED / PARTLY / NOT CONFIRMED), the confirmed ones fixed; a new 720p cut; a **fresh** viewer panel. | No must-fix left (physics, sync, legibility, a frozen hold), and the bar of §3a.3. Repeat at most three rounds. |
| 10 | **4K master** | Blender plates at 3840 px and the film at `scale` 2 on the runners; the gate (§14.2: −14 LUFS, −1 dBTP, length, no black frames, frames checked at 4K); `master_4k.mp4` and a 1080p copy to Drive. | Gate passes. |
| 11 | **The package** | §13.7 in full, built for clicks and search: 10+ titles → 3; 6+ thumbnail concepts → 3 finished (Blender stills of the film's own object + words); an independent click panel against 8 real competitor thumbnails from the same search (`prompts/package_review_v1.md`); the description (search phrases, chapters); tags; SRT; auto-dubbing note. | The panel picks; the squint test passes; every word passes §9.2. |
| 12 | **Shorts and handoff** | 2–3 vertical Shorts (§13.6) rendered on the runners; `STATUS.md` says "ready to upload" with every Drive link; one short message to the owner. | Shorts gated like the film. |

The owner uploads (outward-facing, §1). The next film's step 1 can start while the owner uploads the last one.

### 3a.2 Never lose work
- **One PR per step, merged at once** (more often in step 7). After a merge, restart the same session branch from
  `main` (`git fetch origin main && git checkout -B <branch> origin/main`) for the next step: a merged PR is never
  reused.
- **Commit and push within every 30–45 minutes of work**, merged or not, so a cut-off session leaves its work on
  GitHub.
- **`films/<slug>/STATUS.md` is the resume point:** the twelve steps as a checklist, the current step, what is
  running where (workflow run ids, Drive paths), and the next action in one line. Updated in every PR. A session
  that starts (or restarts after a usage reset) reads it, checks running workflows, and continues from the first
  open step without redoing finished work.
- **Media goes to Drive the moment it exists** (takes, plates, mixes, cuts); git keeps the small files only.
- **Long jobs never wait inside the session.** Renders, Blender plates and Shorts run on GitHub's runners; while they
  run, the session works on the next step that doesn't depend on them (the package during the 4K render, the
  Shorts design during a review).

### 3a.3 Independent reviews
- **Who:** a new cloud session (`create_session`) with **no repository**, so it knows nothing of our rules or research,
  given one prompt from `prompts/` with the material filled in. It reports, the report is saved in `review/`, and the
  session is archived (§3). Each round uses a **fresh** session (no memory of the last draft: §16, film 1).
- **The panel: five viewers from around the world who choose everyday-physics explainers** several times a week
  (the US, the UK, India, Germany, Australia; two are engineers who catch wrong physics, two speak English as a
  second language, two watch on a TV). Their **satisfaction** is the point: YouTube ranks on it (§4.5).
- **Cuts:** the reviewer opens the 720p cut by its Drive file id through the account's Google Drive connector
  (nothing is shared publicly), with the narration and a timecode on every sentence, and pulls frames with ffmpeg.
- **The bar:** nobody drifts in the first minute; every viewer can explain the mechanism back; no physics or fact is
  flagged as wrong (or a flag is checked and shown not to apply); average satisfaction ≥ 8/10 and nobody below 6;
  at least three of five would watch the channel's next film.
- **Outside notes are checked before fixing** (§14.2): reviewers misread small things too.
- **Collecting a review (2026-11-07):** a review session that finishes cleanly sends **no** notice back (only a failed
  or restarted one does), so don't wait on a timer. A panel takes about 2 minutes: check it with `get_session`, then
  read only its final `result` event (`list_events`, kinds `["result"]`). Save the report in `review/`, archive the
  session, and delete any reminder you scheduled for it. *Why:* film 2's first panel finished in 2 minutes while an
  8-minute timer waited, and the owner noticed first.

### 3a.4 Money and the owner
The pipeline uses only what is set up and approved: the ElevenLabs account and its plan, Lyria inside the Gemini
monthly cap (§12.1, §16), GitHub's free runners (a public repository: standard runners are free, up to 20 jobs at once
and 6 hours a job, per GitHub's docs, read 2026-11-07), Drive.

**The runners are shared by three channels (owner, 2026-11-07).** The 20 concurrent jobs of GitHub's Free plan belong to
the account `mkmk749278`, and this channel's two sister repos run their renders on the same account. GitHub's limits
page lists the 20 by plan, not per repository; jobs over it wait in the queue instead of failing, so the cost of
overlap is time, and one channel's 20-runner render can stall the other two for hours. So:
- **Take every free runner, never fewer than 7 (owner, 2026-11-07, decision 15).** Both workflows' `runners` input
  defaults to `auto`: the plan job runs `scripts/runner_share.py`, which counts the jobs running or queued in all three
  channels' repos (this run excluded) and takes 20 minus that, at least this channel's fair share of 7. An idle account
  gives 20; a busy one gives 7. The count is also the matrix's `max-parallel`. A number (1–20) overrides it.
- **It needs one token** (repo secret `RUNNER_SHARE_TOKEN`, see below); without it, or if GitHub's API fails, the
  workflows take 7 (fail soft: a render never stops on this).
- **The count is taken once, at the start.** A sister channel that starts a render later may wait for our blocks to
  free runners (up to about 3.6 h each for 4K Blender blocks). That is the owner's accepted trade for speed.
- **Blender blocks always fit the job timeout:** the planner caps a block at 36 frames at 3840 px and 240 at 1920 px
  (film 1: about 6 min and 75 s a frame at 16 samples), scaled down for more samples. More blocks than runners is
  fine; they run as runners free up. Over 256 blocks (GitHub's matrix limit) the plan stops with a clear error.
  *Why:* the old planner cut one block per runner, so a 4K run at 7 runners would have made 366-frame blocks, about
  36 h each; film 1's 4K plates only worked because their 73 blocks were listed by hand.
- **Film 1's 4K plates** (about 260 runner-hours): about 13 h at 20 runners, 37 h at 7. Either way, start each shot's
  4K plates as soon as that shot passes its viewer review (§3a steps 8–9), never at the end.

**Setting up the token (the owner, once, about five minutes in a phone browser with "Desktop site" on):**
1. github.com → profile picture → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** →
   Generate new token. Name `runner-share`; expiration 1 year; resource owner `mkmk749278`.
2. Repository access: **Only select repositories** → `The-Mechanical-Paradox`, `Creator`, `Built-on-Bharat`.
3. Permissions → Repository permissions → **Actions: Read-only** (Metadata read-only is added by itself). Nothing
   else. Generate, and copy the token.
4. `The-Mechanical-Paradox` → Settings → Secrets and variables → Actions → New repository secret: name
   `RUNNER_SHARE_TOKEN`, paste, Add. The token can only read workflow status; it can't change anything.
- A queued run is not a failed run: before re-dispatching, check whether the first one is still waiting.
- The sister repos set their own share; this repo can't change their workflows.

**Anything that would cost more** (a higher Gemini cap,
more ElevenLabs characters than the plan, a paid tool) **is asked with AskUserQuestion, and the pipeline carries on
with every step that doesn't need it.** Never anything outward-facing beyond our repos and Drive.

### 3a.5 Reporting
Each merged step gets one or two lines in the chat (what was made, what passed, what runs next). The owner is sent
only finished things (§1): the 4K master and the package at step 12, never a draft or a test.

---

# Part B: The channel

## 4. Identity and audience

**The Mechanical Paradox (`@themechanicalparadox`)**: *The engineering that shouldn't work. The invisible physics
that makes it.* Forensic deconstructions of everyday machines and physical laws that seem impossible at first glance,
rendered entirely in code: physics simulations, exploded cross-sections, live schematics (owner's blueprint, Part G).
Sister channels: *Be Practical with Kishore* and *Built on Bharat*.

### 4.1 Audience
**Global English**, with the Tier-1 markets first (US, UK, Canada, Australia, Germany, India). Curious adults who
liked science and never got the real explanation; engineers and students who want the mechanism one layer deeper than
common knowledge; people who watch the big engineering explainer channels.
- **Language: simple, international spoken English.** American spelling in titles, descriptions and on-screen text
  (the US is the largest Tier-1 market; one spelling everywhere looks deliberate). Words any educated non-native
  speaker knows. No regional slang or idioms (no "y'all", "mate", "na", "yaar", "innit").
- **Units: SI first**, with the US customary value in a smaller second line where a US viewer needs a feel for it
  ("120 km/h · 75 mph"). Physics stays in SI.
- **Examples from everywhere.** A train in Japan, a lift in Mumbai, a teapot in London: the physics is universal and
  the viewers should see their own world in it. India is home, never a lecture topic: no flag-waving, no "Indian
  pride" framing on this channel (that is Built on Bharat's job).

### 4.2 What we make, and what we never make
- **Make:** one paradox per film, solved down to the physical threshold (the creep regime, the slip ratio, the stress
  at the notch root), so a viewer can explain it to a friend afterwards.
- **Never:** surface trivia, textbook recaps, motivational content, "10 facts" lists, hype ("this will BLOW your
  mind"), fear-mongering about everyday objects, or absolute claims that are false ("never derails", "cannot fall").
  The paradox is in the physics, not in an exaggeration.

### 4.3 Topics
An everyday object or machine + a broken intuition + a mechanism that can be drawn + a cost. The test: can the viewer
feel the question in one second, and can we *show* the answer moving? The launch slate (§17.3) follows the blueprint;
further candidates, scored, are in §17.4.

**The topic gate (owner's research brief, 2026-11-07; Part G.2).** Before a `brief.md` is written, score the topic
1–10 on four criteria, and put the scores, one line of reason each, at the top of the brief:
1. **Familiar, not understood.** The viewer meets it often and couldn't draw how it works (the illusion of explanatory
   depth, §4.5). 1–3: machinery few adults ever see; 8–10: trains, bicycles, lifts, kettles, bolts.
2. **Drawable.** The paradox resolves into geometry, contact, flow or a stress field we can draw truly (§6.4, §8).
   1–3: chemistry, software, fields with no geometry to show.
3. **Packable.** The question fits in 3–6 plain words with no jargon and no false absolute (§9.2, §13.2–13.3), and
   reads across a living room and on a phone.
4. **The catch.** Solving the first problem creates a second one with a real name (hunting, shimmy, fatigue,
   cavitation): the trade-off beat of §5.4. 1–3: a mechanism with no real cost (a scissor lift).

**35–40: greenlight. 28–34: re-angle the package or find the real catch before any animation. Under 28: drop** (or a
Short). Plus one pass/fail line the brief left out: **5. Sourceable.** The mechanism, its threshold and its catch can
each be confirmed from a primary source (§9.1) before the treatment. *Why:* the report that proposed the rubric got the
physics wrong in several of its own top ten (§17.4); a topic we can't source, we can't make.

### 4.4 Who watches, and why (research, 2026-11-07)
These are working hypotheses for the Studio reads (§13.1) to confirm or kill. None is ever stated in a film.
- **The big screen matters.** YouTube had 15.8% of all US TV viewing in August 2026, its record and well ahead of the
  next distributor (Nielsen, *The Gauge*, released 2026-10-22). In a YouTube/Nielsen study, adults watched YouTube on
  a TV together 26% of the time. So a film must hold a living room as well as a phone held sideways: the phone stays
  the binding case for text size (§6.4a); the TV is the binding case for pace, picture detail and sound.
- **Who.** The commissioned report profiles the core viewer as 35–64, practical and STEM-adjacent (engineers,
  technicians, developers, tradespeople, hobbyists), watching lean-back in the evening and at weekends, and finding
  most videos on the home feed. Its exact numbers (a 42–55 core, 88% male, over 70% from browse) carry no source:
  treat them as a guess until our own Studio data shows the real audience. The global, partly non-native audience of
  §4.1 is unchanged.
- **Why they watch** (the report's three reasons, which fit the evidence in §4.5): to get back a feel for how the
  physical world works in an age of sealed boxes; to have their own experience of how things wear, bend and fail
  taken seriously; and for the click of insight when a complex thing collapses into one simple principle.
- **What drives them off:** hype, performed excitement, a lecture, hidden sponsorships, being talked down to.

### 4.5 What the evidence says, and what we take from it
The owner commissioned a deep-research report (brief in Part G.2; a long report and a short production summary came
back, 2026-11-07). Each claim that shapes a rule was checked; this is the verdict. Sources are listed below the table.

| Claim (report) | Verdict | Evidence | What changes here |
|---|---|---|---|
| People think they understand everyday mechanisms far better than they do; exposing the gap wins the click and the watch. | **Confirmed** | Rozenblit & Keil 2002 [1]: the illusion is far stronger for explanations than for facts or procedures. Lawson 2006 [2]: people who ride bicycles make serious errors about how one works (a chain round both wheels). | Topic gate criterion 1 (§4.3); the wrong model said out loud in the cold open (§5.1). |
| Say the misconception before the explanation. | **Confirmed, and stronger than the report says** | Muller's physics-education research (PhD, Sydney 2008; Muller & Sharma [3]): expository videos left wrong ideas in place and made students more confident in them; videos that voiced the misconception first taught better. | §5.1, §5.4 beat 1. |
| A formula on screen drops 15–35% of viewers within 30 s; physical intuition holds 60–70% average percentage viewed. | **No source; numbers not adopted** | The report cites nothing for either. What is well evidenced: narration + animation beats the same with redundant on-screen text (redundancy, d ≈ 0.87); words and picture must arrive together (temporal contiguity, d ≈ 1.30); extra material hurts (coherence, d ≈ 0.70); cues help (signaling, d ≈ 0.46) [4]. | §8.7: no derivations, no symbol without its thing. |
| Narrate at 135–150 wpm. | **Contradicted as a rule** | Guo, Kim & Rubin 2014 [5] (6.9 M edX sessions): engagement rose with speaking rate within each length band; the 145–165 wpm band was the least engaging, which the authors put down to flat, low-energy delivery. A listening study (155 vs 178 wpm) found the faster rate cut comprehension for native and non-native listeners alike [6]. | §7.5: about 145–165 wpm after the edit, with life from rhythm and pace changes. |
| A 1.5–2.5 s narration pause after a big visual reveal. | **Adopted** | Fits temporal contiguity [4] and our §7.2.8. | §7.5, the reveal hold. |
| The five beats: paradox → trick → fatal trade-off → industrial compromise → coda. | **Adopted, mapped onto §5** | Craft, not data; it is the blueprint's shape with the trade-off made a beat of its own. | §5.4. |
| Hook within 6 s; confirm the thumbnail within 30 s. | **Adopted as a tightening** | YouTube's key-moments report calls the first 30 s "the intro" [7]; on the sister channel two thirds of leavers were gone by 0:45 (§5.1). | §5.1. |
| CTR for technical content benchmarks at 4–10%. | **Corrected** | YouTube: "Half of all channels and videos on YouTube have an impressions CTR that can range between 2% and 10%"; home impressions run lower, videos under 100 views vary more [8]. | §13.1: CTR against our own videos, per traffic source. |
| Viewer satisfaction feeds the recommendations, not only watch time. | **Confirmed** | YouTube: "User surveys that ask you to rate videos that you watched helps the system understand satisfaction, not just watch time"; the home feed "primarily relies on your watch history" [9]. | §13.1 item 7. |
| Films of 8–12 minutes. | **Decided by the owner: no length limit (§17.1 decision 12)** | No source in the report. TV sessions run long (a 2024 industry report, not YouTube's own figure: about half of the videos played on TVs were over 11 minutes); in online courses, engagement fell beyond about 6 minutes [5] (a different audience). | As long as the physics needs, as short as possible. |
| Small 3D channels fail on structure, not render quality: the assembly-manual tour, the missing trade-off, slow orbits padding the voice, "How X Works" titles. | **Adopted** | The report's analysis (craft); consistent with §5 and §13. | §5.2, §6.5, §13.2. |
| One tactile analogy grounds an abstract force (shear as a deck of cards; resonance as a swing pushed at the top). | **Adopted within the existing limit** | Craft; blueprint §6.1 still rules. | §7.2.5. |
| *(Not in the report)* Multi-language audio tracks. | **New opportunity** | YouTube's pilot: creators using multi-language audio got over 25% of their watch time from views in a language other than the video's own (reported at the Sept 2025 rollout) [10]. | §17.1 decision 13: YouTube auto-dubbing. |
| *(Not in the report)* Title testing. | **New tool** | Test & Compare tests titles as well as thumbnails (wide rollout by Dec 2025, per press reports) and picks the winner on watch-time share, not CTR [11]. | §13.1 item 5. |
| *(Not in the report)* Ask before you show. | **Adopted** | A question asked before a video segment improves learning of what it asks, but only when the video answers it [12]. | §7.2.10. |

**Sources (read 2026-11-07).**
[1] Rozenblit & Keil, "The misunderstood limits of folk science", *Cognitive Science* 26(5): 521–562 (2002).
[2] Lawson, "The science of cycology", *Memory & Cognition* 34(8): 1667–1675 (2006), doi 10.3758/BF03195929.
[3] Muller & Sharma, "Tackling misconceptions in introductory physics using multimedia presentations",
https://openjournals.library.sydney.edu.au/IISME/article/view/6345; Muller, *Designing Effective Multimedia for Physics
Education*, PhD thesis, University of Sydney (2008).
[4] Mayer, *Multimedia Learning*, 3rd ed. (Cambridge, 2020); Mayer 2017, "Using multimedia for e-learning", *Journal
of Computer Assisted Learning* 33(5), doi 10.1111/jcal.12197 (effect sizes as summarised by secondary sources; check
the paper before quoting a number in a film).
[5] Guo, Kim & Rubin, "How video production affects student engagement: an empirical study of MOOC videos", Learning
at Scale 2014, https://www.cs.rochester.edu/hci/pubs/pdfs/edX-MOOC-video-production-and-engagement_LAS-2014.pdf
("for 6–12 minute videos, engagement dips in the middle bucket (145–165 wpm)").
[6] "Synthesized speech intelligibility and persuasion: speech rate and non-native listeners", Western Sydney
University, https://researchers.westernsydney.edu.au/en/publications/synthesized-speech-intelligibility-and-persuasion-speech-rate-and/
[7] YouTube Help, "Measure key moments for audience retention", https://support.google.com/youtube/answer/9314415
[8] YouTube Help, "Impressions and click-through rate FAQ", https://support.google.com/youtube/answer/7628154
[9] YouTube Help, "How YouTube recommendations work", https://support.google.com/youtube/answer/16089387
[10] TechCrunch and others on the multi-language audio rollout (Sept 2025), e.g.
https://www.businesstoday.in/technology/news/story/youtube-launches-multi-language-audio-for-millions-of-creators-extending-global-reach-with-auto-dubbing-493458-2025-09-11
[11] Search Engine Journal, "YouTube title A/B testing rolls out globally to creators",
https://www.searchenginejournal.com/youtube-title-a-b-testing-rolls-out-globally-to-creators/562571/
[12] Carpenter & Toftness, "The effect of prequestions on learning from video presentations", *JARMAC* (2017);
St. Hilaire & Carpenter (2020); Pan & Carpenter (2023) meta-analysis (common but not universal).
Also: Nielsen, *The Gauge*, August 2026 (released 2026-10-22), via https://www.tubefilter.com/2026/10/22/nielsen-the-gauge-youtube-record-watch-time-share-us-tv/amp/;
the YouTube/Nielsen co-viewing figure via Think with Google,
https://thinkwithgoogle.com/intl/en-emea/consumer-insights/consumer-trends/future-of-tv-shared-experience

These are channel-level sources for how we work. A film that states any of them on screen still needs its own
`claims.csv` row (§9.1).

## 5. Story architecture

### 5.1 The first minute (data from the sister channels' Studio, 2026-10-17)
On the sister channel, about two thirds of the viewers who left were gone in the first 45 seconds; a welcome, a logo
sting and a title card at 0:25–0:45 dropped retention from 47% to 33%. So:
- **0:00–0:12: the broken intuition**, in motion, on the thumbnail's own object (blueprint §6.3: within 12 seconds).
  No greeting, no logo, no channel name, no agenda. **Tightened (2026-11-07, §4.5):** the picture moves from frame 0
  and the contradiction is spoken by about 6 s; 12 s is the hard limit, not the target.
- **Make the viewer's own wrong model visible.** Say what most people think, show it, then show it fail, before the
  real mechanism. *Why:* in Muller's physics-education studies, plain explanations left wrong ideas in place and made
  students more sure of them; videos that voiced the misconception first taught better (§4.5). The wrong model must be
  one a smart adult really holds, never a straw puzzle (film 1, §16).
- **By 0:30: the promise**: the specific question this film answers.
- **By 0:55: the open loop**: a turn that makes the obvious answer wrong ("and the flange you think holds it on? It
  almost never touches the rail"), paid off later at a stated point.

### 5.2 The body
- **No assembly-manual tour.** Never open a chapter by naming parts; a part arrives when the story needs it to solve
  the problem in front of the viewer. *Why:* the commonest failure of small 3D engineering channels is a beautiful
  exploded view with no conflict (§4.5).
- Chapters of about 1–2 minutes, in a film with no length limit (owner, 2026-11-07: as long as the physics needs, as
  short as it can be while still explaining it fully), each with
  its own question, turn and payoff. Each chapter adds **one layer** of mechanism.
- **Intuition → test → failure → mechanism → proof.** Show the naive model failing first (a cylinder wheelset
  screeching, a tire that doesn't slip and goes nowhere), then the real mechanism, then a proof the viewer can check
  (numbers, a limit case, a real-world consequence).
- **The edge case and the trade-off**: every clever mechanism has a cost (the conical wheel's hunting oscillation, the
  single crystal's price). Saying it builds trust with the engineers in the audience.
- **The landing:** the image the viewer will see next time they meet the object, then one forward line into the next
  film (series chain, §13.7). **The channel name and the sting only in the outro** (`ChannelSting`, §6.2).

### 5.3 Story deliverables per film
`brief.md` (package first, §13.2) → `research/` → `treatment.md` → `claims.csv` → `script/screenplay.md` (TIME | VO |
VISUAL | HUD | SFX, with the Q column) → `script/vo.txt` → `scenes/<scene_id>.md` handoffs → the Remotion code.

### 5.4 The five beats (owner's research brief, 2026-11-07)
The story shape of every film, mapped onto §5.1–5.2. Times are shares of the film, since the topic sets its length.
1. **The paradox (to about 0:45).** The object moving; the viewer's own model said out loud; why, by that model, it
   can't work. The thumbnail's question confirmed by 0:30, the film's open loop by 0:55.
2. **The trick (to about 40%).** The simple geometry, contact or force that resolves it, built one layer per chapter
   (intuition → test → failure → mechanism → proof). The viewer gets the click and believes the problem is solved.
3. **The catch (about 50–65%).** The same trick creates a second problem with a real name and number (the cone's
   hunting, a bolt's fatigue, a wedge's deceleration). It arrives as a "but", where retention usually sags, never as
   an appendix. This is the beat that separates us from the clinical-cutaway channels (§4.5).
4. **The truce (to about 90%).** How real engineers live with both problems: a tolerance, a damper, a material, a
   chosen operating range, each with its own cost. A balance, never a victory.
5. **The landing (the last 20–40 s).** The image the viewer will see next time they meet the object, and one line on
   what the trade-off means: engineering as choosing which problem you can live with. Written fresh for each film,
   never a stock slogan and never a summary; then one forward line and the sting.
*Why:* the report's arc (Part G.2) is the blueprint's shape with the trade-off promoted to a beat of its own, and
film 1 already followed it (the cone steers; the cone hunts; flatter cones and stiffly held axles calm it, and
cost it on curves). The report's own coda line
("Engineering is rarely about discovering a flawless mechanism…") is an example of the feeling, not a line to reuse.

## 6. The look

### 6.1 Palette and type (`config/brand.yaml`, generated into `lib/remotion/brand.ts`)
| Role | Token | Hex | Meaning |
|---|---|---|---|
| Canvas | `bg` | `#070A0F` | Abyss Black. Never pure `#000000` |
| Lifted canvas | `bg_lift` | `#0D1420` | light pools, panels, plate faces |
| Grid | `grid` | `#141E2C` | Blueprint Slate: grids, reference axes |
| Linework | `line` | `#F0F4F8` | Blueprint White |
| Metal | `metal` | `#6A7B8C` | Cast Iron Gray: housings, shafts, frames |
| Precision surface | `specular` | `#F1F5F9` | polished edges, gear faces |
| Tension / heat / failure | `crimson` | `#FF3B30` | |
| Compression / flow | `cyan` | `#00E5FF` | |
| Equilibrium / correct path | `emerald` | `#00F59B` | |
| Friction / boundary layer / fields; the paradox point | `amber` | `#FF9F1C` | |

**Colour = meaning, every frame.** A colour never decorates: if something is crimson, it is in tension, hot or
failing. A viewer who learns the code in the first film reads every later film faster.
Fonts (vendored OFL, `public/fonts/`): **Archivo** Black, expanded width (display: titles, chapter cards);
**Inter** (labels, callouts, subtitles); **JetBrains Mono** (HUD, kickers, variable names; Greek subset loaded for
ω, σ, τ, μ).

### 6.2 Brand assets (`assets/brand/`, built by code in `brand/`)
- **The Locked Trio** (`brand/build_logo.py`): three equal 15-tooth **cycloidal gears** (radial flanks, ogival tips,
  the clock-wheel profile) meshed in a closed ring, every mesh checked to 0.01°. The paradox is real: three external
  gears in a ring can never turn, because each must spin against both neighbours. Amber light at the jammed mesh; a
  delta crosshair in the void at the centre. Files: `logo.svg` (master, blueprint construction lines),
  `logo_mark.svg`, `avatar.svg` + `avatar_800.png` (solid white plates: line art turns to mist at 98 px),
  `favicon.svg` (9 teeth, solid), `watermark_300.png`, `logo_2048.png`.
  *Design notes (2026-10-31):* an over/under "impossible depth" version (A over B over C over A, after the Penrose
  tribar) was built and dropped: meshing gears are coplanar, so the drawing would have been physically false, and the
  brand is "pure scientific truth". The blueprint's "impossible isometric loop" is carried by the locked ring itself;
  depth comes from real plate thickness. Odd tooth counts were forced by geometry: three equal gears on a triangle
  mesh cleanly only when the tooth count is 6k+3 (9, 15, 21…).
- **Banner** (`brand/build_banner.py` → `banner_2560x1440.png/.jpg`): an exploded isometric **cycloidal reduction
  drive** (12 ring pins, 11-lobe disc, eccentric, 6 output pins; the build asserts all 12 pins touch the disc). Every
  callout is true of the drawing (z₁ = 11, z₂ = 12, e, i = −11 : 1). The blueprint's sample callouts (σ_yield =
  1,150 MPa…) were left out: a stress number on a part with no stated material is a number without a source.
  YouTube (Help 10456525, read 2026-10-31): upload ≥ 2048×1152, ≤ 6 MB; text and logo safe area 1235×338 at that
  size = **1546×423 centred at 2560×1440** (x 507–2053, y 508–931). Phones show only the safe area, desktops the full
  width at the safe height, TVs everything; all text and the whole drive sit inside the safe area. The blueprint's
  cadence badge was removed by the owner (2026-10-31, §17.1).
- **ChannelSting** (`src/channel/ChannelSting.tsx`, 5.5 s): the pen draws the trio, the plates take form, torque goes
  in, the ring jams (the teeth wind < 1° and spring back, the frame takes the hit, amber at the mesh), then the name
  and the tagline, and the honest telemetry: `ω = 0.000 rad/s`. Outro only.

### 6.3 Three layers in every frame
1. **A moving base**: a 3D or 2.5D scene, an exploded cross-section, a simulation, a schematic on the blueprint grid.
2. **Atmosphere**: grain, vignette, light pooling on the subject (`lib/remotion/Blueprint.tsx`: `Blueprint`,
   `Atmosphere`).
3. **Kinetic accents**: the HUD (§8.4), callouts with leaders, dimension lines, counters, equations that build.

### 6.4 Motion rules (blueprint §2.3, made concrete)
- **Continuous micro-motion:** nothing static for more than 2.5 s (blueprint) — and on the sister channels nothing
  unmoving over 1.5 s was the measured bar; aim for that. Every shot rides the mathematical Ken Burns
  (`microPush`: 1.02 → 1.05) and its own physical motion (shafts spinning, streamlines flowing, particles).
- **A visual change about every 3.5 s** (sister channels, measured on retention): a new angle, a new layer, a
  callout, a state change. Never two changes in the same instant.
- **Only motion a viewer can see counts (2026-11-03).** A camera move of about 3% scale or 30 px across any 4 s hold
  at 1080, a part moving, a field blooming, a HUD value ticking, a callout arriving on its word. Grain, the grid's
  drift and a microPush stretched over a long hold do not. Plan the dead spots: after an equation finishes building,
  after a counter lands, after an exploded view has fully separated. *Why:* an outside review of a finished
  documentary cut on another production found 5–9 s holds that had passed two reviews on grain and drift alone.
- **True physics easing:** never linear for a physical body. `physical()` uses the channel spring (mass 1.2,
  damping 24, stiffness 180); a different body may use its own constants when the physics calls for it (a stiff steel
  part rings faster: say so in the scene doc). `shudder()` for impacts and jams. Camera and type use eased curves.
- **Show the real kinematics:** when gears turn, their speeds follow the tooth ratio; when a wheelset shifts, the
  rolling radii follow the cone. A viewer who pauses the frame should find the geometry true.

### 6.4a Legible on a phone, a desk and a TV (2026-11-03)
The audience is global and watches on all three; the binding case is a phone held sideways at arm's length. Reading
research puts the smallest size read at full speed at about 0.2° of x-height (Legge and colleagues); for a 1080 frame
about 65–70 mm tall that is a font of about 36 px. At the 1920×1080 authoring size:
- **≥ 36 px** for what the narration points to: the HUD value, the callout name, the equation's variable being
  explained, honesty labels (ILLUSTRATION, ILLUSTRATIVE VALUES, NOT TO SCALE).
- **≥ 26 px** for every other label that carries a fact: HUD row titles, units, dimension values, source lines.
- **Contrast:** small text at 7:1 or better: `ink` `#FFFFFF` or `sub` `#8B9EB5` (7.2:1 on the canvas). **`muted`
  `#5A6E85` (3.8:1, below WCAG AA) is for construction lines and decoration only, never for a label a viewer must
  read.**
- All text inside the central 90% of the frame (EBU R95 graphics-safe), on `bg_lift` or a scrim, never crossed by a
  grid line; nothing clipped at a panel edge in the end state of a build.
- **The test:** every frame of the 720p review cut, read at full-frame size. A label an outside reviewer misreads is
  too small.

### 6.5 Looks to avoid (extend this list)
Glass cards; neon dashboards; a centred title on a gradient; icon grids; bullet lists; text cards; stock "science"
particles that mean nothing; a flat colour or plain gradient canvas; red flashing icons for failure (use the stress
field, §8.5); a decorative HUD with numbers that don't match the narration; slow-zoom on a static diagram for more
than one beat; a slow 360° orbit around a model while the voice pads for time; a part-naming tour of an exploded
view (§5.2). Every camera move, cut or colour change must reveal something the narration needs at that moment.

### 6.6 Branding inside a film
No logo, name or sting before the outro. A small, low-opacity mark in a corner is optional (decide on the first film).
The thumbnail never carries the logo.

## 7. Narration

Narration is the most important thing (the sister channels' measured lesson and the owner's directive): the picture
keeps the eyes, the narration keeps the person. A synthetic voice makes flat writing flatter, so the writing carries
the life.

### 7.1 The voices we never use
- **The textbook:** definitions first ("A conical wheel is a wheel whose tread is a frustum of a cone").
- **The news reader:** the ending first, big adjectives, passive voice.
- **The flat voice:** every sentence the same length and weight, no questions, no turns.
- **The hype voice:** "this will blow your mind", "scientists are baffled".

### 7.2 What makes a viewer lean in
1. **Start inside the paradox, in motion.** The first sentence states the broken intuition with a concrete object
   (blueprint §6.3: "A one-hundred-ton locomotive has no steering wheel…" is the shape; its facts get checked like any
   other line).
2. **Specific beats general:** one wheel, one curve, one number.
3. **Chain with "but" and "so", never "and then".** Each beat is caused by the last or works against it.
4. **Curiosity loops at three sizes:** film (opened by 0:55, paid at the end), chapter (opened and closed inside it),
   and small ones every 20–40 s. Never open a loop the film doesn't close. People get curious when they know some of
   something and see the gap (Loewenstein 1994, *Psychological Bulletin* 116: 75–98): give the reference point, then
   the gap.
5. **Physics over metaphor** (blueprint §6.1): an analogy may open a door, then the real mechanism walks through it,
   with its real name and number. Never stop at "the metal gets stressed". At most one analogy per mechanism, from the
   viewer's own hands and adult life (a deck of cards sliding for shear, a swing pushed at the top for resonance),
   never a cartoon ("angry little electrons"), and it must not be false in the way that matters.
6. **Ask the viewer's own question out loud**, then answer it ("So why doesn't the outer wheel just slip?").
7. **Rhythm:** a long, flowing line, then a short punch. The key line on its own.
8. **Leave room for the picture.** Never describe what is on screen; say what the picture can't: the stakes, the
   number, the irony. Let the machine's own sound carry 1–3 s at big moments.
9. **End on an image and a feeling,** never a summary, then one forward line into the next film.
10. **One prediction question before the biggest reveal.** Ask the viewer to guess ("Which wheel has farther to
   go?"), give a beat, then show the answer on screen. *Why:* questions asked before a video segment improved learning
   of what they asked about, but only when the video then answered them (Carpenter & Toftness 2017; St. Hilaire &
   Carpenter 2020). Never a question the film leaves open.

### 7.3 Words, rhythm and the banned list
- Plain spoken English: "but" not "however", "so" not "therefore", "about" not "approximately". Technical terms are
  welcome **when the film shows and explains them on screen**; list them in the film's `script/terms.txt` (the
  spoken-English check reads it, §15).
- **The breath test:** nothing over about 25 words; never three sentences of the same length in a row.
- **Banned:** "Hey guys", "Welcome back", "In this video", "Today we'll", "Let's dive in", "Let us understand",
  "Smash that like", "mind-blowing", "insane", "you won't believe", moreover, furthermore, delve, harness,
  testament to, imperative, in conclusion; regional slang. **Hand-waving and apology** (2026-11-07): "it works like
  magic", "without getting too complicated", "don't worry about the maths", "basically just", "scientists can't
  explain". **Calls to action** in the narration: none before the landing, and the end screen does the asking.
- **TTS text:** units and symbols spelled the way they are said (blueprint §3.3): `mega-pascals`, `kilo-newtons`,
  `micro-meters`, `kwahn-DAH` (Coandă); numbers as words; letter acronyms with dots (L.E.D., A.B.S.); no digits,
  symbols or brackets in `vo.txt`.

### 7.4 The lean-in test (every paragraph, before recording)
`script/screenplay.md` carries a **Q column**: the question the viewer is holding during that paragraph. Empty Q =
cut or rewrite. Also: is there a "but" or a "so"? Would a textbook say it this way? Can it go? Does the last line pull
into the next?

### 7.5 Pauses and the TTS voice (measured on the sister channel, 2026-10-25)
The blueprint (§3.3) asks for `—` as a 250 ms breath and `...` as a 400 ms hang. **Measured on ElevenLabs Eleven v4
(Akash) on Built on Bharat:** `...` gave 0.00–0.16 s at 9 of 9 mid-sentence uses, and every tag layer (voice
descriptions, emotion tags, even `[pause]`) either changed the voice or sounded synthetic. The owner's ruling there:
commas and full stops only. **So, here:** pauses come from full stops, commas and paragraph breaks; the exact 250 /
400 ms beats are cut in the edit from the word timings (`scripts/vo_timing.py`), where they are frame-exact and never
depend on the voice. `—` and `...` stay allowed in the screenplay as **edit marks** and are stripped from the
recording text. **Measured on this channel's voice (2026-11-04):** Eleven v4 ignores its `speed` setting too, so the
pace is also set in the edit (edit breaths in `scripts/vo_timing.py`, §16).
**Pace (2026-11-07):** about 145–165 wpm over the film after the edit breaths (film 1: 162). The research report's
135–150 wpm is not adopted: the largest study we found (Guo et al. 2014, 6.9 million edX sessions) saw the 145–165
band as the *least* engaging and put it down to flat delivery, not speed (§4.5). So the life comes from the writing's
rhythm (§7.2.7) and from pace changes inside the film, never from a slow, even read. **The reveal hold:** on each
signature reveal (2–3 per film) the edit holds the voice for 1.5–2.5 s while the picture keeps moving (§6.4) and the
machine's own sound carries the moment.

### 7.6 Voice
**The account's own ElevenLabs voice "The Mechanical Paradox"** (owner, 2026-11-04, §17.1 decision 6; it replaced
the three-voice audition of 2026-10-31), on the newest Eleven flagship model (decision 8). Never synthesise a real
person's voice.

### 7.7 Recording blocks
Claude generates the voice itself (decision 6). Once the script is final, every block goes in one file,
`script/blocks_performance.md` (decision 7), each headed with block number, character count, voice, settings and the
file name; block 1 is generated and measured first, then the rest (§3a, step 6).

### 7.8 Checks before the owner sees a narration
1. Fact and physics gate: every factual line maps to a confirmed `claims.csv` row (§9).
2. The lean-in test on every paragraph.
3. `scripts/spoken_english_check.py script/vo.txt --terms script/terms.txt --min-words 500 --max-words N`, with N
   from the treatment's planned length at about 155 wpm (films have no fixed length: decision 12).
4. **Independent audience review:** a new cloud session with no repo gets `prompts/audience_review_v2.md` (five
   everyday-physics fans from around the world, judged on satisfaction; §3a.3), once on the story (stage SCRIPT) and
   once on the performed narration (stage NARRATION). Apply fixes that keep every fact true, save
   `films/<slug>/review/audience_vN.md`, archive the session. (v1, six viewers, was used for film 1.)

## 8. Visual explanation toolkit (`lib/remotion/`)

### 8.1 Virtual camera
Every shot moves (§6.4). Push in to the contact point as the narration reaches it; orbit an exploded assembly to
reveal the hidden part; rack from the macro view to the micro view (the tire → the contact patch → the tread block
→ the asphalt asperity) as one continuous move, never a cut, when the film goes down a scale.

### 8.2 Exploded and cut-away views
Parts separate along their real assembly axis, in assembly order, with dashed centre lines (the banner's drive is the
model). Cut-aways use a clean section plane with hatched faces in the material's tone.
**Each part on its own word (2026-11-03):** an exploded view, a list of parts or a multi-term equation never arrives
all at once; each part separates or lights as the narration names it (`wf(id, word)`), and its label stays inside the
frame and the panel. *Why:* on another production a five-part fastener stack spread in one second, ahead of its words,
and its last label was clipped by the panel edge.

### 8.3 Mechanisms built from real geometry
Gears from `gears.ts` (cycloidal, mesh-checked); cams, linkages and wheel profiles from their real equations. A
mechanism that would jam or interfere in reality must not run smoothly on screen. Write a check (like the trio's
mesh check or the banner's pin-contact assert) for every new mechanism.

### 8.4 The HUD (`Hud.tsx`; blueprint §2.3 rule 4)
A fixed monospace window (top-right by default; bottom-right when the subject is up there; never inside YouTube's
bottom 20% or under its top-right overlays) whose values tick with the narration. **Every row carries a `source`:**
a `claims.csv` id, or `ILLUSTRATIVE`, and the panel then says "ILLUSTRATIVE VALUES". A HUD number never contradicts
the voice. Tabular figures so digits don't jitter.
**The HUD and the picture share one driver (2026-11-03):** a value and the part, trace or field it describes move
together; never a trace at its minimum while the readout still shows the starting value. A highlight or callout starts
a few frames before its word so it completes as the word lands. Word times inside a sentence are spread by length,
so check the signature cues by ear.

### 8.5 FEA stress fields (`three/fea.ts`; blueprint §2.3 rule 3)
Failure is never a flashing icon: it is a von Mises field blooming navy → cyan → yellow → red at the notch, crack
root or contact patch, with iso-stress contour lines. The shader's analytic field (nominal stress + hotspots falling
off as 1 / (1 + (d/r)²)) is a teaching model: its peak factors come from a source (a Kt chart, a paper) or are
labelled ILLUSTRATIVE. When we have a real FE result (our own run, or a published one we may use), bake it into the
`stress` vertex attribute. Never present the analytic model as a simulation result.

### 8.6 Fluids, particles and fields
2D canvas or GPU particles for flow, Brownian motion and field lines, seeded with `random(seed)` so every render is
identical. Streamlines follow a real velocity field (potential flow, a boundary-layer profile, a published solution),
never a hand-drawn swoosh.

### 8.7 Equations
**No derivations, ever, and no symbol on screen without the physical thing it stands for** (2026-11-07, §4.5). Numbers
live first on the HUD and the dimension lines. An equation appears only where it is the proof a viewer can check
(film 1: the radius difference is twice the taper times the shift), one or two per film at most. It builds term by
term as the voice names each term, each term tied by colour and a leader line to the thing it measures, with its
unit; a Greek letter only with its word beside it. One equation on screen at a time, never a static slide of maths,
never an equation as decoration. *Why:* narration with animation teaches better than the same with redundant text,
and symbols the viewer must hold in memory compete with the narration (Mayer's redundancy and coherence principles);
the commissioned research names formula-heavy scripts as the main cause of early drop-off in explainers (its
percentage is uncited, but the direction matches the evidence).

### 8.8 Real footage and photos
**Owner, 2026-11-04: use real clips to show the reality of what we describe** ("when they see real footage the
audience gets the idea"). So: short inserts (2–5 s) of the real thing at the moment the narration names it, then the
drawing takes over to explain; graded toward the palette (`Footage.tsx`: desaturated, navy wash, grain), credited on
screen, licence logged in `media_manifest.csv`. Never a game or simulation render passed off as real (film 1: a
Pixabay "night locomotive" clip was a train-simulator render; rejected). Sources that work from the cloud: the
Pixabay video API (`PIXABAY_API_KEY`). The rule before it, kept for evidence photos:
The blueprint's rule was **zero stock video**: the channel is 100% code-rendered. Where a real event is the evidence
(a real derailment report photo, the 1854 demonstration engraving, a real teardown), the creative director may propose
it in the treatment; it needs a licence that allows commercial use (§11) and a credit, and is shown as what it is.

---

# Part C: Production

## 9. Facts and honesty

### 9.1 What must be true
Every name, date, number, quote, place, outcome **and every physical claim** (a mechanism, a threshold, an equation,
a value on the HUD) comes from collected sources, with a row in `claims.csv`
(`id,claim,on_screen,timecode,status,source_url,source_quote,note`). `confirmed` needs a primary source (a standard,
a paper, a manufacturer's datasheet, a patent, an accident report) or two independent reputable reports. Textbook
physics still gets a row (a textbook or a paper). The model's knowledge stops at June 2026: never state a fact from
memory. `scripts/claims_check.py films/<slug>/claims.csv` is the gate before any render.

### 9.2 No absolutes the world contradicts
"Never", "always", "impossible", "cannot" are claims too. Trains do derail; lifts have fallen. Say what the physics
guarantees and under which conditions ("on a gentle curve the flange need never touch").

### 9.3 Simplification is allowed, falsehood is not
A model may be simplified (a 2D section of a 3D contact, a rigid wheelset) when the film says or shows it is a model,
and the simplification doesn't flip the conclusion. Contested explanations are attributed ("a 2010 study found…;
a 2021 analysis argues…").

### 9.4 Labels
- `ILLUSTRATION` on any rendered scene a viewer could take for real footage or measured data (photo-real 3D, a
  simulated video-like shot).
- `ILLUSTRATIVE VALUES` on the HUD when values aren't sourced (§8.4); `NOT TO SCALE` when scale is exaggerated (a
  1:20 taper drawn at 1:5 so it can be seen).
- YouTube's altered/synthetic content disclosure: answer it honestly per film (synthetic voice; realistic
  reconstructions).
- Corrections: a `Correction: [timestamp]` line in the description for any error found after upload.

### 9.5 Respect
Accidents (lift failures, derailments, engine failures) are told with dignity: no gore, no victims' faces, every
figure attributed. No brand bashing: when a product fails, explain the physics and the design trade-off, name a
company only with a source.

## 10. Remotion engine

### 10.1 Setup and pins
- **One workspace for every film** (repo root): `package.json`, `src/Root.tsx` (each film registers its compositions
  in its own `<Folder>`), `lib/remotion/` shared code, `public/fonts/`, `public/films/<slug>/` (media from Drive,
  gitignored). *Why:* code-rendered films share most of their code; one install serves the render farm.
  Upgrade versions deliberately between films, never mid-film.
- **Pins (2026-10-31):** `remotion` and every `@remotion/*` at **4.0.534** (the version the sister channel measured in
  the cloud and on the farm); React **19.2.3**, three **0.178.0**, @react-three/fiber **9.2.0** (the exact set
  Remotion 4.0.534 itself is developed against, from its `@remotion/three` devDependencies); TypeScript 5.9.3;
  fonts from fontsource 5.3.0. Exact versions, no `^`.
- **Licence:** Remotion is free, including commercial use, for individuals and companies with up to 3 employees;
  beyond that a company licence is needed (remotion.pro). Re-check if the channel grows.

### 10.2 Coding standard (blueprint §6.2)
- Strict TypeScript, no `any`; `npx tsc --noEmit` passes before any render.
- Every animation from `useCurrentFrame()` with `interpolate()` (clamped) or `spring()`. **No CSS `@keyframes`,
  no `Math.random`, no `Date.now`, no network at render time**, no state carried between frames.
- Assets from `public/` via `staticFile()`; local SVG or procedural drawing only; never an external URL.
- Fonts via `loadBrandFonts()` (vendored files, `delayRender`); anything async (fonts, JSON, 3D) holds the frame with
  `delayRender()`/`continueRender()`.
- `<Sequence>`s on frames computed from the VO timing (`vo/timing.json`), never typed by hand.
- **SFX cues:** every visual event exports `{frame, sfx, gainDb}` (`lib/remotion/sfx.ts`), collected in the film's
  `cues.ts`; the mix reads the same list.
- Brand tokens from `brand.ts` only (generated: `python3 scripts/brand_ts.py`).

### 10.3 The scene handoff document
Every scene is specified before it is coded, in `films/<slug>/scenes/<scene_id>.md`: `scene_id`;
`duration_in_frames` at 60 fps from the VO timing; `audio_timestamps` (each sentence and each key word the picture
reacts to); `visual_direction` (camera, the model and its equations, HUD rows with their claim ids, colours by
meaning, labels, SFX cues, and the semantic-lock line: "at 'outer wheel' the contact point slides out").

### 10.4 VO timing
Timed from the recorded VO and the locked script, never from transcription: `scripts/vo_timing.py` (silence-to-script
alignment + word spreader; ported) writes `vo/timing.json` with sentences and words in seconds and 60 fps frames.

### 10.5 Rendering
- **720p review cuts first; 4K once the second independent review passes** (§3a steps 8–10; owner, 2026-11-07,
  replacing the sister channels' "4K only after the owner approves"; the owner may still review any cut). Review: `scale` `2/3` (written as a fraction:
  0.6666667 gives a non-integer frame and Remotion refuses it). Master: `scale` 2 → 3840×2160 at 60 fps.
- **Where:** full renders on GitHub's runners (`.github/workflows/remotion-render.yml`: every runner free across the three
  channels, at least 7 (§3a.4), 30 s shards,
  joined, mix laid under, film to Drive `<film>/renders/`). The session renders stills and short tests only. *Why
  (sister channel):* the session's VM restarted twice in one night and killed the render each time; the runners are
  free on a public repo and the session spends no usage waiting. Needs the repo secret `GDRIVE_RCLONE_TOKEN`.
- `scripts/render_shards.mjs . COMP OUT --scale 2/3` for local tests: bundles once, resumable shards, a flash-frame
  check on every shard, a length check.
- **WebGL:** `swangle` (software GL), set in `remotion.config.ts` and the shard script. Measured here 2026-10-31: the
  FEA shader (with `fwidth` contours) renders correctly under swangle. Sister channel: `angle` failed in the
  container; environment maps must be built in the canvas's `onCreated`; glass transmission renders as a milky blob
  under software GL (fake glass with designed reflections).
- **Measured cost (2026-10-31, session VM, 4 cores):** `ChannelSting` (SVG, filters, grain) at 720p60: 52 ms a frame.
- Every image must hold the frame until it has loaded (sister channel: an SVG `<image>` popped in 3 s late on the
  farm only). A 3D canvas releases its `delayRender` only after its pixels are on screen (sister channel: black flash
  frames from releasing on texture load).
- **Mount a 3D canvas only while it can be seen** (`{opacity > 0 && <Stage3D …/>}`), never as an opacity-0 layer: a
  canvas at zero opacity still renders every frame. *Why (film 1, 2026-11-04):* the landing kept its night bend and its
  hero wheelset both mounted through the scene, and its 720p farm shard ran 3 h+ against ~55 min for the other 3D
  shards; unmounting halved its frame time with pixel-identical frames (PSNR ∞ before, in and after the crossfade).

### 10.6 Blender hero shots (owner, 2026-11-04)
The one solid object (the wheelset, the turbine blade, the bulb) can be rendered photoreal in **Blender Cycles on
GitHub's runners** (`.github/workflows/blender-render.yml`, Blender **4.5.14 LTS**, sha256-pinned) and cut in as a
plate under the live blueprint layer.
- **One driver.** A shot's 3D state (camera, poses, glows, track) is a pure function of the frame in the film's
  `remotion/shots3d.ts`; the scene draws it (`plates.tsx`: the plate when listed in `PLATES`, otherwise three.js) and
  `scripts/export_blender_shot.mjs` hands the same numbers and the same meshes (`blenderExport.ts`, from
  `geometry3d.ts`) to `blender/render_shot.py`. The plate therefore lines up with the HUD and every projected callout.
- **Blender draws the steel, three.js draws the blueprint.** The plate holds the lit wheelset, the rail bodies and the
  shadows (transparent film); the rail edge lines, sleepers and drawn paths stay live three.js over it, hidden behind
  the same wheelset and rails drawn depth-only (the rails' occluder with a polygon offset, or its own edges z-fight).
  *Why:* the lines then match every other scene, and Freestyle doubled the frame time (measured).
- **The look** (`render_shot.py`): a studio world the camera never sees (dark floor, a crisp horizon band for the long
  tread highlight, two tall softboxes for shaped reflections on the webs), the channel's key, cool rim and warm under;
  turned steel (concentric lathe rings in roughness and a slight bump, a faint tonal drift, one white service mark so
  the spin reads), a polished running band on the rail heads, a 180° motion blur. **View transform Standard, not
  AgX:** AgX desaturated the amber glow to peach (the brand colour carries a meaning and must land exact); a glowing
  tread also takes the glow colour as its metal colour, so its polish never mirrors the studio in white over the glow.
  Blotchy noise weathering read as camouflage: rejected.
- **Edge lights for grey steel on the Abyss Black** (owner's review of film 1 v4, 2026-11-05: the cold-open wheelset
  "sank" into the dark). Two cool softboxes kept *behind* the object, opposite the camera, keyed every frame so they
  follow the roll and every camera move; reflections only (`visible_diffuse` off, so the faces keep the key's
  modelling), no shadows, never seen by the camera. Per shot (`SHOTS[…].edgeLights`): on a close-up of a glowing tread
  they blew the rail head white and competed with the amber beat, so that shot goes without. Cool, never amber or cyan:
  a backlight carries no meaning, and those colours do. *Why world-fixed lights failed:* the old "rim" sat beside the
  camera and stayed put while the wheelset rolled ~9 m away from it. 4K at 16 samples: about 6 min a frame on 4 cores
  (the grain seen at 960 px with these lights is gone at 3840); plan blocks of ≤ 50 frames per job (6 h limit).
- **4K master on the Remotion farm: 5 s shards dealt round-robin** (`remotion-render.yml` input `seconds` 5). With
  30 s contiguous blocks the heaviest 720p shard of film 1 took 99 min; at 4K (9× the pixels) it would pass the 6 h
  job limit. Round-robin gives every runner a share of the heavy 3D and plate stretches.
- **Workflow inputs take the bare slug** (`film: train-wheels`, not `films/train-wheels`): the workflows add `films/`
  themselves. A wrong value fails every job in seconds (film 1's first 4K plate run, 2026-11-05).
- **Before a plate re-render, move the old tars out of `render-media/`:** the farm unpacks every tar there in name
  order, and `<shot>_all.tar` sorts after `<shot>_00000.tar`, so old frames would overwrite new ones.
- **Cost (measured 2026-11-04):** about 75 s a 1080p frame at 16 samples with OpenImageDenoise (albedo + normal) on
  4 cores; clean. 1,870 frames ≈ 1.8 h on 20 runners. The 4K master is 4× that: two runs back to back.
- **Order:** export and render on the farm → frames land in Drive `<film>/render-media/plates/<shot>/` as WebP with
  alpha → check every frame is there → list the shot in `PLATES` → the Remotion farm render. A plate is never listed
  before all its frames exist.
- **Layering trap:** inside one `AbsoluteFill` the plate `<Img>` pushed the canvas below the frame (a flex column) and
  the canvas was never created; give each layer its own `AbsoluteFill`.

## 11. Assets and references
- **Code first:** geometry, simulations and schematics are written, not downloaded.
- **Design from real references:** before drawing any real machine (a bogie, a governor, a bulb's driver board, a
  turbine blade), collect real reference photos and drawings into `films/<slug>/assets/ref/` (gitignored), make a
  contact sheet (`scripts/contact_sheet.py`) and write `design-reference.md` (element → reference → what to copy).
  *Why (Creator):* a made-up cab display and wrong signals were caught by a viewer.
- **Licences:** commercial-use only (no NC/ND), logged in `media_manifest.csv`. 3D/texture sources: Poly Haven,
  ambientCG (CC0), NASA 3D, Smithsonian 3D (CC0). Music: the channel's own Lyria 3.5 library (§12.1); not Pixabay
  (11 of 11 checked for film 1 were Content ID registered) and not ElevenLabs' free plan (no commercial licence). SFX: synthesised in code where possible
  (§12), Openverse CC0/BY.
- **Blocked from the cloud:** YouTube downloads (intermittent), Vimeo, Mixkit, the Pexels/Pixabay websites (the
  Pixabay API works with `PIXABAY_API_KEY`). Never route around blocks with VPNs or proxies; the owner fetches on the
  phone (`scripts/termux_fetch_to_drive.sh`).

## 12. Sound (blueprint §3)
In a faceless, code-driven film, the sound gives the weight.
- **Buses:** dialogue −14 LUFS integrated (±0.5), true peak −1.0 dBTP; SFX between −18 dBFS (clicks) and −6 dBFS
  (fractures); a sub-bass drone bus band-passed 30–90 Hz resting at −26 dBFS so there is never digital silence;
  music side-chain ducked 8 dB under the voice with a 250 ms release.
- **Master:** stereo made explicitly before measuring; −14 LUFS integrated, −1 dBTP; one static gain plus a limiter,
  measured twice, then checked per channel in the final MP4. *Why (Creator):* linear `loudnorm` backed off to
  −15.9 LUFS, a `-ac 2` upmix lost 3 dB and an AAC re-encode overshot a channel.
- **The foley library** (blueprint §3.2) maps to `SfxName` in `sfx.ts`: relay click and pen scratch (blueprint
  assembly), quartz tick or typewriter (telemetry), 2.4 kHz glass tone panned with a force vector, dry snap + shear
  shriek + 45 Hz boom (fracture), 50 → 120 Hz transformer buzz (heat), filtered pink-noise sweep (flow). Most can be
  synthesised exactly in Python (`scripts/score_mix.py` is the mixer to extend); recorded foley only with a licence.
- Silence before a reveal: drop the music 1–1.5 s before the paradox is solved.
- **Music from Lyria 3.5** (`scripts/lyria_music.py`, prompts in `sound/lyria_prompts.json`; film 1, 2026-11-04):
  write each act's prompt as timestamped sections on the film's own beats (a quiet intro, a thinning where the music
  must drop, a hard stop before a grave line); WAV is `response_format {"type": "audio", "mime_type": "audio/wav"}`
  (48 kHz stereo came back, not the 44.1 kHz the docs say); a song takes ~20 s and costs $0.08. Make two takes per act
  and pick by the measured 0.5 s loudness contour against the plan, then slide the track (`offset`) so its events land
  on the words; check every take for vocals with Whisper. *Why:* the picks of film 1 hit three drops and a stop within
  1–3 s with no editing. One prompt was blocked "for an unspecified policy reason" (no charge); rewording passed.
- **Balance by K-weighted short-term loudness against the voice, not by bus RMS** (film 1, 2026-11-04): the bed at
  −23 dBFS RMS ducked 11 dB measured only 6 dB under solid speech; the mix now carries `music_db`, `sfx_db` and per-sound
  `sfx_trim` in `score.json`. Targets: bed ≥ 14 dB under solid speech (median), effects ≥ 12 dB (median) and never
  over the voice except a deliberate hit; sustained tones in 1–4 kHz (the `glass_tone`) mask words first.

### 12.1 The music library (owner, 2026-11-04)
All music comes from the channel's own library, generated with **Google Lyria 3.5 through the Gemini API**
(`GEMINI_API_KEY`) and kept in **one Drive folder: `Music-Library/blueprint/`** (id `1vVVLYt9fWexJCzaLImr-bQyU7F8ei8En`,
inside `Music-Library`, id `1F5r-bgyORTxPM66DXViM3Oxrrr7ukJY8`, at the top of My Drive).
- **The record:** `config/music_library.csv` (id, title, what it is for, mood, tempo, key, length, loudness, the
  instruments heard); `config/music_library.json` holds the exact prompts. Each WAV in Drive has a JSON sidecar with
  the prompt, the Lyria interaction id and the listening check.
- **Library or film takes:** the library gives ready beds for any film; when the music must hit the film's own beats
  (a drop before a line, a stop on a word), make takes for that film with `scripts/lyria_music.py` and its
  `sound/lyria_prompts.json` (§12, film 1's method). Film 1 uses its own takes.
- **Use:** pick one bed per act from the `use` column (`bp01_curious_pulse`, `bp03_low_tension` and `bp05_resolve` are
  the act shape of a typical film; `bp10_landing` for an outro without the sting's own sound), pull them with
  `scripts/music_pull.sh films/<slug>/assets/music bp01_curious_pulse bp03_low_tension …`, place them as slots in
  `sound/score.json`, and log each in the film's `media_manifest.csv`: source `Music-Library/blueprint/<id>.wav`,
  licence "Generated with Google Lyria 3.5 (Gemini API, Paid Tier); Google claims no ownership of output; SynthID
  watermark". A track may be used in many films; use the `from` offset so two films don't open on the same bars.
- **Level:** tracks arrive mastered loud (about −11 to −13 LUFS, peaks near 0 dBFS). The mixer sets each slot by RMS
  and ducks it under the voice (§12); never use a track at its delivered level.
- **A new track:** add an entry to `config/music_library.json` (id `bp<NN>_<name>`, a prompt with tempo, key,
  instruments and shape, and a one-line `brief`), run
  `python3 scripts/lyria_library.py generate config/music_library.json films/<slug>/assets/lyria --only <id>`,
  listen to the kept take, push it with `scripts/music_pull.sh --push films/<slug>/assets/lyria`, then rebuild the CSV
  (`python3 scripts/lyria_library.py catalog <folder with blueprint/> config/music_library.csv` over the whole palette
  pulled from Drive) and commit both files. $0.08 a take (aistudio.google.com/docs/pricing, read 2026-11-04).
- **The check:** Lyria has no instrumental switch and often adds choir or "ooh" pads even when the prompt forbids
  them. `lyria_library.py` has two Gemini models listen to every take: `gemini-3.5-flash` for vocals, defects, a hard
  ending, an unsteady level and the fit to the brief, then `gemini-3.1-pro-preview` for voices alone (it caught choir
  pads in 3 of the first 15 takes the first listener passed). A take either flags is made again, up to five times;
  only clean takes are kept (`--attempts 5`).
  A person still listens to a track before its first film.
- **Still to make:** `bp07_heat` (furnace) failed five takes and the run stopped at the project's spending cap; its
  prompt is already rewritten in `config/music_library.json`. Until then use `bp04_stress_build` or `bp03_low_tension`.

## 13. Discovery and packaging

The sister channels' analysis of how YouTube finds videos (Built-on-Bharat PLAYBOOK §13, from YouTube Help and
YouTube's growth team, read 2026-10-24) applies here unchanged. In short: YouTube pulls videos per viewer and judges
each video on its own; search ranks by relevance (title, description, captions, the spoken words), engagement and
quality; browse is won by the thumbnail and title; suggested follows what viewers watch together; satisfaction counts
beside watch time; tags barely matter; Test & Compare picks the thumbnail by watch-time share; misleading packages
are against the rules and get punished by the surveys.

### 13.1 Rules for us
1. **Package first:** title, thumbnail concept and search phrases in `brief.md` before the script; the first 12 s
   deliver the thumbnail's question.
2. **Search words from real searches:** YouTube autocomplete (`hl=en`, `gl=US` and `gl=IN`/`gl=GB`), the top 20
   results, Google Trends; saved in `research/search_terms.md` (main phrase, 2–4 secondary phrases, the question
   people ask). The main phrase in the title's first ~40 characters, said naturally in the first minute.
3. **Upload our exact English SRT** from the locked script.
4. **Series and chains:** end screen to the next film, a series playlist, one pinned question.
5. **Three thumbnails in Test & Compare** from the first hour. Test & Compare also tests **titles** now (widely
   available by December 2025, per press reports; check Studio for our eligibility): once the thumbnail test ends,
   test the two title alternatives. It picks the winner on **watch-time share**, not CTR, so a clickbait variant
   that loses viewers loses the test.
6. Read Studio at 48 h, 7 days and 28 days and log what was learned in §16:
   - **CTR per traffic source, against our own videos**, never against a fixed number. YouTube: "Half of all
     channels and videos on YouTube have an impressions CTR that can range between 2% and 10%"; home-feed
     impressions run lower, the channel page higher, and new videos under 100 views vary even more (Help 7628154).
   - **Retention:** the key-moments report's "intro" (who is still there at 0:30), the curve at 1:00, any dip (what
     was on screen?), and where the catch (§5.4) falls: it should hold. Spikes are rewatches: did our signature
     moments make them?
   - Search terms, and the audience hypotheses of §4.4 (age, device, traffic source).
7. **Satisfaction is a ranking signal.** YouTube surveys viewers to learn "satisfaction, not just watch time" (Help
   16089387). A package the film doesn't pay off wins clicks and loses the surveys; the landing is part of
   discovery.

### 13.2 Title
Main phrase first, curiosity in the same line, ≤ 60 characters (100 is the limit), no `!`, no ALL-CAPS sentences, no
channel suffix (sister channel: the suffix used half of what a phone shows). **A tension, not a manual:** "How a
Cycloidal Drive Works" reaches search only; browse needs the contradiction, so the search phrase and the paradox share
the line (film 1: "How Train Wheels Turn With No Steering at All"). Never an absolute the film contradicts
(§9.2). Deliver in a click-to-copy block plus two alternatives.

### 13.3 Thumbnail (blueprint §5.2 + the sister channels' CTR lessons)
- **The 2-element rule:** exactly one subject object and one context disruptor (the conical wheel on its rail + an
  amber pointer at the gap).
- **The squint test:** legible at 120×68 px on a phone browse screen and at 168×94 with the duration badge (nothing
  important bottom-right).
- **Words:** at most 3, bold, high-contrast white/yellow (amber), adding to the title, never repeating or answering
  it, and never a false absolute (§9.2). The research report's own suggestions "NEVER CAN FALL", "PHYSICS WAS WRONG"
  and "The Siphon That Works in Space" would each fail: lifts have fallen, the physics was refined rather than wrong,
  and a siphon needs gravity.
- **Bright subject:** YouTube's app is dark; our abyss works only with a strongly lit subject and one bright accent.
- **Never:** busy collages, tiny formulas, stock human faces, low contrast, the logo.
- **Build and test:** 3+ concepts as HTML or Remotion stills shot at 1280×720 JPG, judged beside 8 real competitor
  thumbnails from the same search, then a main and two challengers.

### 13.4 Description
2–4 plain lines carrying the main and secondary phrases; chapters from `0:00` named like searches; the series
playlist; up to 3 hashtags. No sources dump, no credit roll, no links beyond the playlist, except licence credits a
licence requires and the disclosure or correction lines (§9.4). Saved in `films/<slug>/youtube/description.md`.

### 13.5 Launch (blueprint §5)
- **Three films ready before launch** (blueprint §5.1.3): a viewer who finishes an excellent first film checks the
  channel page; an empty channel loses the subscription.
- **Unlisted at least 3 hours before public** (blueprint §5.1.2): 4K processing and captions must be done before the
  first viewers arrive.
- **Times:** Sunday 11:30 AM–1:30 PM IST or weekdays 5:00 PM IST (blueprint §5.1.1; treat as a starting hypothesis
  and test against this channel's own Studio data).
- Video 1 public; Video 2 48 h later with Video 1's end screen pointing to it; the rest weekly.
- **Comments:** replies go through the `mkmk749278/Comments` repo's process (owner-approved replies only). The
  blueprint's "10–15 in-depth peer responses in hours 0–2" must be genuine replies to real comments, never seeded
  or fake engagement, which breaks YouTube's fake-engagement policy.

### 13.6 Shorts
2–3 vertical cuts per film (30–50 s), each a complete paradox with its own hook in the first second, linked to the
full film.

### 13.7 The YouTube package, every final film (checklist)
- [ ] Main thumbnail + 2 challengers (1280×720 JPG), squint-tested beside competitors.
- [ ] Title in a click-to-copy block + 2 alternatives.
- [ ] Description in a click-to-copy block, chapters from the exact upload file.
- [ ] English SRT from the locked script.
- [ ] YouTube auto-dubbing on where offered (§17.1 decision 13); the dubbed tracks' technical words spot-checked.
- [ ] Synthetic-content disclosure answered; tags only for spellings; pinned question; end-screen target; playlist.
- [ ] Shorts cut list.
- [ ] Saved in `films/<slug>/youtube/`; commit, PR to `main`, merge, tell the owner which branch to delete.

## 14. Review gates
Nothing reaches the owner without passing these, and §1's "polished only".

### 14.1 Script gate
- [ ] `claims.csv` complete, the gate passes; every changed line re-checked.
- [ ] Broken intuition by 0:12, promise by 0:30, open loop by 0:55; no banned openers; channel name only in the outro.
- [ ] Every chapter adds one layer of mechanism; the trade-off is said; no false absolutes.
- [ ] The topic gate (§4.3) scored in `brief.md`; the five beats (§5.4) visible in the screenplay, with the catch as a
      turn around the middle; the viewer's wrong model said out loud in the first beat.
- [ ] No derivation, no symbol without its thing (§8.7); at most one analogy per mechanism; one prediction question
      before the biggest reveal, answered on screen; reveal holds marked in the screenplay (§7.5).
- [ ] Lean-in test, spoken-English check, audience review with no viewer drifting in the first minute.
- [ ] Package written first; the main search phrase said in the first minute.

### 14.2 Picture gate (every cut)
- **Audio-synced frame review:** two frames a second with the words heard under each, every sheet read; fix every
  frame that doesn't show what is said, is empty, unreadable or covered (sister channel: this found what three still
  sweeps missed).
- **Smoothness, measured:** no flash frames (`render_shards.mjs` checks every shard), no judder, nothing frozen over
  1.5 s, no black frames.
- **Physics on screen:** speeds follow ratios, contacts touch, nothing interpenetrates that shouldn't, colours follow
  §6.1 meanings, every HUD number has its source or the ILLUSTRATIVE label.
- **Independent viewer review:** a new session without the repo gets `prompts/viewer_review_v2.md`: the cut by its
  Drive file id (through the Google Drive connector) and the narration with timecodes, and returns a verdict, the
  panel's satisfaction, a per-chapter score, the must-fixes and the top 10 fixes (§3a.3); the `mkmk749278/Review`
  repo's forensic protocol applies to final cuts.
- [ ] Text readable on a phone; nothing important under YouTube's overlays.
- [ ] **§6.4a measured:** ≥ 36 px for what the narration points to, ≥ 26 px for every other fact, no fact in `muted`,
      nothing clipped or on a grid line.
- [ ] **Motion a viewer can see** in every hold (§6.4); parts on their own words (§8.2); HUD and picture agree (§8.4).
- [ ] **Outside review notes checked before fixing:** each point against the code, `vo/timing.json` and a rendered
      still; a `review/<name>_check.md` with CONFIRMED / PARTLY / NOT CONFIRMED.
- [ ] −14 LUFS, −1 dBTP in the final file; picture length = film length; audio/video within 0.15 s.
- *Film 1, 2026-11-04:* the first farm cut's gate (a frame every 2 s with the words, then full-size stills of
  every suspect) caught what scene-by-scene stills had passed: British "CENTRE" in three scenes, four named people
  and places at 26 px while the narration named them, a schematic whose rails ran inside the flanges, a scene that
  opened on 4 s of bare axes, a credit lost on bright footage, a dimension line striking its own text. **Rule:** grep
  every on-screen string for British spellings before a render; any label whose words the narration says is 36 px.

## 15. Tools
In this repo (ported 2026-10-31 from Built-on-Bharat, which ported most from Creator):
- `scripts/shoot.mjs` (new): an SVG or HTML file → PNG/JPG with the pre-installed Playwright Chromium.
- `scripts/brand_ts.py` (new): `config/brand.yaml` → `lib/remotion/brand.ts`.
- `brand/build_logo.py`, `brand/build_banner.py`, `brand/gears.py` (new): the brand art, from geometry.
- `scripts/upload_gdrive.sh`, `scripts/gdrive_pull.sh`, `scripts/termux_fetch_to_drive.sh`: Drive, repointed to
  `The-Mechanical-Paradox`.
- `scripts/render_shards.mjs`: sharded renders for the single workspace (`.` as the project).
- `scripts/claims_check.py`: the fact gate. `scripts/contact_sheet.py`: timecoded sheets.
- `scripts/spoken_english_check.py`: now takes `--terms` (a film's glossary of explained technical words); "mechanism"
  is no longer on its fancy-word list (it is this channel's subject).
- `scripts/vo_timing.py` + `scripts/align_script.py`: VO timing. `scripts/eleven_tts.py`: generates the blocks with
  the channel's voice and the newest Eleven model (fixed seeds, a JSON sidecar per take). `scripts/vo_review.py`: measures each take
  (words as written, pace, pauses, pitch, voice drift, loudness). `scripts/score_mix.py`: the mixer.
- Python needs: `pyyaml`, `numpy`, `pillow` (brand); `wordfreq` (English check); the VO tools list theirs in their
  headers.
- `.github/workflows/remotion-render.yml`: the render farm.
- To port when first needed: Built-on-Bharat's `thumb_feed.py`-style competitor sheet, `word_sheets.py` (frames with
  the words under them), `yt_demand.py` (autocomplete search terms).

---

# Part D

## 16. Lessons log
*(Newest first. Each lesson: what happened, the rule, why.)*

**The strategy research (2026-11-07).**
- *A confident research report can be wrong on its own examples.* The owner's commissioned deep-research report
  (Part G.2) was right about the big things (the illusion of explanatory depth, the trade-off as drama, no hype, no
  lecture), but its train-wheel dossier repeats two errors film 1's sources had corrected (centrifugal force as what
  shifts the wheelset; flanges that "almost never" touch), its key numbers (a 15–35% drop on formulas, 60–70% average
  viewed, 88% male, 70% from browse) carry no source, and the one claim we could test against a large study (135–150
  wpm) ran the other way. **Rule:** outside research is a source like any other: each claim is checked, numbers
  without a source are never adopted, and the verdicts live in §4.5.
- *The adopted changes:* the topic gate (§4.3), the five beats with the catch as its own beat (§5.4), the wrong model
  said out loud first (§5.1), the reveal hold (§7.5), the equation rule (§8.7), the prediction question (§7.2), title
  and watch-time-share testing and the Studio read by traffic source (§13.1).

**Film 1, the viewer review of cut v3 (2026-11-05).**
- *A plan view can lie about the one thing it exists to show.* The tight-curve plan view gave `TopWheelset` the heading
  `phi + π/2`, so the axle ran along the track, 90° off; three picture passes and the farm gate had passed it, but the
  independent viewer (an "automotive engineer") saw it at once. **Rule:** every drawn pose that carries the physics
  (axle on the radius, contact on the rail) gets a numeric check in code, like a gear mesh (`screechHeading`, the
  landing bogie's ±7 mm check).
- *Stock footage can be interlaced and still say "progressive".* `f01` was 25i top field first, flagged progressive,
  and the combing was the film's very first picture. **Rule:** run `ffmpeg -vf idet` on every clip before it goes in;
  deinterlace with `bwdif=mode=send_field` (double rate) and keep the original.
- *Measure holds one way, over the whole cut.* The v1 gate read three holds as 1.55–1.67 s; `freezedetect`
  (n = 0.002, d = 1.5 s, on a 320 px copy) read them as 2.7–3.2 s, and found three more. **Rule:** the hold check is
  that `freezedetect` command on the whole file; anything over 2 s gets visible motion (a push, running sleepers, a
  move that keeps going).
- *A push scales from its origin.* A 1.08 push on the bank-card panels drove the inner-radius label off the left
  edge. **Rule:** set `transformOrigin` near the edge-most label, and still the frame at the end of the push.
- *Outside notes, checked: 8 confirmed, 2 partly or for another cause, 2 not confirmed* (small text: nothing in the
  film is under 26 px, and the reviewer had read cap heights at 720p; a wheel "off its rail" sat on it).
  `review/viewer_v3_check.md`.

**The music library (2026-11-04).**
- *Lyria adds voices it was told not to.* In the first library run 102 takes were billed for 38 kept tracks (61 rejected, mostly for choir or "ooh" pads and vocal chops
  despite "Instrumental only, no vocals" in the prompt); the stronger second listener caught pads in 3 of the first 15
  tracks the first listener had passed. Prompts that ask for sustained "pads", "drones" or "harmonics", or for
  epic suspense, drift into choir most often: ask for bowed strings, piano, electric hum or analogue synth bass instead (the
  library's `generation_log.csv` in Drive). **Rule:** every generated take is heard by both listeners before it is
  kept, and a person listens before a track's first film (§12.1).
- *The Gemini project has a monthly spending cap* (set in AI Studio, ai.studio/spend). The first run hit it after
  about $8.25 of Lyria takes plus the listening checks, and every request then returned HTTP 429 "exceeded its monthly
  spending cap". **Rule:** before a batch, estimate takes × $0.08 × about 2.7 (the first run's takes per kept track)
  and tell the owner if it needs a higher cap.
- *Asking for "about three minutes" works:* Lyria 3.5 returned 2:50–3:00 beds, against about two minutes by default,
  so one bed covers a whole act with fewer loops.
- *Generate once, keep in Drive, reuse:* music made inside a session and never stored had to be made again on a
  sister channel. **Rule:** music lives only in the library folder, listed in `config/music_library.csv`.

**Film 1 picture built (2026-11-04).**
- *Exaggerate what keeps the truth, never what breaks it.* Hunting's true sway is 3 mm on a 17 m wave: exaggerating
  the sideways shift on true rails puts the wheels off the rails (a derailment on screen). Exaggerate the yaw (the
  wheels stay on the rails) close up, and turn the view into a labelled plot from above. Same for the drift (true
  sections beside a top view) and the cone (tread sections at true scale, 8 px/mm, then a ×3 true-shape detail).
- *Real references first.* Commons photos of freight wheelsets set the 3D wheel: journals outboard, hub boss inward,
  dished web, a bright running band (research/visual_refs.md). A lathed wheel looks the same at every angle: spin
  must be shown by axle-end bolts and faint web weathering (a sunburst of streaks looked fake).
- *Cues are searched inside their scene's span* (`scenes.ts` → `cue.within`): "the screech", "On a gentle curve" and
  "No steering" each occur more than once in the film; a global search threw or picked the wrong one.
- *The blueprint's micro-push scales the stage by up to 5 %*: type within ~90 px of an edge drifts off frame. Tags sit
  at x 96, y H−110.
- *A camera move must never pass through the subject*: s04's dip to rail level crossed the tread and filled the
  frame with a white blur; put the camera on the final line of sight first, then zoom.
- *Sound cues come from the picture code*: `scripts/export_cues.mjs` bundles `filmCues()` with esbuild for Node and
  writes `sound/sfx.json` (77 cues); this channel's foley is synthesized in `score_mix.py`.
- *A 5 ms limiter let synthesized transients through at +1.4 dBTP*: the master limiter now runs 4× oversampled with
  a 0.1 ms attack (−1.1 dBTP).
- *Stills tool:* `scripts/stills.mjs OUT COMP:f1,f2 --scale 0.5` renders many frames from one bundle.

**Film 1 VO recorded (2026-11-04).**
- *Eleven v4 ignores its speed setting.* b02 at speed 0.80, 0.85 and 0.90 gave the same 13.0 s take, and the voice
  reads at 173–197 wpm (articulation about 230). Multilingual v2 honours speed but changed the voice by 1.8–4.7
  semitones, and the owner ruled v4 only. **Rule:** the pace is set in the edit, never by time-stretching:
  `scripts/vo_timing.py` adds a breath to the read's own pause after every sentence (0.35 s after a full stop, 0.6 s
  after a question, 0.8 s at a paragraph break; chapter turns keep 1.4 s). Film 1: 379 s, 162 wpm. *Why:* the
  playbook's 145–160 wpm keeps non-native listeners with us, and a stretch smears consonants Claude cannot hear.
- *Every join is checked by measurement, since Claude cannot listen:* the 10 ms beside each inserted gap must sit
  far below speech (film 1: loudest −55.9 dBFS against −30.8 dBFS speech, 90 joins).
- *A header written directly on its paragraph was swallowed.* `vo_timing.py` and `provisional_timing.py` treated
  "## Chapter\nFirst paragraph" as a header only, so the provisional clock lost each chapter's first paragraph. Both
  now split the header line off. **Rule:** a timing script must account for every word of `vo.txt`.
- *Voice ids are case-sensitive* (`q8Dz…`, not `Q8Dz…`): copy them from the API, never retype them.
- *Picture defect caught on the new clock:* the bank card's outer wheel ran behind the HUD from the first frame.
  The panels moved left and the HUD narrowed to 440 px; §8.4 applies to every shot of a scene, not only its first.

**Film 1 script lock and first scene (2026-11-04).**
- *The spoken-English gate had been run in `--story` mode.* VO v3 "passed" at 1.0 "you" per 100 words; as an
  explainer it failed (bar 3.0). **Rule:** explainers run the check without `--story`, with the §7.8 arguments.
  Raising "you" to 3 per 100 also sharpened lines ("Do you see it?", "So why isn't your train always swaying like
  that?"), but it costs words: v6 is about 1,040 words (≈ 6½–7 min); trim in the edit only where the picture already
  says it.
- *Three fresh panels converged.* v3 → v5 each found no swipe and verified every number; each still found a real
  gap: the cause of the drift (what pushes the axle?), the inner wheel's "because", a line the film itself
  contradicted ("Why don't you feel it?" after giving 2.5 sways a second), an ending that contradicted the trade-off.
  **Rule:** a fresh panel each round (no memory of the last draft), and lock on the bar (no first-minute drift), not
  on a perfect verdict.
- *When no source states a cause in one sentence, derive it and label it.* The drift outward follows from two sourced
  facts (equal radii roll equal distances; the rails curve away); claim C31 says "derived" and why.
- *True scale beats exaggeration when a drawing convention allows it.* The contact panels draw wheel and rail at
  3 px/mm with the axle broken out between them (a standard drawing break), so the 1:20 cone, the 7 mm play and the
  0.70 mm difference are all real on screen; only the flange shape is generic, and the caption says so.
- *A contact solver is the numeric check for a rolling mechanism.* `profiles.ts` rests the wheel on the inclined,
  crowned rail by maximising (rail height + wheel radius); the checks assert r = r0 + λy within 0.02 mm and a flange
  play of 7.04 mm. Tuning the flange root by eye gave 10 mm of play; the solver caught it.
- *Scenes cue to phrases, not frames* (`lib/remotion/timing.ts`): the provisional 150-wpm timing lets scenes be built
  before the voice is chosen, and three script revisions changed only cue strings, never scene code. A missing or
  ambiguous phrase throws at bundle time.
- *Done:* `Hud.tsx` now meets §6.4a (values 38 px, labels and units 26 px in `sub`, honesty line 36 px in `ink`; rows
  can share the picture's driver with `at`, and fade in with `from`).

**Picture lessons from an outside visual review (2026-11-03).**
- *What happened:* the owner shared an outside review of a finished Remotion documentary cut on another production.
  Checked point by point against that film's code, timing and rendered stills: five points right, five real with a
  different cause or fix, two wrong (a "typo" that was a misread of small text; CSS values and word times that were
  not the film's), and two of its timing fixes would have made the sync worse.
- *Rules carried over:* motion a viewer can see (§6.4); legibility floors and `muted` for decoration only (§6.4a);
  each part on its own word (§8.2); HUD and picture on one driver, highlights complete on their word (§8.4); outside
  notes checked before fixing (§14.2). Our HUD makes these matter more here than anywhere: it is small mono text by
  design.
- *Fixed 2026-11-04:* `lib/remotion/Hud.tsx` had set its title and units at 15 px and its ILLUSTRATIVE VALUES line
  at 12 px, all in `muted`.

**Film 1 script: two audience rounds (2026-10-31).**
- *A fixed first line can cost trust before second two.* The blueprint's "…without ever derailing" was flagged as false
  by all six test viewers; "no steering wheel" was then read as a fake puzzle (rails obviously guide trains). The owner
  chose to lead with the real paradox (rigid axle, longer outer path). **Rule:** the first sentence states the true
  broken intuition, never a straw puzzle and never an absolute.
- *Abstract geometry dies by ear.* "Two rolling circles form a cone whose tip points at the center of the curve" lost
  half the panel; the same idea in plain words worked, and the image moved to the picture. **Rule:** say the plain
  mechanism; let the animation carry the elegant geometry.
- *Causal order matters to experts.* "The wheels slip. The flange presses…" read backwards to the driver and the
  engineer. Narrate cause → effect in the physical order.
- *Hedges experts ask for:* "close to a cone" (real profiles are curved and wear), "about the thickness of" (0.70 vs
  0.76 mm), "keeps pulling" (not "always", it overshoots).

**Channel foundation (2026-10-31).**
- *Three equal gears on a triangle only mesh at 6k+3 teeth.* Solving the three mesh conditions together gives
  N/6 = k + ½. 15 teeth for the mark, 9 for the favicon. The build asserts every mesh.
- *A cycloid-drive disc formula found in the wild had the wrong sign on ψ.* Brute-force contact checks against all
  12 pins found the right form (ψ = atan(sin((1−N)t) / (R/(eN) − cos((1−N)t))), disc centre at −e, pins half a pitch
  round): error 0.000. **Rule:** every mechanism drawn from a formula gets a numeric contact or mesh check in code.
- *Line-art logos turn to mist at 98 px.* The profile picture uses solid white plates; line art stays for large uses.
- *YouTube's banner safe area is 1235×338 at 2048×1152* (Help 10456525), i.e. 1546×423 at 2560×1440; the blueprint's
  "left/right safe area" is read as the two halves of that one centred area.
- *Engine check:* the FEA ShaderMaterial (with `fwidth` contours) renders under `swangle`; the sting renders at
  52 ms/frame at 720p60 on the session VM.

## 17. Decisions and open questions

### 17.1 Owner's decisions (2026-10-31)
1. **Narrator voice:** audition 3 neutral international ElevenLabs narrators on the same paragraph; the owner picks
   (§7.6). Until then no VO is recorded.
2. **No cadence badge on the banner** (the blueprint's "NEW DEEP DIVE EVERY SUNDAY" removed): no public promise of a
   weekly film; quality sets the pace.
3. **First film: Video 1, train wheels** (blueprint Part G §4). Its title gets an honest fix (trains do derail, §9.2).
4. Still to do by the owner: add the repo secret `GDRIVE_RCLONE_TOKEN` (Settings → Secrets and variables → Actions)
   before the first farm render.
5. **2026-11-03: the `mkmk749278/Review` and `mkmk749278/Comments` repos get their own section for this channel**, so
   its first film can be reviewed and its comments answered there, under this channel's own audience and voice.
6. **2026-11-04: the narrator is the account's own ElevenLabs voice "The Mechanical Paradox"**, generated by Claude
   through the ElevenLabs API (the key is an environment secret, injected for `api.elevenlabs.io`; a session started
   before the secret was added does not have it). This replaces the three-voice audition (decision 1).
7. **2026-11-04: all recording blocks are delivered together, in one file, once the script is final**
   (`films/<slug>/script/blocks_performance.md`, sent as a file), not as a series of chat blocks.
8. **2026-11-04: the narration model is Eleven v4, and always the newest Eleven flagship after it** (owner: "Use
   eleven v4 only and if any latest version come use that"). `scripts/eleven_tts.py` picks the highest `eleven_vN`
   the account offers (v4 or later) at run time and records it in each take's sidecar; no turbo, flash or v2 models.
9. **2026-11-04: real footage inserts** of the real thing where the narration describes it (§8.8).
10. **2026-11-04: music from Google Lyria 3.5 through the Gemini API** (`GEMINI_API_KEY`). Why: Pixabay music is
   mostly Content ID registered (11 of 11 checked for film 1); ElevenLabs' free plan has no commercial licence (its
   output stays non-commercial even after an upgrade); Lyria output is owned by us under the Gemini API terms and
   carries an inaudible SynthID watermark. Fallback: `scripts/compose_score.py`, an original code-composed score.
   **The library (owner, 2026-11-04):** general beds are generated once into one Drive folder and reused (§12.1).
11. **2026-11-04: Blender on GitHub's runners for the hero shots** (owner: "you can even render blender rendering also
   on GitHub machine"; then "Film 1 now"). Film 1's cold open and landing wheelset are Cycles plates (§10.6).
12. **2026-11-07: no film length limit.** Owner: "Some need more length but some don't, so don't keep any length
   restrictions … we need to convey the physics in simple and mostly in less time as much as possible." This replaces
   the blueprint's 4–6 minutes and the research report's 8–12: a film is as long as its five beats (§5.4) need, said
   as simply and briefly as the physics allows; never padded for watch time.
13. **2026-11-07: YouTube auto-dubbing** (owner chose it over paid ElevenLabs dubs). Turn it on at upload where
   YouTube offers it; nothing paid. The on-screen labels stay in English. *Why:* YouTube reported that pilot creators
   got over 25% of watch time from other-language audio (§4.5).
14. **2026-11-07: the twelve-step pipeline, run without waiting** (§3a). Owner: "all this is automatic process you no
   need to wait … for every step you need to open pr and merge the work … if you can know free machine on GitHub you
   can use most of the free machine … Top priority creativity". Independent review gates replace the owner's approval
   of each cut (4K after the second viewer review passes); the owner can still step in, and an approved cut is not
   edited again.
15. **2026-11-07: renders take every free runner** (§3a.4): `runners: auto` counts the jobs busy across the three
   channels' repos and takes the rest, never fewer than 7 (owner's choice over "always 20" and "keep 7").
16. **2026-11-07: film 2 renders on 10 runners** (owner: "For this video use 10 runners"). Every dispatch for film 2
   passes `runners: 10`. The token for `auto` (decision 15), or a separate GitHub account so this channel has all 20,
   is decided after film 2.

### 17.2 Decided (2026-10-31, creative director)
- One Remotion workspace for all films (§10.1); React 19 per the blueprint, on Remotion's own tested set.
- American spelling on screen; SI units first (§4.1).
- Pauses from punctuation and the edit, not `...` (§7.5), until a test on this channel's voice says otherwise.
- The HUD and the FEA field never show an unsourced number without the ILLUSTRATIVE label (§8.4–8.5).
- No seeded or fake engagement at launch (§13.5).
- The blueprint's 3840×2160 master canvas: scenes are authored at 1920×1080 and rendered at `scale` 2, which gives a
  true 3840×2160 frame (text, SVG and DOM are drawn at 4K, not upscaled) at a quarter of the authoring work; the
  sister channel's measured method.
- The blueprint's "ProRes / 4K H.264 High 10" encode: the farm writes 8-bit H.264 at CRF 16 with a capped bitrate
  (YouTube re-encodes every upload to VP9/AV1, and an 8-bit source from 8-bit renders loses nothing). A ProRes or
  10-bit master is added only if a film's gradients band visibly after YouTube's encode.

### 17.3 The launch slate: what research must check first
The blueprint's six films (Part G §4) are strong paradoxes. Before any script, each goes through research and
`claims.csv`. These points in the blueprint's own text are **flagged for checking**, because each looks overstated,
contested or possibly wrong; none is stated here as fact:
1. **Train wheels.** The title "Why Train Wheels Never Derail" is a false absolute (§9.2); trains do derail. Check:
   the 1:20 taper (which networks and standards), whether the flange "rarely touches" on sharp curves (likely not on
   tight curves, where flange contact and squeal are common), the "100-ton locomotive at 120 km/h on a sharp curve"
   example, and the flip side to include: the same cone causes hunting oscillation (Klingel's analysis; verify).
   The blueprint fixes Video 1's first sentence word for word (Part G §6.3, "…without ever derailing"): keep it if the
   sources support it for the case it describes, otherwise ask the owner for the one-word change.
2. **LED bulbs.** "When the chip lasts 50" (50 what?): 50,000 hours is about 5.7 years of continuous use, not "over 15
   years". Check the driver topology (many cheap bulbs use capacitive-dropper or linear drivers and high-voltage LED
   strings, not 230 V → 12 V SMPS), whether overdriven LED chips are themselves a common failure, the capacitor
   ageing rule (the 10 °C doubling rule is a manufacturer rule of thumb: cite a datasheet), and the price figure.
   Global audience: 120 V and 230 V markets.
3. **Teapot effect.** The blueprint's mechanism (no-slip boundary layer + Bernoulli low pressure + capillary
   adhesion) is likely not the current explanation. Check the 2010 *Physical Review Letters* wettability work
   (Duez et al.) and the 2021 *Journal of Fluid Mechanics* analysis (Scheichl et al.) and attribute the explanation.
4. **Elevators.** "Cannot free-fall" is a false absolute; lifts have fallen in rare failures. Check: Otis's 1853 sale
   vs the 1854 Crystal Palace demonstration; his original safety (a spring and ratchet) vs the later flyball governor
   and wedge safety gear; the trip speed (codes such as ASME A17.1 / EN 81-20 set it, often around 115% of rated
   speed or more: cite the code); and whether "the harder it falls, the harder it grips" is true of progressive
   safety gear (which is designed to limit deceleration).
5. **Tires.** Check the slip-ratio definition (traction and braking forms differ), "peak at exactly 8–12%" (varies
   with surface and tire), "at 0% slip traction drops" (at 0% slip the longitudinal force is zero: free rolling), and
   that most "slip" in the contact patch is elastic tread deformation, not sliding.
6. **Single-crystal blades.** "Operate at temperatures hotter than the melting point of the metal itself" is wrong as
   written: the gas is hotter than the alloy's melting point; the blade is kept below it by internal cooling and
   thermal barrier coatings. Check the 1,150 °C / 1,400 °C / 14,000 RPM / 20,000 g / 15 cm figures per engine, and
   the grain selector: grains with a ⟨001⟩ direction along the heat flow win the competitive growth in the starter,
   and the helix then lets one grain through; "the crystal aligned with the spiral axis survives" is likely wrong.

### 17.4 Candidate pool from the strategy research (2026-11-07)
The report's top ten (Part G.2), re-scored on the §4.3 gate. Its own scores were 34–40; ours are lower where the
viewer seldom meets the object or the report's catch did not hold up. Film 1 (train wheels) is made; the lift is
already slate film 4 (§17.3). **Every dossier line below is the report's claim, flagged, not a fact.**

| Topic | Report | Ours (F/D/P/C) | Verdict | Research must check first |
|---|---|---|---|---|
| **The bolt is a spring** (preload) | 38 | 37 (9/10/9/9) | **Greenlight** | The joint diagram and how small a share of an external load the bolt feels (VDI 2230, Shigley; cite the numbers); that too little preload exposes the bolt to the full alternating load and fatigue starts at the first engaged thread root (the report's "shearing" is the wrong word); the other side of the catch (too much preload yields the bolt; self-loosening under transverse slip, Junker). "BOLTS ARE SPRINGS" is honest. |
| **The bicycle that steers itself** | 37 | 35 (10/8/9/8) | **Greenlight** | Kooijman et al. 2011, *Science* 332: 339–342 (confirmed: self-stable with gyroscopic and caster effects cancelled; mass distribution of the front assembly matters). The real catch is likely the narrow stable speed range (weave below it, capsize above it; Meijaard et al. 2007 benchmark), not the report's "shimmy", a different mode. Its thumbnail "PHYSICS WAS WRONG" fails §9.2. |
| **The rice cooker with no chip** (Curie point) | 35 | 32 (9/8/9/6) | Find the catch | Which part has the Curie point (sources disagree: a ferrite piece by the pot or the magnet itself), and its temperature (the report's 103 °C: cite a patent or datasheet). The report's catch (undercooked rice at altitude "because" of the fixed Curie point) mixes two effects: at altitude the water boils cooler whatever the switch does. |
| **The helicopter's 90° delay** | 38 | 31 (6/9/8/8) | Re-angle | Phase lag is a resonance of blade flapping, not gyroscopic precession (Leishman, *Principles of Helicopter Aerodynamics*); 90° only with no hinge offset, about 80–90° for articulated rotors and 75–80° for hingeless ones. Its title "The 90-Degree Flaw in Every Helicopter" is false: it isn't a flaw. Few viewers have seen a swashplate. |
| **The pump that needs no power** (hydraulic ram) | 37 | 31 (4/9/9/9) | Re-angle | The share of water lifted against the share dumped depends on the head ratio (the report's 10% / 90%: cite a manufacturer or a paper), how high it can lift, and the water-hammer fatigue. "Zero power" must say where the energy comes from: the falling water. Low familiarity. |
| **The siphon that pulls** | 35 | 31 (8/8/8/7) | Re-angle; contested | Boatwright, Hughes & Barry 2015, *Scientific Reports* 5: 16790 (a 15 m siphon at sea level: gravity and cohesion) and its 2017 corrigendum; the debate is live, so attribute both sides (§9.3). Its title "The Siphon That Works in Space" is false: a siphon needs gravity. |
| **The clock's recoil** (anchor vs deadbeat escapement) | 35 | 31 (6/10/7/8) | Re-angle | The deadbeat's date and maker (Graham, about 1715?), the recoil's effect on timekeeping, and the friction trade-off. |
| **Ferguson's paradox** (gears that turn three ways) | 34 | 27 (3/10/8/6) | Drop; a Short | Tooth counts (the report's 20 / 21 / 19) and the backlash claim. Great geometry, little familiarity. |

The report's train-wheel dossier is not used: its "centrifugal force shifts the wheelset" and "the flanges almost
never touch" are the errors film 1's research corrected (`films/train-wheels/claims.csv`).

### 17.5 Questions put to the owner (2026-11-07)
Both answered the same day: film length (no limit, §17.1 decision 12) and multi-language audio (YouTube
auto-dubbing, §17.1 decision 13).

---

# Part G: the owner's directives, verbatim

## G.1 Master Engineering Specification (received 2026-10-31)

The owner's blueprint, `The_Mechanical_Paradox_Master_Blueprint.md`, kept word for word. Where this playbook applies
it differently, the section says so and why (§6.2 logo and banner callouts, §7.5 pauses, §13.5 engagement, §17.3
slate facts).

---

# Master Engineering Specification: The Mechanical Paradox
**Document Version:** 1.0 (Master Handoff & Production Architecture)
**Channel Name:** The Mechanical Paradox
**Handle:** `@themechanicalparadox`
**Network Siblings:** *Be Practical with Kishore* | *Built on Bharat*
**Audience Scope:** Global English (Tier-1 CPM: US, UK, CA, AU, DE, IN)
**Target Category:** Everyday Physics, Mechanical Engineering, Failure Forensics, Counter-Intuitive Science

---

## 1. Brand Identity & Channel Architecture

```
                       ┌──────────────────────────────────────────────┐
                       │           THE MECHANICAL PARADOX             │
                       │ "The engineering that shouldn't work.       │
                       │  The invisible physics that makes it."       │
                       └──────────────────────┬───────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
   [Core Identity]                      [Visual Asset]                      [Sonic Identity]
- Pure Scientific Truth              - Impossible Gear Monogram          - Low Sub-Bass Drones
- Zero Stock Video Dependency        - Dark Isometric Blueprint          - Micro-Mechanical Clicks
- 100% Code-Rendered (60 FPS)        - High-Contrast Alert Vectors       - Precision Text Pacing
```

### 1.1 The Manifesto
*The Mechanical Paradox* dismantles the illusion of common sense. Everyday reality is packed with mechanical systems and physical laws that seem impossible upon first glance: train wheels with no steering that never derail, solid-state light chips killed by tiny liquid cylinders, fluids that climb upward against gravity, and rubber tires that must slip in order to grip. 

We do not produce surface-level trivia, textbook recaps, or motivational content. We produce **forensic mechanical deconstructions** rendered entirely through code-generated physics simulations, exploded cross-sections, and dynamic schematics.

### 1.2 Brand Assets & Design Language

#### Channel Taglines
* **Primary (Display):** *The engineering that shouldn't work. The invisible physics that makes it.*
* **Secondary (Bio/Metadata):** *Real mechanics. Invisible physics. Zero fluff.*

#### The Icon / Logo Specification
* **Concept:** *The Impossible Tribar Gear* or *The Interlocked Reuleaux Mechanism*.
* **Geometry:** Three non-standard, mathematically real cycloidal gears arranged in an impossible isometric loop. The central negative space forms a clean delta ($\Delta$) crosshair.
* **Palette:**
  * Background: Pitch Abyss (`#070A0F`)
  * Primary Linework: Blueprint White (`#F0F4F8`) with $2.5\text{px}$ crisp vector stroke.
  * Paradox Focal Point: Electric Hazard Amber (`#FF9F1C`) glowing at the mesh point.
* **Format:** Scalable vector format (`.svg`), rendered cleanly down to $16 \times 16\text{ px}$ mobile favicon resolution without loss of detail.

#### The Channel Banner Specification ($2560 \times 1440\text{ px}$)
* **Left Safe Area ($1232 \times 338\text{ px}$ mobile focus):**
  * Top Line (Monospace, $16\text{px}$, `#5A6E85`): `// MECHANICAL FORENSICS & APPLIED PHYSICS`
  * Main Headline (Heavy Display Sans, $72\text{px}$, `#FFFFFF`): **THE MECHANICAL PARADOX**
  * Sub-text (Medium Sans, $24\text{px}$, `#8B9EB5`): *Why things work when intuition says they shouldn't.*
  * Release Cadence Badge (`#FF9F1C` border): `NEW DEEP DIVE EVERY SUNDAY`
* **Right Safe Area:**
  * An exploded isometric vector schematic of a high-bypass turbofan compressor stage or a cycloidal reduction drive.
  * Subtle blueprint grid lines ($\text{spacing} = 40\text{px}$, opacity $12\%$) fading off toward the left edge.
  * Real engineering callouts: $\sigma_{\text{yield}} = 1,150\text{ MPa}$, $\tau_{\text{shear}}$, $P_1 \rightarrow P_2$.

---

## 2. Top-Tier Visual Engineering Pipeline (GitHub Actions & Remotion)

Because rendering time is **unconstrained** and tasks execute across multi-instance GitHub Actions runners or cloud instances, the visual standard is non-negotiable: **every frame must look like an interactive scientific publication rendered at $60\text{ fps}$ in $4\text{K}$.**

```
 ┌─────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
 │   Claude Code   │ ───> │ React 19 + Remotion     │ ───> │  GitHub Actions Matrix  │
 │  Physics Spec   │      │ (Three.js / Canvas/SVG) │      │ (Parallel Frame Chunks) │
 └─────────────────┘      └─────────────────────────┘      └────────────┬────────────┘
                                                                        │
                                   ┌────────────────────────────────────┘
                                   ▼
                   ┌───────────────────────────────┐
                   │ FFmpeg Pro-Encode             │
                   │ (ProRes / 4K H.264 High 10)   │
                   │ Master Audio-Visual Composite │
                   └───────────────────────────────┘
```

### 2.1 The Technical Stack
* **Framework:** React 19 + Remotion ($60\text{ fps}$, $3840 \times 2160$ master canvas).
* **3D Geometry & Exploded Assemblies:** `@react-three/fiber` + Three.js running inside Remotion sequences via `<ThreeCanvas>`.
* **2D Vector Morphing & Paths:** `flubber` + `d3-interpolate-path` for fluid path transformations (e.g., transforming a cylindrical profile into a conical wheel curve).
* **Procedural Physics & Particle Fields:** HTML5 Canvas Context 2D for fluid particles, gas Brownian motion, and electromagnetic field lines.
* **Shader Engineering (GLSL):** Custom fragment shaders for Finite Element Analysis (FEA) stress gradients ($\sigma_{\text{von Mises}}$) and thermal heat maps.

### 2.2 The Unified Visual Palette

| Semantic Role | Color Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | Abyss Black | `#070A0F` | Deep matte background; zero pure `#000000`. |
| **Grid & Structural Lines** | Blueprint Slate | `#141E2C` | Subtle $30\text{px}$ coordinate grids and reference axes. |
| **Neutral Solid Metal** | Cast Iron Gray | `#6A7B8C` | Housings, casings, shafts, machine frames. |
| **Precision Surfaces** | High-Grade Specular | `#F1F5F9` | Polished knife edges, gear teeth faces, cutting tools. |
| **Force: Tension / Thermal / Warning** | Stress Crimson | `#FF3B30` | High tensile stress, heat accumulation, failure points. |
| **Force: Compression / Fluid Flow** | Dynamic Cyan | `#00E5FF` | Compressive load lines, laminar fluid streamlines. |
| **Equilibrium / Optimal Path** | Kinetic Emerald | `#00F59B` | Balanced forces, correct clearances, energy recovery. |
| **Friction / Boundary Layer** | Shear Amber | `#FF9F1C` | Kinetic friction zones, Coanda effect layers, electric fields. |

### 2.3 The Four Inviolable Animation Rules

1. **The Law of Continuous Micro-Motion:**
   * A completely static visual on screen for more than $2.5\text{ seconds}$ is classified as a critical defect.
   * Every schematic must maintain subtle, physics-driven micro-motion: a slow $1.02\times \rightarrow 1.05\times$ coordinate zoom (the mathematical Ken Burns), continuously spinning shafts, moving stream ribbons, or subtle particle flutter.
2. **True Physics Easing:**
   * Linear interpolation (`linear`) is strictly banned for physical bodies.
   * All mechanical motions must use spring physics with precise mass, stiffness, and damping:
     $$\text{spring}(\{ \text{frame}, \text{fps}: 60, \text{config}: \{ \text{mass}: 1.2, \text{damping}: 24, \text{stiffness}: 180 \} \})$$
3. **Finite Element Analysis (FEA) Stress Shaders:**
   * When showing mechanical failure, do not flash arbitrary red icons.
   * Render real stress distributions using fragment shaders calculating approximate von Mises stress:
     $$\sigma_v = \sqrt{\frac{1}{2}\left[(\sigma_{xx} - \sigma_{yy})^2 + (\sigma_{yy} - \sigma_{zz})^2 + (\sigma_{zz} - \sigma_{xx})^2 + 6(\tau_{xy}^2 + \tau_{yz}^2 + \tau_{zx}^2)\right]}$$
   * The material gradient must smoothly bloom from deep navy blue $\rightarrow$ cyan $\rightarrow$ yellow $\rightarrow$ deep saturated red right at the notch, crack root, or contact patch.
4. **Live Telemetry Overlays:**
   * Every scene must feature dedicated physical telemetry in a fixed monospace HUD window (top-right or bottom-right):
   * Example: `RPM: [12,450]`, `SHEAR: [412 MPa]`, `TEMP: [842 °C]`, `SLIP: [9.4%]`.
   * Telemetry values must tick dynamically in synchronization with the script's narrative arc.

---

## 3. Audio Engineering & Procedural Foley Architecture

In a faceless, code-driven video, **the sound design provides the tactile weight**. Without it, the video feels like an academic slideshow.

### 3.1 Loudness Standards & Mixing Bus Architecture
* **Dialogue Bus:** Automated voice track normalized to $-14\text{ LUFS}$ ($\pm 0.5\text{ LUFS}$ integrated) with a hard true peak limiter set to $-1.0\text{ dBFS}$.
* **Foley & Sound Effects (SFX) Bus:** Mixed dynamically between $-18\text{ dBFS}$ (background clicks) and $-6\text{ dBFS}$ (major structural failures/snaps).
* **Sub-Bass & Drone Bus:** High-pass filtered at $30\text{ Hz}$, low-pass filtered at $90\text{ Hz}$, resting at $-26\text{ dBFS}$ to eliminate digital silence.
* **Music Ducking:** Side-chain ducked automatically by $-8\text{ dB}$ whenever dialogue is present, recovering with a smooth $250\text{ ms}$ release curve.

### 3.2 The Tactile Foley Library Requirements

| Event | Required Sound Design Elements |
| :--- | :--- |
| **Grid / Blueprint Assembly** | High-precision relay switch click, rapid tactile drafting-pen scratch. |
| **Telemetry Tick / Counter** | Heavy mechanical typewriter mechanism or precision quartz chronometer pulse. |
| **Vector Force Emergence** | High-frequency glass resonant tone ($2.4\text{ kHz}$) panning outward with the arrow. |
| **Mechanical Fracture / Failure** | Dry metallic snap, high-frequency shear shriek, layered over a $45\text{ Hz}$ sub-bass boom. |
| **Thermal Accumulation** | Rising low-frequency electrical transformer buzz ($50\text{ Hz} \rightarrow 120\text{ Hz}$). |
| **Fluid / Aerodynamic Drag** | Filtered pink noise sweeping downward as the boundary layer clings or detaches. |

### 3.3 Voice Pacing & Text-to-Speech (TTS) Notation
AI narrators default to an unnatural, continuous cadence. The script must be formatted with deliberate rhythmic triggers:
* **Em-dashes (`—`):** Insert a mandatory $250\text{ ms}$ breath pause before a counter-intuitive reveal.
* **Ellipses (`...`):** Insert a $400\text{ ms}$ tension hang before presenting a paradox.
* **Phonetic Spelling Overrides:** Write out all scientific units in full phonetic English:
  * $\text{MPa} \rightarrow$ `mega-pascals`
  * $\text{kN} \rightarrow$ `kilo-newtons`
  * $\mu\text{m} \rightarrow$ `micro-meters`
  * $\text{Coandă} \rightarrow$ `kwahn-DAH`

---

## 4. The 6-Video Genesis Launch Slate

This exact roster of six videos establishes the channel's topical authority and provides an immediate binge-loop for early viewers.

---

### Video 1: The Wheel Geometry Paradox
* **Working Title:** *The Conical Trick: Why Train Wheels Never Derail*
* **Video Duration:** $4\text{ minutes}, 15\text{ seconds}$
* **The Paradox:** A 100-ton locomotive rounds a sharp curve at $120\text{ km/h}$. The outer rail is significantly longer than the inner rail. The solid steel axle connects both wheels rigidly with zero differential gearing and zero steering rack. Why don't the wheels slip, screech to a halt, or jump the tracks?
* **Core Physics:**
  * Cylindrical wheels vs. Conical profile ($1:20$ taper slope).
  * Rolling radius differential ($\Delta r$): as centrifugal force shifts the wheelset outward, the outer wheel rides on a larger diameter circle ($2\pi r_{\text{outer}} > 2\pi r_{\text{inner}}$), self-correcting the trajectory through pure geometry.
  * The flange is not a steering guide; it is an emergency fail-safe that rarely touches the rail under normal operation.
* **Key Visual Sequence:** An exploded front-facing cross-section showing the rail contact point shifting horizontally along the conical curve, with real-time vector arrows showing self-centering restoring forces.

---

### Video 2: The Solid-State Thermal Paradox
* **Working Title:** *Why LED Bulbs Die in 2 Years (When the Chip Lasts 50)*
* **Video Duration:** $4\text{ minutes}, 40\text{ seconds}$
* **The Paradox:** The Gallium Nitride (GaN) light-emitting diode is a solid-state semiconductor with no filament, no vacuum, and a continuous operational rating exceeding 50,000 hours (over 15 years of continuous use). Yet commercial consumer LED bulbs flicker and die in 18 to 24 months.
* **Core Physics & Material Science:**
  * Photons generate heat: inefficient quantum transitions dump thermal energy into the miniature aluminum core PCB.
  * The Switch-Mode Power Supply (SMPS) inside the plastic base: converting $230\text{ V}$ AC mains to $12\text{ V}$ DC requires a tiny aluminum electrolytic capacitor.
  * Arrhenius Law of Chemical Degradation: for every $10\text{ °C}$ increase in operating temperature, the liquid electrolyte inside the capacitor evaporates through the rubber seal twice as fast:
    $$\text{Lifespan} = L_0 \times 2^{\frac{T_{\text{max}} - T_{\text{actual}}}{10}}$$
  * The diode survives completely intact; the heat-starved $\$0.03$ capacitor dries out, causing voltage ripple that triggers thermal runaway in the driver circuit.
* **Key Visual Sequence:** A vertical 3D cutaway of a standard household bulb with an animated thermal gradient rising from the LED board, pooling directly in the unventilated plastic base, and boiling the microscopic electrolyte fluid inside the capacitor.

---

### Video 3: The Boundary Layer Fluid Paradox
* **Working Title:** *The Teapot Effect: Why Liquids Dribble Down the Spout*
* **Video Duration:** $3\text{ minutes}, 50\text{ seconds}$
* **The Paradox:** Pour tea fast, and the fluid arcs cleanly into the cup. Pour tea slowly and carefully, and the liquid defies gravity, curls 180 degrees around the lip of the spout, and dribbles down the underside onto your table.
* **Core Physics:**
  * The Navier-Stokes boundary layer: fluid molecules touching the solid spout lip experience zero velocity relative to the wall (the "no-slip condition").
  * Pressure drop: the high-velocity layer just above the no-slip layer creates a localized low-pressure pocket via the Bernoulli principle.
  * Capillary adhesion and surface wettability: the liquid wets the hydrophilic ceramic, and ambient atmospheric pressure pushes the fluid ribbon upward against the curved underside of the lip.
  * The Engineering Cure: sharp hydrophobic edges ($90\text{°}$ sharp lip separation) vs. rounded glazed ceramics.
* **Key Visual Sequence:** A microscopic cross-section view of the spout lip showing the fluid velocity vectors curling backward, with dynamic pressure differential overlays ($P_{\text{ambient}} > P_{\text{lip}}$).

---

### Video 4: The Fail-Safe Structural Paradox
* **Working Title:** *Why Elevators Cannot Free-Fall (The 1853 Wedge Trick)*
* **Video Duration:** $4\text{ minutes}, 30\text{ seconds}$
* **The Paradox:** In movies, cutting an elevator's suspension cables sends the cab plummeting down the shaft to certain destruction. In reality, even if every hoist rope is cut simultaneously, the cab cannot fall more than a few feet.
* **Core Physics:**
  * Elisha Otis's 1853 breakthrough: the separation of hoisting tension from safety retention.
  * The centrifugal flyball governor: an independent cable measures the cab's speed. If downward velocity exceeds rated limits by $15\%$, the governor mechanically locks.
  * The Eccentric Wedge Mechanism: the locked governor pulls a safety linkage under the car, driving hardened steel serrated wedges up into the tapered safety blocks, clamping directly onto the vertical steel guide rails.
  * The Paradox: the heavier the cab and the harder it falls, the deeper the wedges bite into the rails, using the car's own downward kinetic energy to seize it in place.
* **Key Visual Sequence:** An isometric transparency of the shaft showing the cables snapping, the flyball governor flying open under centrifugal force, and the steel wedges mechanically biting into the steel guide columns with stress-field vectors radiating outward.

---

### Video 5: The Traction Slip Paradox
* **Working Title:** *The Bizarre Reason Tires Must Slip 10% to Grip*
* **Video Duration:** $4\text{ minutes}, 45\text{ seconds}$
* **The Paradox:** Ask any driver: if a car tire slips against the asphalt, you have lost traction. Ask any vehicle dynamics engineer: if a tire does not slip against the asphalt, it cannot generate maximum acceleration, braking, or cornering force.
* **Core Physics:**
  * The definition of Slip Ratio ($s$):
    $$s = \frac{\omega r - v}{v} \times 100\%$$
  * Rubber friction is not Coulomb friction ($\mu N$). Rubber friction is composed of two distinct mechanisms: **Adhesion** (chemical bonding between rubber polymer chains and surface molecules) and **Hysteresis** (energy loss as rubber deforms over microscopic road asperities).
  * To deform the rubber over microscopic asphalt peaks and generate hysteretic damping force, the rubber tread blocks must physically stretch, compress, and slip microscopically through the contact patch.
  * Peak braking and acceleration occurs at exactly $8\%\text{ to }12\%$ longitudinal slip. At $0\%$ slip, traction drops; at $25\%$ slip, the tire enters dynamic skidding.
* **Key Visual Sequence:** A microscopic zoom into the tire contact patch ("the footprint"), showing the individual tread blocks leaning like rubber pillars, gripping the jagged aggregate, and releasing with color-coded shear force heatmaps.

---

### Video 6: The Vacuum Metallurgy Paradox
* **Working Title:** *The Single-Crystal Miracle: Growing Jet Blades in a Vacuum*
* **Video Duration:** $5\text{ minutes}, 15\text{ seconds}$
* **The Paradox:** Turbine blades inside a jet engine operate at temperatures hotter than the melting point of the metal itself ($1,150\text{ °C}$ in an environment of $1,400\text{ °C}$ gas), rotating at $14,000\text{ RPM}$ under $20,000\text{ g}$ of centrifugal force. Normal high-strength alloys stretch like warm plastic and shatter within hours.
* **Core Physics & Metallurgy:**
  * Creep failure: at high temperatures under continuous load, metal atoms migrate along microscopic boundaries between alloy crystals (grain boundary sliding and void coalescence).
  * The Solution: **Eliminate all grain boundaries.** The entire $15\text{ cm}$ turbine blade must be cast as one single, continuous, unbroken metallic crystal.
  * The Helical Pigtail Selector: in a vacuum induction furnace, molten nickel superalloy is cooled from the bottom upward. The solidifying metal climbs through a corkscrew-shaped ceramic passage.
  * The geometric filter: multiple crystals enter the helix, but only the single crystal whose crystal lattice is aligned with the spiral axis survives to emerge at the top, seeding the entire blade.
* **Key Visual Sequence:** A dynamic 3D vacuum mold showing the atomic lattice growing upward, entering the corkscrew spiral, choking off competing crystals, and emerging as a singular, perfect atomic lattice.

---

## 5. Algorithmic Engineering & Launch Execution Architecture

Drawing directly from the performance data and retention analytics of *Be Practical with Kishore* (e.g., the Tejas Jet Engine explainer and Pharma API master cut):

```
                       THE LAUNCH TIMELINE & ALGORITHMIC SPRINT
                       
  [T - 72 Hours] ─── Upload Videos 1, 2, and 3 as UNLISTED
                      - Full 4K VP9/AV01 Server Transcode Complete
                      - Automatic Captions Generated & Technical Keywords Indexed
                      - End Screens Linked: Vid 1 -> Vid 2 -> Vid 3
  
  [Launch Day: 00:00] ── Video 1 Set to PUBLIC (Sunday @ 11:30 AM IST / 06:00 AM UTC)
  
  [Hours 0 - 2]   ── Rapid Velocity Pass
                      - Creator Igniter Comment Pinned within 60s
                      - 10-15 In-Depth Peer Responses Posted
  
  [Launch + 48h]  ── Video 2 Set to PUBLIC
                      - Algorithmic Binge Loop Activated from Video 1 End Screen
```

### 5.1 Algorithmic Insights Applied from Previous Channels
1. **The Morning Dead Zone vs. The Evening Surge:**
   * High-density technical documentaries collapse if dropped during morning office commute hours ($09:00 - 11:00\text{ AM}$). 
   * Global audiences consume dense physical explainers during leisure windows: **Sundays between 11:30 AM and 01:30 PM IST** (capturing early afternoon India and early morning US/EU weekend wake-ups), or **Weekdays at 05:00 PM IST** sharp.
2. **The "Unlisted 4K Buffer" Protocol:**
   * Never upload a video and hit "Public" immediately.
   * Upload as **Unlisted at least 3 hours prior to launch**. YouTube requires up to $90\text{ minutes}$ to process $4\text{K}$ VP9/AV01 codecs and index the auto-transcript. 
   * If core viewers click notifications within the first 15 minutes and see a blurry $360\text{p}$ stream without accurate subtitles, they bounce immediately, destroying early Average Percentage Viewed (APV).
3. **The 3-Video Drop Strategy:**
   * Do not launch a channel with a single video. When a new viewer finishes an exceptional explainer, they check the channel page. If the channel has zero other videos, they leave without subscribing.
   * Render and upload **Videos 1, 2, and 3** before launch. 
   * Launch Video 1. Release Video 2 forty-eight hours later, immediately linking Video 1's end-screens directly into Video 2. This gives the YouTube algorithm an immediate session watch-time loop.

### 5.2 Thumbnail Engineering: The "Squint Test" & The 2-Element Rule
Every thumbnail must be legible at a tiny scale ($120 \times 68\text{ px}$) on a smartphone browse screen.

* **Rule of Two Elements:** Exactly one subject object and one context disruptor.
  * *Example for Video 1 (Train Wheels):* An exaggerated cross-section of a conical wheel sitting on a rail, with a bright orange pointer showing the gap.
  * *Text:* Maximum 3 bold words in high-contrast yellow/white sans-serif font: **THE CONICAL TRICK**.
  * *Never do:* Busy collages, tiny technical formulas, generic human stock faces, or low-contrast backgrounds.

---

## 6. Execution Directives for Claude (Operational Protocol)

When creating assets, scripts, or Remotion components for *The Mechanical Paradox*, adhere strictly to these rules:

1. **Prioritize Physics over Metaphor:**
   * Avoid vague descriptions like *"The metal gets very stressed."* 
   * State the physical reality: *"The cyclic shear load concentrates along the root radius, exceeding the 420-megapascal yield strength."*
2. **Automated Remotion Rendering Standard:**
   * All React components must be written with strict TypeScript types.
   * All animations must tie directly to Remotion’s `useCurrentFrame()` and `interpolate()` or `spring()`. Never use CSS `@keyframes` (which desynchronize in headless render frames).
   * Assets must use local SVGs or procedural Canvas drawing. Never reference external web URLs that can return 403 Forbidden errors during headless cloud runs.
3. **Pacing Discipline:**
   * The hook must state the broken intuition within the first **12 seconds**.
   * No introductory greetings (*"Hey guys, welcome back"*). 
   * The first sentence of Video 1 must begin immediately: *"A one-hundred-ton locomotive has no steering wheel, no differential gears, and a solid steel axle. Yet it rounds high-speed curves without ever derailing."*

---

## G.2 Deep research brief (received 2026-11-07)

The owner's brief for outside deep research, kept word for word below. Two reports came back: *Engineering the
Mechanical Paradox: Audience Psychology, Retention Architecture, and Algorithmic Strategy for Technical Explainers*
(18 pages, 40 works cited) and a 4-page production summary. Their originals are in Drive `_Channel/research/`. They
are research, not the owner's rules: every claim was checked, and the verdicts are in §4.5 (what we adopted, corrected
or rejected) and §17.4 (the topics). The summary's story arc, which §5.4 adopts, word for word:

```
[Beat 1: The Intuitive Paradox] ──> "You see this everyday object. Its basic logic is impossible."
[Beat 2: The Deceptive Trick] ──> "Here is the simple geometric trick that makes it work."
[Beat 3: The Fatal Trade-Off] ──> "The catch: That exact trick introduces a violent secondary danger."
[Beat 4: The Industrial Truce] ──> "How real engineers balanced the trade-off (damping, tolerance)."
[Beat 5: The Philosophical Coda] ──> "Engineering isn't finding perfection; it's choosing which problem you survive."
```

---

# Deep Research Brief: Engineering & Physical Paradox Content Strategy on YouTube

## Objective
Identify the highest-performing content sweet spot, narrative architecture, and retention mechanics for a faceless, technical YouTube channel ("The Mechanical Paradox") targeting mature, curious viewers (ages 30–65+, heavy Connected TV/desktop consumption). The goal is to maximize long-form retention (50–70% AVD) and click-through rate (CTR) on algorithmic Browse features by stripping academic math in favor of intuitive, physical engineering contradictions.

---

## Part 1: Audience Psychology & Competitive Gap Analysis

1. **Viewer Motivation Teardown:**
   - Why do non-academic, adult audiences watch channels like *Practical Engineering*, *Real Engineering*, *Veritasium*, *Technology Connections*, and *Branch Education*?
   - What triggers viewer fatigue and drop-off in educational/physics content? Specifically, analyze the drop-off delta between theoretical math (equations, derivations) versus physical intuition (tangible scale, visual trade-offs, sensory mechanics).
   - What specific emotional or psychological hook causes a viewer to click on an explainer about an everyday physical object they usually ignore (e.g., train wheels, differential gears, elevator brakes)?

2. **Competitive Space & Saturation Map:**
   - Map out the spectrum between "Hyper-Sensational Pop-Sci" (e.g., Bright Side, What If) and "Rigid Academic Lectures" (e.g., Khan Academy, 3Blue1Brown, university lectures).
   - Where is the open white space on YouTube for dark-slate, CAD/schematic-driven technical explainers that treat viewers like intelligent adults without lecturing them?
   - What are the common failure modes of smaller engineering channels that fail to gain traction despite having high-quality 3D animations?

---

## Part 2: Narration Architecture & Depth Calibration

1. **The "Goldilocks Depth" Standard:**
   - How deep should technical explanations go before diminishing returns set in for broad Browse audience retention?
   - Where is the exact boundary between "satisfyingly technical" and "overwhelmingly academic"?
   - How should complex engineering phenomena (e.g., resonance, material shear, hydraulic pressure, fluid dynamics) be translated into zero-calculus, sensory metaphors without dumbing down the subject?

2. **Pacing, Voice, and Tone:**
   - Analyze the vocal posture of high-retention technical narration. Compare:
     - The "Hype / Fast-Paced YouTuber" voice.
     - The "Academic Professor" voice.
     - The "Calm, Investigative Technical Observer / Forensic Analyst" voice.
   - What structural pauses, delivery cadences (WPM), and sentence structures maximize engagement on large screens (Connected TV) where viewers are not multitasking?

3. **Narrative Beat Framework:**
   - Formulate an optimal 4-beat or 5-beat story structure for an 8-to-12 minute mechanical paradox video:
     - *Beat 1 (The Hook / The Contradiction):* Establishing an everyday object that shouldn't work according to basic logic.
     - *Beat 2 (The Hidden Mechanism):* The deceptively simple geometric or mechanical trick.
     - *Beat 3 (The Downside / The Catch):* Why this trick introduces a dangerous or costly secondary problem (the engineering trade-off).
     - *Beat 4 (The Real-World Solution):* How modern industry compromises or balances the paradox.

---

## Part 3: Topic Opportunity Index (Evaluation Criteria)

Establish a scoring rubric (1–10) to evaluate prospective mechanical topics before greenlighting production, based on:
1. **Everyday Familiarity vs. Hidden Complexity:** Does the viewer interact with or see this object regularly without knowing how it actually functions?
2. **Visual CAD / Blueprint Potential:** Can the core paradox be rendered cleanly in vector cross-sections and 3D schematics rather than relying on abstract concepts?
3. **Packaging Simplicity (CTR Factor):** Can the core question be stated in 3 to 6 words on a thumbnail and title without requiring domain-specific jargon?
4. **Physical Trade-Off (No Free Lunch):** Does solving the initial mechanical problem create a new failure mode (e.g., cone taper solves steering, but induces hunting oscillation)?

---

## Deliverables Required
1. **Audience Persona & Watch Habit Summary:** Profile of the primary 35–65+ engineering/mechanics enthusiast.
2. **Scriptwriting Rulebook:** A concrete checklist of what words, formulas, and structural tropes to banned, versus what rhetorical devices and metaphors to enforce.
3. **Top 10 Ranked Video Candidates:** A curated table of 10 high-potential mechanical/physics topics scored against the Rubric, including:
   - Topic Name.
   - The Everyday Assumption.
   - The Real Mechanical Paradox.
   - The Primary Sensory/Physical Metaphor.
   - Proposed Thumbnail Hook & 3-Word Text.

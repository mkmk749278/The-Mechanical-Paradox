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
- Part A: How we work. 1 Owner and delivery · 2 Claude: creative director, and effort · 3 Sessions
- Part B: The channel. 4 Identity and audience · 5 Story architecture · 6 The look · 7 Narration ·
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
- **Phases:** at the end of each phase, stop and report in plain words: what was built, what was checked, what is left.
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
An everyday object or machine + a broken intuition + a mechanism that can be drawn. The test: can the viewer feel the
question in one second, and can we *show* the answer moving? The launch slate (§17.3) follows the blueprint.

## 5. Story architecture

### 5.1 The first minute (data from the sister channels' Studio, 2026-10-17)
On the sister channel, about two thirds of the viewers who left were gone in the first 45 seconds; a welcome, a logo
sting and a title card at 0:25–0:45 dropped retention from 47% to 33%. So:
- **0:00–0:12: the broken intuition**, in motion, on the thumbnail's own object (blueprint §6.3: within 12 seconds).
  No greeting, no logo, no channel name, no agenda.
- **By 0:30: the promise**: the specific question this film answers.
- **By 0:55: the open loop**: a turn that makes the obvious answer wrong ("and the flange you think holds it on? It
  almost never touches the rail"), paid off later at a stated point.

### 5.2 The body
- Chapters of 1–2 minutes in a 4–6 minute film (the blueprint's lengths; the topic decides, never a target), each with
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
- **True physics easing:** never linear for a physical body. `physical()` uses the channel spring (mass 1.2,
  damping 24, stiffness 180); a different body may use its own constants when the physics calls for it (a stiff steel
  part rings faster: say so in the scene doc). `shudder()` for impacts and jams. Camera and type use eased curves.
- **Show the real kinematics:** when gears turn, their speeds follow the tooth ratio; when a wheelset shifts, the
  rolling radii follow the cone. A viewer who pauses the frame should find the geometry true.

### 6.5 Looks to avoid (extend this list)
Glass cards; neon dashboards; a centred title on a gradient; icon grids; bullet lists; text cards; stock "science"
particles that mean nothing; a flat colour or plain gradient canvas; red flashing icons for failure (use the stress
field, §8.5); a decorative HUD with numbers that don't match the narration; slow-zoom on a static diagram for more
than one beat.

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
   with its real name and number. Never stop at "the metal gets stressed".
6. **Ask the viewer's own question out loud**, then answer it ("So why doesn't the outer wheel just slip?").
7. **Rhythm:** a long, flowing line, then a short punch. The key line on its own.
8. **Leave room for the picture.** Never describe what is on screen; say what the picture can't: the stakes, the
   number, the irony. Let the machine's own sound carry 1–3 s at big moments.
9. **End on an image and a feeling,** never a summary, then one forward line into the next film.

### 7.3 Words, rhythm and the banned list
- Plain spoken English: "but" not "however", "so" not "therefore", "about" not "approximately". Technical terms are
  welcome **when the film shows and explains them on screen**; list them in the film's `script/terms.txt` (the
  spoken-English check reads it, §15).
- **The breath test:** nothing over about 25 words; never three sentences of the same length in a row.
- **Banned:** "Hey guys", "Welcome back", "In this video", "Today we'll", "Let's dive in", "Let us understand",
  "Smash that like", "mind-blowing", "insane", "you won't believe", moreover, furthermore, delve, harness,
  testament to, imperative, in conclusion; regional slang.
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
recording text. Re-test once on this channel's voice before the first full recording.

### 7.6 Voice
**Owner, 2026-10-31: audition three neutral international narrators from the ElevenLabs library** on the same
paragraph (judged on warmth, low-register depth, pace variation, clarity for non-native listeners); the owner picks. Never synthesise a real
person's voice.

### 7.7 Recording blocks in the chat
Whenever a VO is ready or changes, the reply carries every block as its own fenced code block (one-tap copy on the
phone), each headed with block number, character count, voice, settings and the file name to save. Name the blocks
to re-record with every change.

### 7.8 Checks before the owner sees a narration
1. Fact and physics gate: every factual line maps to a confirmed `claims.csv` row (§9).
2. The lean-in test on every paragraph.
3. `scripts/spoken_english_check.py script/vo.txt --terms script/terms.txt --min-words 500 --max-words 900`.
4. **Independent audience review:** a new cloud session with no repo gets `prompts/audience_review_v1.md` (six
   viewers across the Tier-1 markets, including two engineers who catch wrong physics). Apply fixes that keep every
   fact true, save `films/<slug>/review/audience_vN.md`, archive the session.

## 8. Visual explanation toolkit (`lib/remotion/`)

### 8.1 Virtual camera
Every shot moves (§6.4). Push in to the contact point as the narration reaches it; orbit an exploded assembly to
reveal the hidden part; rack from the macro view to the micro view (the tire → the contact patch → the tread block
→ the asphalt asperity) as one continuous move, never a cut, when the film goes down a scale.

### 8.2 Exploded and cut-away views
Parts separate along their real assembly axis, in assembly order, with dashed centre lines (the banner's drive is the
model). Cut-aways use a clean section plane with hatched faces in the material's tone.

### 8.3 Mechanisms built from real geometry
Gears from `gears.ts` (cycloidal, mesh-checked); cams, linkages and wheel profiles from their real equations. A
mechanism that would jam or interfere in reality must not run smoothly on screen. Write a check (like the trio's
mesh check or the banner's pin-contact assert) for every new mechanism.

### 8.4 The HUD (`Hud.tsx`; blueprint §2.3 rule 4)
A fixed monospace window (top-right by default; bottom-right when the subject is up there; never inside YouTube's
bottom 20% or under its top-right overlays) whose values tick with the narration. **Every row carries a `source`:**
a `claims.csv` id, or `ILLUSTRATIVE`, and the panel then says "ILLUSTRATIVE VALUES". A HUD number never contradicts
the voice. Tabular figures so digits don't jitter.

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
Equations build term by term as the voice reaches each symbol, with each variable tied by colour to the thing it
measures on screen. Never a static slide of maths. One equation on screen at a time.

### 8.8 Real footage and photos
The blueprint's rule is **zero stock video**: the channel is 100% code-rendered. Where a real event is the evidence
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
- **720p review cuts first, 4K only after the owner approves the cut** (owner's rule on the sister channels,
  2026-10-28). Review: `scale` `2/3` (written as a fraction: 0.6666667 gives a non-integer frame and Remotion
  refuses it). Master: `scale` 2 → 3840×2160 at 60 fps.
- **Where:** full renders on GitHub's runners (`.github/workflows/remotion-render.yml`: 20 runners, 30 s shards,
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

## 11. Assets and references
- **Code first:** geometry, simulations and schematics are written, not downloaded.
- **Design from real references:** before drawing any real machine (a bogie, a governor, a bulb's driver board, a
  turbine blade), collect real reference photos and drawings into `films/<slug>/assets/ref/` (gitignored), make a
  contact sheet (`scripts/contact_sheet.py`) and write `design-reference.md` (element → reference → what to copy).
  *Why (Creator):* a made-up cab display and wrong signals were caught by a viewer.
- **Licences:** commercial-use only (no NC/ND), logged in `media_manifest.csv`. 3D/texture sources: Poly Haven,
  ambientCG (CC0), NASA 3D, Smithsonian 3D (CC0). Music: YouTube Audio Library; Pixabay only for tracks not marked
  "Content ID Registered" (on Creator 15 of 21 checked were registered). SFX: synthesised in code where possible
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
5. **Three thumbnails in Test & Compare** from the first hour.
6. Read Studio at 48 h, 7 days and 28 days (impressions and CTR per traffic source, retention at 0:30 and 1:00,
   search terms) and log what was learned in §16.

### 13.2 Title
Main phrase first, curiosity in the same line, ≤ 60 characters (100 is the limit), no `!`, no ALL-CAPS sentences, no
channel suffix (sister channel: the suffix used half of what a phone shows). Never an absolute the film contradicts
(§9.2). Deliver in a click-to-copy block plus two alternatives.

### 13.3 Thumbnail (blueprint §5.2 + the sister channels' CTR lessons)
- **The 2-element rule:** exactly one subject object and one context disruptor (the conical wheel on its rail + an
  amber pointer at the gap).
- **The squint test:** legible at 120×68 px on a phone browse screen and at 168×94 with the duration badge (nothing
  important bottom-right).
- **Words:** at most 3, bold, high-contrast white/yellow (amber), adding to the title, never repeating or answering
  it.
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
- [ ] Synthetic-content disclosure answered; tags only for spellings; pinned question; end-screen target; playlist.
- [ ] Shorts cut list.
- [ ] Saved in `films/<slug>/youtube/`; commit, PR to `main`, merge, tell the owner which branch to delete.

## 14. Review gates
Nothing reaches the owner without passing these, and §1's "polished only".

### 14.1 Script gate
- [ ] `claims.csv` complete, the gate passes; every changed line re-checked.
- [ ] Broken intuition by 0:12, promise by 0:30, open loop by 0:55; no banned openers; channel name only in the outro.
- [ ] Every chapter adds one layer of mechanism; the trade-off is said; no false absolutes.
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
- **Independent viewer review:** a new session without the repo gets the cut (Drive link) and the narration with
  timecodes, and returns a verdict, a per-scene score and the top 10 fixes; the `mkmk749278/Review` repo's forensic
  protocol applies to final cuts.
- [ ] Text readable on a phone; nothing important under YouTube's overlays.
- [ ] −14 LUFS, −1 dBTP in the final file; picture length = film length; audio/video within 0.15 s.

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
- `scripts/vo_timing.py` + `scripts/align_script.py`: VO timing. `scripts/vo_review.py`: measures each take
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

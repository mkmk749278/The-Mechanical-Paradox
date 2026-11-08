# Film 2: the elevator that brakes itself, treatment

**Logline.** If an elevator's ropes snap, the brake that catches it needs no power and no signal: the fall pulls its
own brake lever, and the rail drags the wedge tighter. But a brake that grabbed as hard as it could would hurt the
people it saves, so the real one is built to slip. And the counterweight that makes the lift efficient hides a danger
that brake was never built to stop: a car that runs away *upward*.

**The broken intuition (0:00–0:06).** "An emergency brake that slams on as hard as it can." Most viewers hold this
model, and it's half right: there is a brake. The wrong half (grab hardest = safest) is the film's real paradox.

**The feeling.** Start: the small cold drop everyone has felt in a lift. The darkest moment: "ten times the pull of
gravity", and then a car hurtling *up* into the top of the shaft. End: an odd warmth. The thing waiting above you in the
dark is a thin rope, two wedges and a spring, set with care.

## Angles considered (3) → chosen
1. *The brake powered by the fall* (mechanism mystery). Strong cold open, but on its own it ends at "clever".
2. **The brake built to slip** (the trade-off: why grabbing hardest would hurt you). **Chosen as the spine:** it
   turns the obvious answer upside down, and nobody in the search results says it. Angle 1 becomes its first half.
3. *Elevators fear going up* (the counterweight). Too strange for a first beat, but perfect as the twist: the same
   machine, the opposite direction, and the brake from angle 2 can't help. It becomes the second catch.

## Cold opens considered (3) → chosen
1. **The snap, frozen.** A car in a section of its shaft (ILLUSTRATION); the ropes part in slow motion; the HUD speed
   climbs from zero; the picture freezes mid-fall as the voice asks what you imagine saves you. **Chosen:** it puts the
   viewer inside the car by 0:03 and states the wrong model by 0:06.
2. *The scar.* A macro of a guide rail with bright cut marks. Rejected for the open: we have no licensed photo of a
   real tripped rail, and a render would pass for one. It returns as an ILLUSTRATION in "The spring".
3. *1854.* Otis on his platform, the rope cut. Rejected for the open (slow, historical, and the "All safe" line is
   unverified); kept as the proof that grabbing works only when slow.

## The five beats (PLAYBOOK §5.4)
1. **The paradox (0:00–0:50):** the snap; the wrong model; the promise; the open loop (upward).
2. **The trick (0:50–2:40):** not one cable → the governor and the rope that holds nothing → the car pulls its own
   lever → the wedge the fall feeds. The prediction question lands here.
3. **The catch (2:40–3:40):** grabbing hard = about 10 g; Otis's hooks; why the code allows that only on slow lifts.
4. **The truce (3:40–4:55):** disc springs set the squeeze; steady slowing; the rail is cut and ground smooth.
5. **The twist and its truce (4:55–6:20):** the counterweight pulls an empty car *up*; classic safeties can't help;
   codes add a brake that faces up.
6. **The landing (6:20–6:45):** the rope, the wedges, the springs, waiting in the dark; the line about letting go.

## Signature moments (2–3 to rewind and share)
1. **The car pulls its own brake lever (1:50).** Split section of the whole shaft: the governor wheel at the top locks
   (a hard `metal_jam_sub`), its thin rope freezes (turns from cyan to amber), and the car keeps dropping past it;
   the lever on the car's frame visibly rotates as the car falls past the stopped rope. One continuous move, true
   kinematics: the lever's rotation = the car's travel since the rope stopped.
2. **The wedge the fall feeds (2:25).** Macro section of the gear: the rail scrolls upward, the wedge touches it and is
   dragged up the 8° slot (inside Otis's 5–11° range), the squeeze arrows grow, then the disc springs compress and
   the arrows **stop growing**. The HUD's CLAMP trace rises and then goes flat as the springs take over.
3. **Stop it in two centimeters (2:55).** A bar of 2 cm against the 2 m/s arrow; the HUD's g-meter whips to 10.2 and
   the frame shudders (`shudder()`), then rewinds and replays with the springs: a calm flat line at 0.6 g over 34 cm.
   This is the trade-off in one shot.
Bonus: the counterweight dropping in the dark and the empty car rising, lit only by the HUD's climbing speed.

## Visual world (inside the brand, §6)
- **The shaft as a living blueprint:** a full-height section (car, counterweight, ropes, guide rails, governor at the
  top, tension pulley in the pit) in Blueprint White; the camera dives from the whole shaft to the gear and back.
- **Colour = meaning:** ropes cyan while they carry load; amber at the paradox points (the stopped governor rope, the
  wedge-rail contact); crimson for the hard-stop g-field and the rail cut; emerald for the balance of car and
  counterweight and the spring's set limit.
- **The FEA field** at the wedge-rail contact during braking (a teaching field, ILLUSTRATIVE).
- **Real footage (§8.8):** short inserts of real elevator shafts, ropes and governors where the narration names them,
  if licensed clips exist on the Pixabay API; otherwise none.
- **Blender hero shots (§10.6):** the cold-open car in its shaft; the safety-gear block on the rail for the macro;
  the landing's doors closing. State from `shots3d.ts`.
- **Honesty labels:** ILLUSTRATION on the cold-open fall and the cut rail; MODEL on every derived number;
  SIMPLIFIED on the generic wedge gear; NOT TO SCALE where the 8° slot and the jaw opening are exaggerated.

## Sound palette
The hum of a lift motor (synthesized), rope sing, the governor's ticking pawl, `metal_jam_sub` on the lock, a long
filtered rasp for the wedge sliding on the rail, a single low thud on the stop. Silence for the prediction question.
Music from the channel's Lyria library; it drops out for the 10 g shot.

## Package (from brief.md; refined at step 11)
Title lead: *What Happens If an Elevator Cable Snaps? It Brakes Itself*. Thumbnail lead: the gear biting the rail,
crimson at the contact, words IT BRAKES ITSELF. Challenger: the empty car rising, UP, NOT DOWN (the twist is confirmed:
C25–C27).


## Revision, 2026-11-08 (owner): the everyday hook, in picture and words
The owner asked that the film open on what people see every day and reveal what is inside it ("we see this every day,
but we don't know about it"). Narration (VO v7, five blocks re-recorded in the same voice): "You ride one without a
second thought. The doors close, the numbers climb. Now imagine its ropes snap." · "You have never seen it, but it
turns every time your car moves." (the governor) · "You never see them. They run just outside the walls of your
car." (the rails) · "You never see it, but every time you go up, it comes down." (the counterweight) · the landing
echoes the opening: "So the next time the doors close and the numbers climb, give it a second thought." Picture: real
inserts on each of those lines (an atrium of glass cars, doors closing and the floor display climbing, a real governor
and a real guide rail from one Wikimedia photo, the view from a rising glass lift, the doors and numbers again at the
end), each ending in an x-ray scan into the drawing. Trade-off accepted: the wrong model now lands at 8.7 s instead
of ~6 s; it is still broken by 11.5 s (under 12 s), and the first 6 s are the hook the owner asked for.

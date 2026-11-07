# Film 2: the elevator that brakes itself, brief (package first; PLAYBOOK §3a step 1, §13)

**Slug** `elevator-safety` · **Slate** blueprint Video 4, "The Fail-Safe Structural Paradox" (§17.3 item 4) ·
**Length** set by the physics (decision 12) · **Renders** 10 runners (owner, 2026-11-07, decision 16)

## Topic gate (§4.3), 2026-11-07
| Candidate | F | D | P | C | Total | Note |
|---|---|---|---|---|---|---|
| **Elevator safety gear** | 10 | 10 | 9 | 9 | **38** | Everyone rides one and has wondered about the cable. The mechanism is pure geometry (flyweights, a wedge in a taper, a rail). The catch is real: a brake that grabs too hard hurts the people it saves. |
| Bolt preload | 9 | 10 | 9 | 9 | 37 | Strong, but search demand is DIY ("why do bolts loosen") or engineer jargon ("bolt preload"). Next in line. |
| Tires must slip to grip | 10 | 9 | 8 | 9 | 36 | Good; established supply (Donut 1.5 M, "The importance of tire slip" 0.8 M). |
| LED bulbs and the capacitor | 10 | 7 | 9 | 9 | 35 | Big demand, but electronics, less drawable as mechanism; supply 1–2 M views. |
| Self-stable bicycle | 10 | 8 | 9 | 8 | 35 | Veritasium owns it (24.9 M views). |
| Teapot effect | 9 | 9 | 7 | 7 | 32 | Little search; contested science. |
| Single-crystal blade | 5 | 9 | 8 | 9 | 31 | Veritasium's jet-engine film (17 M) sits on it. |
| Rice cooker Curie switch | 9 | 8 | 9 | 6 | 32 | Technology Connections owns it (3.3 M); weak catch. |

**Sourceable:** yes. Lift safety codes (EN 81-20 / ISO 8100, ASME A17.1), manufacturers' safety-gear and governor
datasheets, patents, Otis history, accident reports. Each is checked in step 2.

## Search (`research/demand/`, yt_demand.py, gl=US/GB/IN, 2026-11-07)
- **Main phrase:** *what happens if an elevator cable snaps* (autocomplete in all three markets: "…cable breaks",
  "…an elevator cable snaps", "what if elevator cable breaks"; "lift cable snap" for the UK).
- **Secondary:** how do elevator brakes work · how does elevator safety brake work · can an elevator fall ·
  elevator safety mechanism · elevator emergency brake.
- **The question people ask:** if the cable snaps, what stops the car?
- **The gap:** the top 18 long results are almost all 2025–26 explainers with under 1,600 views each (the best: 1,522).
  Big demand, no good answer. Most stop at "there's a brake that clamps the rails". None that we saw shows *why* it
  can't stop you hard, what sets its grip, or the danger that runs the other way. That's the film.

## The paradox (for the treatment to sharpen)
The brake that saves a falling elevator needs no power, no sensor and no computer: the fall itself sets it. But a brake
that grabbed as hard as it could would injure the people inside, so it is built to slip. And the counterweight that
makes the lift efficient can, in a failure, pull an empty car *up*. All to be confirmed in step 2.

## Title ideas (main phrase first; ≤ 60 characters; no false absolute: lifts have fallen)
1. What Happens If an Elevator Cable Snaps? It Brakes Itself
2. What Happens If an Elevator Cable Snaps? The Rails Catch It
3. What Really Stops a Falling Elevator
4. The Elevator Brake That Only Works When You Fall
5. How a Falling Elevator Stops Without Electricity
6. Why a Falling Elevator Grabs Its Own Rails
7. What Happens If Every Elevator Cable Snaps?
8. The Elevator Brake Built to Slip
9. What Stops a Falling Elevator Isn't the Cable
10. What Happens If an Elevator Cable Snaps? Not What You Think
11. Elevators Are Built to Fear Going Up (only if step 2 confirms the ascending danger)

## Thumbnail concepts (2-element rule, squint test, ≤ 3 words; §13.3)
1. **The bite:** a lit cutaway of the car's corner on its steel guide rail, the wedge biting, a crimson heat field at
   the contact. Words: IT BRAKES ITSELF.
2. **The snap:** the rope's broken ends flying apart above a car, one amber pointer at the rail below. Words: THEN WHAT?
3. **The governor:** the flyweights flung out on their spinning sheave, amber at the latch. Words: TOO FAST.
4. **The wrong way:** an empty car rising, the counterweight dropping, an amber arrow pointing UP. Words: UP, NOT DOWN
   (only if confirmed).
5. **The scar:** a close-up of a guide rail with bright gouge marks a meter long. Words: 1 METER (the real stopping
   distance, once sourced).
6. **The spring:** the wedge and its spring-loaded taper in section, the spring glowing amber. Words: BUILT TO SLIP.

## The promise the first 30 seconds must keep
The cable is gone: what stops the car, with no power and no one at the controls? And why must that brake not stop you
too fast?

# Film 1: visual references (looked at, never shown)

Real photographs and drawings studied so the code-rendered wheelset, rail and bogie read as the real thing. None of
these images appear in the film (zero stock; PLAYBOOK §8.8). Fetched 2026-11-04 from Wikimedia Commons.

| Reference | Licence | What it settled |
|---|---|---|
| [Fairwater Yard delivering wheelsets](https://commons.wikimedia.org/wiki/File:Fairwater_Yard_delivering_wheelsets.JPG) | CC BY-SA 4.0 | Freight wheelset layout: plain axle, journals outboard of the wheels (thinner stub with a collar), hub boss on the inner face, flange on the inside, dished web; a bright polished running band on the tread, the rest dark and weathered |
| [Rail vehicle wheelset (CAD render)](https://commons.wikimedia.org/wiki/File:Rail_vehicle_wheelset.png) | CC0 | Proportions: axle body thinner than the wheel seats, a fillet into each hub, journal about 3/4 of the body diameter, journal length about 1/5 of the wheel diameter |
| [Old Oak Common, class 42 wheelset](https://commons.wikimedia.org/wiki/File:Old_Oak_Common_-_class_42_wheelset.JPG) | CC BY-SA 4.0 | Close look at a tread and flange: the flange is a narrow lip, rounded at its tip; the rim is deep and plain; the polished band sits next to the flange root |

## Dimensions used in the 3D wheelset (drawn, not quoted on screen)
- Rolling radius 500 mm (the textbook wheelset, C10), contact points 1,500 mm apart (b0 750 mm, C04).
- Tread and flange: `profiles.ts` (the same outline the contact solver uses; flange 28 mm, 70° flank).
- Rim about 70 mm deep; web 28 mm thick, dished about 40 mm toward the inner face; hub 270 mm across, 180 mm long.
- Axle: wheel seats 200 mm, body 170 mm, journals 130 mm × 190 mm outboard, with a dust collar.
- Rail: generic flat-bottom, 172 mm tall, 150 mm foot, 64 mm head, crown radius 300 mm, inclined 1:20 (`profiles.ts`).
- Sleepers 2,600 × 250 mm at 600 mm spacing (drawn as thin slate lines, per the treatment).

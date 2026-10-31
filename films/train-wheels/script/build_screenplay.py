"""Build script/screenplay.md from vo.txt + the beat plan below (PLAYBOOK §7.4: every paragraph has a Q).
Run after any VO change: python3 script/build_screenplay.py  (fails if paragraphs and beats don't line up)."""
from pathlib import Path

HERE = Path(__file__).parent
PLAN = [
    ("Paradox stated: solid axle, no steering", "Floating wheelset spins on its axle, lit; a differential gearbox ghost appears and is crossed out (amber); the track draws in under it as a curve", "—", "pen_scratch, relay_click", "How can a train steer with nothing to steer it?"),
    ("Rail race", "SIGNATURE 2. Top view, quarter turn: two contact dots race; the outer rail keeps unrolling a crimson ribbon, +2.36 m; ANY RADIUS stamped", "Δ LENGTH 2.36 m (MODEL)", "whoosh, quartz_tick", "How does one wheel go farther at the same spin?"),
    ("Expectation: slip", "Rigid pair; a ghost of the slipping wheel smears crimson; then the real run: no smear", "SLIP 0.0 %", "metal_jam_sub (soft)", "If it doesn't slip, what is it doing?"),
    ("Promise and open loop", "Wheel cross-section turns slowly; three glyphs flash: cone / screech waveform (a tonal ring, cut short) / wave", "—", "relay_click, glass_tone", "What's special about the shape, and what is that screech?"),
    ("Differential vs solid axle", "A generic car axle with a differential (line art) spins its outer wheel faster; it morphs into a train wheelset: one rigid axle, the wheels pressed on", "ω OUTER = ω INNER", "relay_click", "So what does the train have instead?"),
    ("The flange myth", "Flange highlighted amber; camera dips to the gap between flange and rail on a gentle curve: clear daylight", "FLANGE GAP 7 mm", "quartz_tick", "If not the flanges, then what?"),
    ("The cone revealed", "Macro: tread profile drawn as a line; slope exaggerated with a NOT TO SCALE tag; 1:20 dimension", "TAPER 1:20", "pen_scratch", "Why would a cone help?"),
    ("Self-steering", "Front section: the axle slides outward; the outer contact climbs the cone, the inner drops; two rolling circles of different size drawn in amber", "SHIFT y 0→7 mm · Δr 0→0.70 mm (MODEL)", "glass_tone", "How far does it shift?"),
    ("The cone of the curve", "SIGNATURE 4. Pull up and back: the two rolling circles extend into a long ghost cone whose tip lands exactly on the curve's center, marked on the blueprint", "APEX → CURVE CENTER", "glass_tone", "So how big is the difference?"),
    ("Bank card", "SIGNATURE 1. Dimension lines; a plain unbranded card slides between them and is thicker", "Δr 0.70 mm · CARD 0.76 mm", "quartz_tick", "Is that really all there is?"),
    ("Just geometry", "Hold on the wheelset rolling; the music drops out", "—", "(silence)", "Does it work anywhere else?"),
    ("Self-centering", "Top view, straight track: drift left, the left wheel grows, the axle yaws back; emerald restoring arrow", "SHIFT y ±", "relay_click", "Can it handle any curve?"),
    ("Curve limit", "Curve map: R = 500 m; the required shift (15 mm) grows past the 7 mm gap; crimson overlap", "CURVE R 500 m · NEED 15 mm · HAVE 7 mm (MODEL)", "torque_whine", "So where is the line?"),
    ("About one kilometer", "R slider sweeps; the emerald band (clean rolling) ends at 1,071 m; crimson beyond", "R LIMIT 1,071 m @ 1:20 (MODEL)", "quartz_tick", "What happens past it?"),
    ("Tight curve", "Top view: wheelset yawed (angle of attack), flange pressing; tread contact crimson, sliding sideways", "ANGLE OF ATTACK ↑", "flow_sweep", "Is that the noise?"),
    ("The screech", "Macro of the tread contact: stick/slip pulses; the wheel web rings in a modal shape (ILLUSTRATION)", "—", "squeal ring (synth)", "Can the flange always hold it?"),
    ("Nadal", "Flange-rail contact in section: Y arrow (crimson), Q arrow (cyan); the ratio climbs toward 1; at the limit the wheel lifts (ILLUSTRATION)", "Y/Q → 0.86 (60°, μ 0.35)", "metal_snap_sub", "So the cone is perfect except on tight curves?"),
    ("Twist", "Wheelset on straight track; a tiny nudge", "—", "glass_tone", "How can centering make it sway?"),
    ("Overshoot", "SIGNATURE 3 begins. Top view: the axle's center traces a sine", "—", "pen_scratch", "Has anyone measured this wave?"),
    ("Stephenson and Klingel", "The trace grows to 17.2 m on the grid; L = 2π√(b0 r0/λ) builds term by term; 1821 and 1883 stamps", "λ 17.2 m · 160 km/h · f 2.6 Hz (MODEL)", "quartz_tick", "What happens if you go faster?"),
    ("Critical speed", "Speed passes critical; amplitude grows; flanges strike; crimson stress bloom at the flange root", "SPEED ↑ · AMPLITUDE ↑", "metal_snap_sub x3", "How do fast trains survive it?"),
    ("Flatter cones", "Two tread profiles overlaid: 1:20 vs 1:40 (NOT TO SCALE); bogie springs stiffen (emerald)", "TAPER 1:40", "relay_click", "So which cone is right?"),
    ("Trade-off", "Split: the steep cone takes the tight curve / the flat cone runs calm at speed", "—", "glass_tone", "What does that screech mean now?"),
    ("Landing", "A platform at night in line art, a train on a bend, the screech, the contact glowing crimson", "—", "squeal (distant)", "—"),
    ("Final line", "Pull back: one axle, two wheels, the 1:20 slope as the last amber line; cut to ChannelSting", "—", "sting cues", "—"),
]

paras, chap = [], None
for line in (HERE / "vo.txt").read_text().splitlines():
    if line.startswith("## "):
        chap = line[3:]
    elif line.strip():
        paras.append((chap, line.strip()))
assert len(PLAN) == len(paras), f"{len(paras)} VO paragraphs, {len(PLAN)} beats"
out = ["# Film 1: train wheels, screenplay (lean-in Q column; PLAYBOOK §7.4)", "",
       "Built by `build_screenplay.py` from `vo.txt`. Times are estimates (150 wpm + 1 s a beat); the VO timing "
       "replaces them. Visuals follow the §6 colour meanings.", "",
       "| TIME | CHAPTER | VO | VISUAL | HUD | SFX | Q (what the viewer is holding) |", "|---|---|---|---|---|---|---|"]
t = 0.0
for (chap, vo), (beat, vis, hud, sfx, q) in zip(paras, PLAN):
    m, s = divmod(int(t), 60)
    out.append(f"| {m}:{s:02d} | {chap} | {vo} | **{beat}.** {vis} | {hud} | {sfx} | {q} |")
    t += len(vo.split()) / 2.5 + 1.0
out += ["", f"Estimated length: {int(t) // 60}:{int(t) % 60:02d} before the sting."]
(HERE / "screenplay.md").write_text("\n".join(out) + "\n")
print(f"{len(paras)} beats, about {int(t) // 60}:{int(t) % 60:02d}")

"""Film 3: the seatbelt retractor as a photoreal steel cutaway (ILLUSTRATION of one design, after patents US 4,485,986
and US 6,158,685; claims C03, C04, C21). Built in millimetres × MM (metres), z up, the reel's axis along +y; the camera
looks along +y, so the face plane is x (right) – z (up).

What is where (front to back, y in mm):
  y −6.5 … −2.0  the heavy inertia disc (steel, 33 mm, fine teeth on its rim, three windows), riding loosely on the hub;
                 the car sensor's lever works in this plane, below it
  y −8.0 … 3.0   the reel's hub (white index mark on its face)
  y  0.0 … 3.0   the frame's front plate: a ring of 18 inward ratchet teeth stamped in it (tips 36.8, base 41)
  y  0.3 … 2.7   the sensor arm, pivoted on the reel's lock plate, inside the ring's opening (same plane as the teeth)
  y  3.0 … 4.4   the reel's lock plate (30 mm), which carries the arm's pivot
  y  4.6 … 50.4  the spool: core 16, webbing wound to 25.9 (9 turns × 1.1)
  y 52   … 55    the back plate; the frame's base plate on the left (x −48) bolts to the pillar's inner panel (y 58)

How it locks (the picture's own physics; every number from remotion/model.ts through the shot export):
- the reel turns counter-clockwise on screen as the belt pays out (the belt leaves the spool's right side going up);
- the disc follows the reel loosely; its lag (reel − disc) swings the arm out; at LOCK_LAG the arm's tip sits in a tooth
  gap of the frame's ring and the reel stops;
- the car sensor: a steel ball in a cone (wall drawn at 35°, NOT TO SCALE) under a lever; when the ball climbs, the
  lever's tip rises into the teeth on the DISC's rim and holds the disc still, so the reel's next few degrees are pure
  lag and the same arm locks it ("rotated relative to the inertial disc", P98). The lever never touches the frame's
  ring: a pawl fixed to the frame in teeth fixed to the frame would lock nothing.
Checks run at build: the arm reaches into the gaps only when swung; the lever clears the disc's tips at rest and sits
between them when lifted; the lever rests on the ball (contact, no overlap); the disc clears the frame's teeth.
"""
import math

import bmesh
import bpy
from mathutils import Vector

from common import (MM, bevel, circle_pts, cylinder_y, empty, lin, link, mat, mesh_from_bm, prism_xz, steel,
                    subsurf, webbing)

# ---------------- dimensions (mm), shared with remotion/model.ts REEL ----------------
CORE = 16.0
WEB_T = 1.1
WOUND = 9
RING = 41.0
TEETH = 18
TOOTH_H = 4.2
DISC = 33.0
DISC_TEETH = 40
DISC_TOOTH_H = 2.0
ARM_PIVOT = 24.0
ARM_LEN = 16.0
ARM_REST = math.radians(100)  # arm direction from the pivot, relative to the pivot's radial line: lies along the circle
ARM_OUT = math.radians(25)    # swung: points out between the teeth
ARM_PIVOT_A = math.radians(115)  # pivot's angle on the reel (screen, CCW from +x) at reel angle 0
SPOOL_R = CORE + WOUND * WEB_T
BETA = math.radians(35)       # the cup's wall, drawn (NOT TO SCALE)
BALL_R = 4.5
LEVER_T = 1.1                 # half-thickness of the lever's underside
LEVER_PIVOT = (19.0, -40.5)
LEVER_LEN = 21.5
CUP_X = 8.0
CLIMB_MAX = 2.0               # mm the ball rolls up the wall (along it) at full climb

P = lambda x, z: (x * MM, z * MM)  # noqa: E731


def tooth_ring_outline():
    """The front plate's opening: radius RING with TEETH inward teeth (steep flank first going CCW, then a ramp)."""
    pts = []
    for i in range(TEETH):
        a0 = 2 * math.pi * i / TEETH
        span = 2 * math.pi / TEETH
        steps = 10
        pts.append((RING, a0))
        pts.append((RING - TOOTH_H, a0 + 0.10 * span))  # the steep flank the arm hits
        for k in range(1, steps):
            t = k / steps
            pts.append((RING - TOOTH_H + TOOTH_H * t ** 0.8, a0 + 0.10 * span + 0.88 * span * t))
    return [(r * math.cos(a), r * math.sin(a)) for (r, a) in pts]


def disc_outline():
    """The inertia disc: 40 fine outward teeth on its rim (ramp, then a steep face leading CCW)."""
    pts = []
    r0 = DISC - DISC_TOOTH_H
    for i in range(DISC_TEETH):
        a0 = 2 * math.pi * i / DISC_TEETH
        span = 2 * math.pi / DISC_TEETH
        for k in range(6):
            t = k / 6
            pts.append((r0 + DISC_TOOTH_H * t, a0 + 0.8 * span * t))
        pts.append((DISC, a0 + 0.86 * span))
    return [(r * math.cos(a), r * math.sin(a)) for (r, a) in pts]


def kidney(r0, r1, a0, a1, n=24):
    out = [(r1 * math.cos(a0 + (a1 - a0) * i / n), r1 * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]
    out += [(r0 * math.cos(a1 - (a1 - a0) * i / n), r0 * math.sin(a1 - (a1 - a0) * i / n)) for i in range(n + 1)]
    return out


def mm_pts(pts):
    return [(x * MM, z * MM) for (x, z) in pts]


def arm_tip(swing):
    """Arm tip in the reel's frame (mm, screen coords) for swing 0–1."""
    px, pz = ARM_PIVOT * math.cos(ARM_PIVOT_A), ARM_PIVOT * math.sin(ARM_PIVOT_A)
    d = ARM_PIVOT_A + ARM_REST + (ARM_OUT - ARM_REST) * swing
    return px + ARM_LEN * math.cos(d), pz + ARM_LEN * math.sin(d)


def ball_center(climb):
    """Ball centre (mm) for climb 0–1: at rest in the cone's apex, then rolled up the right-hand wall."""
    apex_z = cup_apex_z()
    s = CLIMB_MAX * climb
    return CUP_X + s * math.cos(BETA), apex_z + BALL_R / math.cos(BETA) + s * math.sin(BETA)


def lever_angle(climb):
    """The lever's angle (rad, screen, about its pivot) at which its underside rests on the ball's top: the ball's centre
    lies BALL_R + LEVER_T below the lever's line (bisection; the lever points left, 120°–210°)."""
    bx, bz = ball_center(climb)
    px, pz = LEVER_PIVOT
    target = BALL_R + LEVER_T

    def below(a):  # distance of the ball's centre below the line, + = below
        dx, dz = math.cos(a), math.sin(a)
        return dx * (bz - pz) - dz * (bx - px)

    lo, hi = math.radians(120), math.radians(210)
    # rotating the lever clockwise on screen (a ↑ from 180° toward the ball side) brings it down onto the ball
    flo = below(lo) - target
    for _ in range(80):
        mid = (lo + hi) / 2
        fm = below(mid) - target
        if (fm > 0) == (flo > 0):
            lo, flo = mid, fm
        else:
            hi = mid
    return (lo + hi) / 2


def lever_tip(climb):
    a = lever_angle(climb)
    return LEVER_PIVOT[0] + LEVER_LEN * math.cos(a), LEVER_PIVOT[1] + LEVER_LEN * math.sin(a)


_APEX = [None]


def cup_apex_z():
    """The cup's height is chosen so the lever's tip rests 2.4 mm below the disc's tooth tips with the ball at rest."""
    if _APEX[0] is not None:
        return _APEX[0]
    lo, hi = -56.0, -47.0  # the range where the lever can rest on the ball (lever 120°–210°)
    for _ in range(80):
        mid = (lo + hi) / 2
        _APEX[0] = mid
        tx, tz = lever_tip(0.0)
        r = math.hypot(tx, tz)
        if r > DISC + 2.4:
            lo = mid
        else:
            hi = mid
    _APEX[0] = (lo + hi) / 2
    return _APEX[0]


def checks():
    def ok(c, msg):
        if not c:
            raise SystemExit(f"retractor check failed: {msg}")

    r_rest = math.hypot(*arm_tip(0))
    r_out = math.hypot(*arm_tip(1))
    ok(r_rest < DISC - 1, f"the folded arm hides behind the disc (tip r {r_rest:.1f})")
    ok(RING - TOOTH_H + 1.0 < r_out < RING - 0.6, f"the swung arm's tip sits in a tooth gap (r {r_out:.1f})")
    ok(DISC + 1.5 < RING - TOOTH_H, "the disc clears the frame's teeth")
    tr0 = math.hypot(*lever_tip(0))
    tr1 = math.hypot(*lever_tip(1))
    ok(DISC + 2.0 < tr0, f"the lever clears the disc's teeth at rest (tip r {tr0:.1f})")
    ok(DISC - DISC_TOOTH_H + 0.2 < tr1 < DISC - 0.6, f"the lifted lever sits between the disc's teeth (tip r {tr1:.1f})")
    for c in (0.0, 0.5, 1.0):
        a = lever_angle(c)
        bx, bz = ball_center(c)
        px, pz = LEVER_PIVOT
        d = math.cos(a) * (bz - pz) - math.sin(a) * (bx - px)
        ok(abs(d - (BALL_R + LEVER_T)) < 0.02, f"the lever rests on the ball at climb {c} (d {d:.2f})")
        # contact point lies between pivot and tip
        t = (bx - px) * math.cos(a) + (bz - pz) * math.sin(a)
        ok(0 < t < LEVER_LEN, "the ball sits under the lever, between pivot and tip")
    print(f"PLATE retractor checks ok: arm r {r_rest:.1f} → {r_out:.1f}; lever tip r {tr0:.1f} → {tr1:.1f}; "
          f"cup apex z {cup_apex_z():.1f}")


class Retractor:
    def __init__(self):
        checks()
        self.STEEL = steel("steel", "#A9B1BA", 0.30)
        self.ZINC = steel("zinc", "#B4BAAE", 0.36, scale=2500, scratch=0.2)  # zinc-plated frame, slightly yellow-grey
        self.DARKSTEEL = steel("darksteel", "#4A525C", 0.38)
        self.POLISH = steel("polish", "#D7DDE3", 0.12, scratch=0.15)
        self.BALL = steel("ball", "#E3E7EC", 0.05, scratch=0.05)
        self.PANEL = mat("panel", "#20262E", 0.0, 0.55, coat=0.3)
        self.PLASTIC = mat("plastic", "#15181D", 0.0, 0.45)
        self.CUP = mat("cup", "#2B3038", 0.0, 0.35)
        self.WHITE = mat("paintW", "#EEF2F5", 0.0, 0.4, emit="#EEF2F5", emit_strength=0.4)
        self.AMBER = mat("paintA", "#FF9F1C", 0.0, 0.4, emit="#FF9F1C", emit_strength=0.8)
        self.WEB = webbing("web", "#2C3138")
        self.root = empty("retractor")
        self.build()

    # ---------------- build ----------------
    def build(self):
        R = self.root
        # the pillar's inner panel behind, with a pressed rib, and the frame's base bolted to it
        prism_xz("panel", mm_pts([(-110, -120), (120, -120), (120, 140), (-110, 140)]), 58 * MM, 61 * MM, self.PANEL, R)
        # frame: front plate (with the toothed opening), back plate, base plate
        plate = [(-48, -66), (40, -66), (46, -60), (46, 48), (38, 56), (-48, 56)]
        hole_m = list(reversed(circle_pts(4.2 * MM, 32, 0, -38 * MM, -56 * MM)))
        self.front = prism_xz("frontplate", mm_pts(plate), 0, 3 * MM, self.ZINC, R,
                              holes=(list(reversed(mm_pts(tooth_ring_outline()))), hole_m))
        bevel(self.front, 0.25 * MM, 2)
        back = prism_xz("backplate", mm_pts(plate), 52 * MM, 55 * MM, self.ZINC, R,
                        holes=(list(reversed(circle_pts(12 * MM, 48))),))
        bevel(back, 0.25 * MM, 2)
        base = bmesh.new()
        bmesh.ops.create_cube(base, size=1)
        for v in base.verts:
            v.co = Vector(((-49.5 + v.co.x * 3) * MM, (27.5 + v.co.y * 55) * MM, (-5 + v.co.z * 122) * MM))
        bevel(mesh_from_bm("baseplate", base, self.ZINC, R), 0.4 * MM)
        # rivets / bolts
        for (x, z) in ((-38, -56), (-38, 46), (36, -58), (36, 48)):
            cylinder_y(f"bolt{x}{z}", 3.2 * MM, -1.6 * MM, 0.2 * MM, self.DARKSTEEL, R, n=32).location = (x * MM, 0, z * MM)
        # top webbing guide (plastic) above the spool's right side
        g = bmesh.new()
        bmesh.ops.create_cube(g, size=1)
        for v in g.verts:
            v.co = Vector(((SPOOL_R + 1) * MM + v.co.x * 8 * MM, 27.5 * MM + v.co.y * 54 * MM, 60 * MM + v.co.z * 5 * MM))
        bevel(mesh_from_bm("guide", g, self.PLASTIC, R), 1.2 * MM)

        # ---- the reel (turns): hub, lock plate, spool core, flanges, wound webbing, arm pivot
        self.reel = empty("reel", R)
        cylinder_y("hub", 10 * MM, -8 * MM, 4 * MM, self.STEEL, self.reel, n=64)
        mk = bmesh.new()
        bmesh.ops.create_cube(mk, size=1)
        for v in mk.verts:
            v.co = Vector(((4.5 + v.co.x * 8.4) * MM, (-8.05 + v.co.y * 0.12) * MM, v.co.z * 2.0 * MM))
        mesh_from_bm("reelmark", mk, self.WHITE, self.reel)
        cylinder_y("lockplate", 30 * MM, 3 * MM, 4.4 * MM, self.STEEL, self.reel, n=128)
        cylinder_y("flangeF", 27 * MM, 4.4 * MM, 4.6 * MM, self.STEEL, self.reel, n=96)
        cylinder_y("flangeB", 27 * MM, 50.4 * MM, 50.6 * MM, self.STEEL, self.reel, n=96)
        self.core = cylinder_y("core", CORE * MM, 4.6 * MM, 50.4 * MM, self.DARKSTEEL, self.reel, n=64, r_in=6 * MM)
        self.wound = self.wound_webbing(self.reel)
        # the torsion bar through the core (seen in the cut spool)
        self.bar = self.torsion_bar(self.reel)
        # the arm: pivot pin on the lock plate, the pawl swinging about it
        px, pz = ARM_PIVOT * math.cos(ARM_PIVOT_A), ARM_PIVOT * math.sin(ARM_PIVOT_A)
        self.armpiv = empty("armpivot", self.reel, (px * MM, 0, pz * MM))
        cylinder_y("armpin", 2.0 * MM, -0.5 * MM, 3.2 * MM, self.POLISH, self.armpiv, n=32)
        self.arm = self.make_arm(self.armpiv)

        # ---- the inertia disc (turns loosely)
        self.disc = empty("disc", R)
        holes = [list(reversed(circle_pts(10.6 * MM, 64)))]
        # a heavy rim on three thin spokes: the windows show the arm and the reel's lock plate behind
        for k in range(3):
            a = math.radians(20 + 120 * k)
            holes.append(list(reversed(mm_pts(kidney(13.5, 26.0, a, a + math.radians(104))))))
        d = prism_xz("discplate", mm_pts(disc_outline()), -6.5 * MM, -2.0 * MM, self.STEEL, self.disc, holes=holes)
        bevel(d, 0.3 * MM, 2)
        am = bmesh.new()
        bmesh.ops.create_cube(am, size=1)
        for v in am.verts:
            v.co = Vector(((19 + v.co.x * 9.5) * MM, (-6.55 + v.co.y * 0.12) * MM, v.co.z * 2.6 * MM))
        mesh_from_bm("discmark", am, self.AMBER, self.disc)

        # ---- the car sensor, below: cup (housing), ball, lever on its pivot
        self.sensor = empty("sensor", R)
        ax, az = CUP_X, cup_apex_z()
        w = 9.5
        h = w * math.tan(BETA)
        cup_out = [(ax - w - 2.5, az - 3.5), (ax + w + 2.5, az - 3.5), (ax + w + 2.5, az + h + 0.8), (ax + w, az + h + 0.8),
                   (ax, az), (ax - w, az + h + 0.8), (ax - w - 2.5, az + h + 0.8)]
        bevel(prism_xz("cup", mm_pts(cup_out), -9.5 * MM, -0.5 * MM, self.CUP, self.sensor), 0.4 * MM)
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=BALL_R * MM)
        self.ball = mesh_from_bm("ball", bm, self.BALL, self.sensor, smooth=True)
        lvp = empty("leverpivot", self.sensor, (LEVER_PIVOT[0] * MM, 0, LEVER_PIVOT[1] * MM))
        cylinder_y("leverpin", 1.8 * MM, -9 * MM, -0.4 * MM, self.POLISH, lvp, n=32)
        self.leverpiv = lvp
        lv = [(0, -LEVER_T), (LEVER_LEN - 1.5, -LEVER_T), (LEVER_LEN, 0.4), (LEVER_LEN - 1.0, 2.0), (2.5, 2.4), (-2.6, 1.4),
              (-2.6, -1.6)]
        # the lever is drawn along +x from its pivot; its underside at −LEVER_T
        bevel(prism_xz("lever", mm_pts(lv), -5.8 * MM, -2.6 * MM, self.DARKSTEEL, lvp), 0.3 * MM)
        # bracket holding the lever's pin to the front plate
        bevel(prism_xz("leverbracket", mm_pts([(15, -46), (24, -46), (24, -36), (15, -36)]), -9.5 * MM, -0.5 * MM,
                       self.ZINC, self.sensor), 0.4 * MM)

        # ---- the belt leaving the spool: from the tangent point up through the guide and out of shot
        self.tail = self.belt_tail(R)

    def wound_webbing(self, parent):
        """The wound belt: a solid of revolution with a faint spiral step, its weave along the turns (UV v = arc mm)."""
        bm = bmesh.new()
        uv = bm.loops.layers.uv.new()
        n = 192
        ys = (4.8, 50.2)
        rings = []
        for i in range(n + 1):
            a = 2 * math.pi * i / n
            r = SPOOL_R - WEB_T * (i / n)  # spiral: one turn's step
            rings.append([bm.verts.new((r * MM * math.cos(a), y * MM, r * MM * math.sin(a))) for y in ys])
        for i in range(n):
            f = bm.faces.new((rings[i][0], rings[i + 1][0], rings[i + 1][1], rings[i][1]))
            for lp, (u, v) in zip(f.loops, ((0, i), (0, i + 1), (1, i + 1), (1, i))):
                lp[uv].uv = (u * 0.046, v / n * 2 * math.pi * SPOOL_R * MM)
        # end faces (the layered edge of the roll)
        for k, y in enumerate(ys):
            vs = [rings[i][k] for i in range(n)]
            c = bm.verts.new((0, y * MM, 0))
            for i in range(n):
                f = bm.faces.new((c, vs[i], vs[(i + 1) % n]) if k == 0 else (c, vs[(i + 1) % n], vs[i]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        ob = mesh_from_bm("wound", bm, self.WEB, parent, smooth=True)
        return ob

    def belt_tail(self, parent):
        bm = bmesh.new()
        uv = bm.loops.layers.uv.new()
        x0, x1 = (SPOOL_R - WEB_T) * MM, SPOOL_R * MM
        z0, z1 = 0.0, 0.45
        ys = (4.8 * MM, 50.2 * MM)
        v = [bm.verts.new(p) for p in ((x1, ys[0], z0), (x1, ys[1], z0), (x1, ys[1], z1), (x1, ys[0], z1))]
        f = bm.faces.new(v)
        for lp, (a, b) in zip(f.loops, ((0, 0), (0.046, 0), (0.046, z1), (0, z1))):
            lp[uv].uv = (a, b)
        ob = mesh_from_bm("tail", bm, self.WEB, parent)
        s = ob.modifiers.new("solid", "SOLIDIFY")
        s.thickness = (x1 - x0)
        return ob

    def torsion_bar(self, parent):
        m = bpy.data.materials.new("barFEA")
        m.use_nodes = True
        nt = m.node_tree
        p = nt.nodes["Principled BSDF"]
        p.inputs["Metallic"].default_value = 1.0
        p.inputs["Roughness"].default_value = 0.25
        p.inputs["Base Color"].default_value = lin("#B8C0C8")
        tw = nt.nodes.new("ShaderNodeValue")
        tw.name = "twist"
        # FEA ramp along the bar's load: navy → cyan → yellow → red (PLAYBOOK: failure is a stress field)
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        cr = ramp.color_ramp
        cr.elements[0].position, cr.elements[0].color = 0.0, lin("#0B1F4D")
        cr.elements[1].position, cr.elements[1].color = 1.0, lin("#FF3B30")
        e = cr.elements.new(0.4)
        e.color = lin("#00E5FF")
        e = cr.elements.new(0.72)
        e.color = lin("#FFE14D")
        nt.links.new(tw.outputs[0], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], p.inputs["Emission Color"])
        es = nt.nodes.new("ShaderNodeMath")
        es.operation = "MULTIPLY"
        es.inputs[1].default_value = 3.0
        nt.links.new(tw.outputs[0], es.inputs[0])
        nt.links.new(es.outputs[0], p.inputs["Emission Strength"])
        ob = cylinder_y("torsionbar", 5.2 * MM, -7.9 * MM, 53 * MM, m, parent, n=48)
        self.BARMAT = m
        return ob

    def make_arm(self, parent):
        """The pawl: a curved steel finger, its root on the pin, drawn along local +x then rotated by the swing."""
        piv = empty("armrot", parent)
        prof = [(-2.6, -2.4), (ARM_LEN - 3.0, -1.8), (ARM_LEN + 0.6, -0.2), (ARM_LEN - 0.4, 1.9), (2.0, 2.6), (-2.6, 2.0)]
        self.ARMMAT = steel("armsteel", "#D7DDE3", 0.14, scratch=0.15)
        bevel(prism_xz("arm", mm_pts(prof), 0.3 * MM, 2.7 * MM, self.ARMMAT, piv), 0.3 * MM)
        return piv

    # ---------------- state ----------------
    def set_state(self, st):
        """st: reel (rad, payout +), disc (rad), arm (0–1), ball (0–1), tilt (rad, the housing rolled), twist (0–1),
        payout (mm: the weave's slide on the tail), cut (bool: the spool cut open to show the bar), show {part: 0/1}."""
        reel = st.get("reel", 0.0)
        disc = st.get("disc", reel)
        self.reel.rotation_euler = (0, -reel, 0)
        self.disc.rotation_euler = (0, -disc, 0)
        swing = st.get("arm", 0.0)
        p = self.ARMMAT.node_tree.nodes["Principled BSDF"]
        p.inputs["Emission Color"].default_value = lin("#FF9F1C")
        p.inputs["Emission Strength"].default_value = 2.5 * st.get("glow", 0.0)
        self.arm.rotation_euler = (0, -(ARM_PIVOT_A + ARM_REST + (ARM_OUT - ARM_REST) * swing), 0)
        c = st.get("ball", 0.0)
        bx, bz = ball_center(c)
        self.ball.location = (bx * MM, -5.0 * MM, bz * MM)
        # the ball rolls (no slip) as it climbs
        self.ball.rotation_euler = (0, CLIMB_MAX * c / BALL_R, 0)
        self.leverpiv.rotation_euler = (0, -lever_angle(c), 0)
        self.root.rotation_euler = (0, -st.get("tilt", 0.0), 0)
        self.BARMAT.node_tree.nodes["twist"].outputs[0].default_value = st.get("twist", 0.0)
        tw = st.get("twist", 0.0)
        self.bar.rotation_euler = (0, -0.25 * tw, 0)
        from common import set_slide
        set_slide(self.WEB, -st.get("payout", 0.0) * MM)  # the weave moves up the tail as the belt pays out
        show = st.get("show", {})
        for name, ob in (("disc", self.disc), ("sensor", self.sensor), ("arm", self.armpiv)):
            v = show.get(name, 1)
            for o in [ob, *ob.children_recursive]:
                o.hide_render = not v
        cut = bool(st.get("cut", False))
        self.core.hide_render = cut
        self.wound.hide_render = cut
        self.bar.hide_render = not cut and not show.get("bar", 0)

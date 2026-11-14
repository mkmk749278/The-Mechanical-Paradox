"""Film 3: the driver's seat, photoreal (owner's review of cut v2, 2026-11-13: "use mostly real clips" for everyday
moments; he chose photoreal 3D where no real clip exists). No person is rendered: people appear only in real clips
(Pixabay driving footage, NHTSA crash films); the renders frame the belt, the D-ring and the pillar, and the belt leaves
the frame toward an unseen shoulder (first cabin test, 2026-11-14: a procedural dummy read as a toy). A left-hand-drive car; metres; x forward, y to the driver's left (door side), z up; the H-point (the
dummy's hip pivot) at the origin.

Materials: the seat and headliner in a woven fabric (Poly Haven jersey_melange, CC0), the steering wheel in grained
leather (fabric_leather_02, CC0), soft-touch plastics for the trim, the belt webbing in woven nylon whose weave slides
with the real payout. The world outside is a CC0 HDRI (autumn_road); sunlight through a passing canopy of leaves throws
moving dapples across the cabin while the car drives.

The belt's path is computed every frame: retractor (low in the B-pillar) → up the pillar → the D-ring → over the
dummy's shoulder → across the chest → the buckle, and buckle → across the lap → the outboard anchor. The payout is the
change in that length, and the weave slides by it, so a lean visibly pulls belt out of the pillar.
"""
import math
import os

import bmesh
import bpy
from mathutils import Matrix, Vector

from common import prism_xz, bevel, empty, lin, link, mat, mesh_from_bm, node_mat, set_slide, subsurf, webbing  # noqa: F401

HERE = os.path.dirname(os.path.abspath(__file__))
CC0 = os.path.join(HERE, "..", "assets", "cc0")

# ---------------- the car, around the H-point (metres) ----------------
FLOOR = -0.36
ROOF = 0.86
PILLAR = Vector((-0.34, 0.40, 0.0))     # the B-pillar trim's inner face, at the driver's left shoulder, behind
DRING = Vector((-0.30, 0.355, 0.66))     # the shoulder belt's guide on the pillar
RETRACTOR = Vector((-0.32, 0.375, -0.22))
BUCKLE = Vector((0.03, -0.215, -0.03))   # inboard of the hip
LAP_ANCHOR = Vector((-0.06, 0.30, -0.13))
WHEEL_C = Vector((0.42, 0.0, 0.33))
WHEEL_TILT = math.radians(24)            # the wheel's plane leans back from vertical
WHEEL_R = 0.185
PHONE = Vector((0.30, -0.52, -0.02))     # on the passenger seat's front edge


def tex_mat(name, stem, tint=None, scale=6.0, normal_strength=0.6, rough_mul=1.0, sheen=0.0):
    """A PBR material from Poly Haven 1k maps (diff, nor_gl, rough), box-projected in object space."""
    m, nt, p = node_mat(name)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])

    def img(kind, colour):
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = bpy.data.images.load(os.path.join(CC0, f"{stem}_{kind}_1k.jpg"), check_existing=True)
        t.image.colorspace_settings.name = "sRGB" if colour else "Non-Color"
        t.projection = "BOX"
        t.projection_blend = 0.25
        nt.links.new(mp.outputs["Vector"], t.inputs["Vector"])
        return t

    d = img("diff", True)
    if tint:
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1.0
        mix.inputs[7].default_value = lin(tint)
        nt.links.new(d.outputs["Color"], mix.inputs[6])
        nt.links.new(mix.outputs[2], p.inputs["Base Color"])
    else:
        nt.links.new(d.outputs["Color"], p.inputs["Base Color"])
    r = img("rough", False)
    if rough_mul != 1.0:
        mm = nt.nodes.new("ShaderNodeMath")
        mm.operation = "MULTIPLY"
        mm.inputs[1].default_value = rough_mul
        nt.links.new(r.outputs["Color"], mm.inputs[0])
        nt.links.new(mm.outputs[0], p.inputs["Roughness"])
    else:
        nt.links.new(r.outputs["Color"], p.inputs["Roughness"])
    n = img("nor_gl", False)
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = normal_strength
    nt.links.new(n.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], p.inputs["Normal"])
    if sheen:
        p.inputs["Sheen Weight"].default_value = sheen
    return m


def soft_plastic(name, base, rough=0.55, grain=1800.0):
    """Moulded interior plastic: a fine grain bump, matte."""
    m, nt, p = node_mat(name)
    p.inputs["Base Color"].default_value = lin(base)
    p.inputs["Roughness"].default_value = rough
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = grain
    nz.inputs["Detail"].default_value = 4
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = 0.08
    nt.links.new(nz.outputs["Fac"], b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return m


def rbox(name, c, size, material, parent=None, r=0.02, levels=2, rot=None):
    """A rounded box (bevel + subdivision): cushions, trims, blocks."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    ob = mesh_from_bm(name, bm, material, parent, smooth=True)
    ob.location = c
    if rot:
        ob.rotation_euler = rot
    bevel(ob, r, 3, math.radians(60))
    subsurf(ob, levels)
    return ob


def ellipsoid(name, c, radii, material, parent=None, seg=40):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * radii[0], v.co.y * radii[1], v.co.z * radii[2]))
    ob = mesh_from_bm(name, bm, material, parent, smooth=True)
    ob.location = c
    return ob


def capsule(name, a, b, r0, r1, material, parent=None, seg=28):
    """A tapered capsule from a to b (world or parent space)."""
    a, b = Vector(a), Vector(b)
    L = (b - a).length
    bm = bmesh.new()
    rings = []
    n_len = 10
    for i in range(n_len + 1):
        t = i / n_len
        r = r0 + (r1 - r0) * t
        rings.append([bm.verts.new((r * math.cos(2 * math.pi * k / seg), r * math.sin(2 * math.pi * k / seg), L * t))
                      for k in range(seg)])
    for i in range(n_len):
        for k in range(seg):
            bm.faces.new((rings[i][k], rings[i][(k + 1) % seg], rings[i + 1][(k + 1) % seg], rings[i + 1][k]))
    for ring, z, r, sgn in ((rings[0], 0.0, r0, -1), (rings[-1], L, r1, 1)):
        prev = ring
        for j in range(1, 5):
            ang = (math.pi / 2) * j / 5
            nr = [bm.verts.new((r * math.cos(ang) * math.cos(2 * math.pi * k / seg),
                                r * math.cos(ang) * math.sin(2 * math.pi * k / seg), z + sgn * r * math.sin(ang)))
                  for k in range(seg)]
            for k in range(seg):
                f = (prev[k], prev[(k + 1) % seg], nr[(k + 1) % seg], nr[k])
                bm.faces.new(f if sgn > 0 else tuple(reversed(f)))
            prev = nr
        tip = bm.verts.new((0, 0, z + sgn * r))
        for k in range(seg):
            f = (prev[k], prev[(k + 1) % seg], tip)
            bm.faces.new(f if sgn > 0 else tuple(reversed(f)))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = mesh_from_bm(name, bm, material, parent, smooth=True)
    ob.matrix_world = Matrix.Translation(a) @ (b - a).normalized().to_track_quat("Z", "Y").to_matrix().to_4x4()
    return ob


class Cabin:
    def __init__(self):
        self.FABRIC = tex_mat("seatfabric", "jersey_melange", tint="#4C525A", scale=7.0, normal_strength=0.9, sheen=0.5)
        self.HEADLINER = tex_mat("headliner", "jersey_melange", tint="#B9B6AE", scale=5.0, normal_strength=0.5, sheen=0.3)
        self.LEATHER = tex_mat("wheelleather", "fabric_leather_02", tint="#3A3A3C", scale=9.0, normal_strength=0.8,
                               rough_mul=0.9)
        self.TRIM = soft_plastic("trim", "#2A2D31", 0.6)
        self.TRIM_LIGHT = soft_plastic("trimlight", "#5E5E5A", 0.55)
        self.DASH = soft_plastic("dash", "#1D1F22", 0.65)
        self.CHROME = mat("chrome", "#D9DEE3", 1.0, 0.12)
        self.BLACKGLOSS = mat("piano", "#0B0C0E", 0.0, 0.08, coat=1.0)
        self.RED = mat("buttonred", "#B3261E", 0.0, 0.35)
        self.GLASS = self.glass()
        self.WEB = webbing("belt", "#585D64")
        self.SCREEN = mat("phonescreen", "#0A0F18", 0.0, 0.05, coat=1.0, emit="#7FA8D8", emit_strength=1.2)
        self.root = empty("car")
        self.build_car()
        self.belt = None
        self.world_setup()

    # ---------------- materials ----------------
    def glass(self):
        """Thin automotive glass: a clear pass-through with a faint tint and a sharp reflection (no refraction: a 4 mm
        pane barely bends light, and full transmission doubled the frame time)."""
        m = bpy.data.materials.new("glass")
        m.use_nodes = True
        nt = m.node_tree
        out = nt.nodes["Material Output"]
        for n in list(nt.nodes):
            if n.name != out.name:
                nt.nodes.remove(n)
        tr = nt.nodes.new("ShaderNodeBsdfTransparent")
        tr.inputs["Color"].default_value = lin("#E6EEEE")
        gl = nt.nodes.new("ShaderNodeBsdfGlossy")
        gl.inputs["Roughness"].default_value = 0.02
        fr = nt.nodes.new("ShaderNodeFresnel")
        fr.inputs["IOR"].default_value = 1.52
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(fr.outputs["Fac"], mix.inputs["Fac"])
        nt.links.new(tr.outputs["BSDF"], mix.inputs[1])
        nt.links.new(gl.outputs["BSDF"], mix.inputs[2])
        nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
        return m

    # ---------------- the world: HDRI sky + moving sun dapples ----------------
    def world_setup(self):
        sc = bpy.context.scene
        w = sc.world
        nt = w.node_tree
        bg = nt.nodes["Background"]
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(os.path.join(CC0, "autumn_road_2k.hdr"), check_existing=True)
        tc = nt.nodes.new("ShaderNodeTexCoord")
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.name = "skymap"
        nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
        nt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
        nt.links.new(env.outputs["Color"], bg.inputs["Color"])
        bg.inputs["Strength"].default_value = 1.0
        self.skymap = mp
        # a low sun from the front left, through a canopy of leaves that slides past (the car driving)
        ld = bpy.data.lights.new("sun", "SUN")
        ld.energy = 4.0
        ld.angle = math.radians(1.2)
        ld.color = lin("#FFE9CC")[:3]
        sun = bpy.data.objects.new("sun", ld)
        link(sun)
        sun.rotation_euler = (math.radians(58), 0, math.radians(-120))
        self.sun = sun
        self.canopy = self.build_canopy()
        from common import area_light
        # daylight bouncing off the dash and the passenger side: the cabin is never a silhouette
        area_light("bounce", (0.55, -0.55, 0.35), (-0.25, 0.3, 0.5), 0.8, 6, "#F2EEE6")
        area_light("roofglow", (0.0, -0.1, 0.82), (-0.2, 0.3, 0.5), 0.5, 2, "#E9EEF2")

    def build_canopy(self):
        """A sheet of leaves above the road, outside the car: a noise mask in a transparent shader, slid along −x by the
        car's speed, so its shadows sweep across the cabin."""
        m = bpy.data.materials.new("canopy")
        m.use_nodes = True
        nt = m.node_tree
        out = nt.nodes["Material Output"]
        for n in list(nt.nodes):
            if n.name != out.name:
                nt.nodes.remove(n)
        tc = nt.nodes.new("ShaderNodeTexCoord")
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.name = "slide"
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = 0.9
        nz.inputs["Detail"].default_value = 6
        nz.inputs["Roughness"].default_value = 0.65
        nt.links.new(mp.outputs["Vector"], nz.inputs["Vector"])
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.47
        ramp.color_ramp.elements[1].position = 0.53
        nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
        tr = nt.nodes.new("ShaderNodeBsdfTransparent")
        df = nt.nodes.new("ShaderNodeBsdfDiffuse")
        df.inputs["Color"].default_value = lin("#1E2A14")
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(ramp.outputs["Color"], mix.inputs["Fac"])
        nt.links.new(df.outputs["BSDF"], mix.inputs[1])
        nt.links.new(tr.outputs["BSDF"], mix.inputs[2])
        nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
        self.CANOPY_MAP = mp
        bm = bmesh.new()
        bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=12.0)
        ob = mesh_from_bm("canopy", bm, m)
        ob.location = (2.0, 6.0, 4.5)
        ob.visible_camera = False
        ob.visible_glossy = False
        return ob

    # ---------------- the car ----------------
    def build_car(self):
        R = self.root
        # floor with carpet-dark trim; the door's inner panel; the sill
        rbox("floor", (0.3, -0.2, FLOOR - 0.03), (2.4, 1.8, 0.06), self.DASH, R, 0.01, 1)
        rbox("door", (0.25, 0.47, 0.02), (1.25, 0.06, 0.62), self.TRIM, R, 0.03)
        rbox("armrest", (0.22, 0.425, 0.12), (0.42, 0.07, 0.06), self.TRIM_LIGHT, R, 0.025)
        rbox("doorpocket", (0.45, 0.43, -0.18), (0.5, 0.05, 0.12), self.TRIM, R, 0.02)
        rbox("doorhandle", (0.42, 0.432, 0.22), (0.11, 0.02, 0.03), self.CHROME, R, 0.01)
        rbox("sill", (0.25, 0.47, FLOOR + 0.04), (1.6, 0.12, 0.14), self.TRIM, R, 0.03)
        # the B-pillar trim from the floor to the roof, its height-adjuster rail and the D-ring
        rbox("bpillar", (PILLAR.x - 0.02, PILLAR.y + 0.05, 0.25), (0.13, 0.1, 1.25), self.TRIM_LIGHT, R, 0.035,
             rot=(math.radians(-6), 0, 0))
        rbox("bpillar_low", (PILLAR.x - 0.02, PILLAR.y + 0.055, -0.22), (0.15, 0.1, 0.3), self.TRIM, R, 0.03)
        rbox("dring_rail", (DRING.x + 0.012, DRING.y + 0.03, DRING.z + 0.04), (0.035, 0.012, 0.16), self.TRIM, R, 0.008)
        # the D-ring: a plastic-covered loop with a slot the belt threads through (outline in x–z, extruded along y)
        def rr(cx, cz, w, h, r, n=10):
            pts = []
            for qx, qz, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180),
                               (w / 2 - r, -h / 2 + r, 270)):
                for k in range(n + 1):
                    a = math.radians(a0 + 90 * k / n)
                    pts.append((cx + qx + r * math.cos(a), cz + qz + r * math.sin(a)))
            return pts
        self.dring = prism_xz("dring", rr(DRING.x, DRING.z, 0.078, 0.036, 0.012), DRING.y - 0.016, DRING.y - 0.004,
                              self.BLACKGLOSS, R, holes=(list(reversed(rr(DRING.x, DRING.z - 0.002, 0.056, 0.010, 0.004))),))
        bevel(self.dring, 0.002, 3)
        rbox("dring_bolt", (DRING.x + 0.01, DRING.y + 0.0, DRING.z + 0.018), (0.016, 0.006, 0.016), self.CHROME, R, 0.004)
        # belt slot at the pillar's lower trim
        rbox("beltslot", (RETRACTOR.x + 0.01, RETRACTOR.y - 0.03, RETRACTOR.z + 0.16), (0.07, 0.012, 0.018),
             self.DASH, R, 0.005)
        # roof / headliner, windscreen, dash, centre console
        rbox("roof", (0.0, 0.0, ROOF + 0.03), (2.2, 1.5, 0.06), self.HEADLINER, R, 0.02, 1)
        self.windscreen = rbox("windscreen", (0.78, -0.2, 0.62), (0.008, 1.5, 0.72), self.GLASS, R, 0.002, 0,
                               rot=(0, math.radians(-58), 0))
        rbox("sidewindow", (0.25, 0.49, 0.6), (1.2, 0.006, 0.42), self.GLASS, R, 0.002, 0)
        rbox("dash", (0.86, -0.2, 0.22), (0.5, 1.6, 0.26), self.DASH, R, 0.06)
        rbox("dashtop", (0.72, -0.2, 0.36), (0.28, 1.6, 0.04), self.DASH, R, 0.02)
        rbox("cluster", (0.66, 0.0, 0.43), (0.12, 0.34, 0.1), self.DASH, R, 0.03)
        rbox("screen", (0.70, -0.38, 0.47), (0.02, 0.26, 0.15), self.BLACKGLOSS, R, 0.01)
        rbox("console", (0.35, -0.38, -0.18), (0.7, 0.2, 0.3), self.TRIM, R, 0.04)
        rbox("console_top", (0.2, -0.38, -0.02), (0.36, 0.18, 0.03), self.TRIM_LIGHT, R, 0.012)
        # the passenger seat (for the phone)
        rbox("pseat", (0.0, -0.75, -0.17), (0.52, 0.5, 0.14), self.FABRIC, R, 0.05)
        rbox("pseat_back", (-0.24, -0.75, 0.2), (0.14, 0.5, 0.62), self.FABRIC, R, 0.05, rot=(0, math.radians(-14), 0))
        # the driver's seat: cushion with side bolsters, backrest, headrest on its posts
        rbox("cushion", (0.06, 0.0, -0.11), (0.52, 0.42, 0.13), self.FABRIC, R, 0.05)
        for s in (-1, 1):
            rbox(f"bolster{s}", (0.06, s * 0.22, -0.06), (0.48, 0.07, 0.12), self.FABRIC, R, 0.04)
        self.seatback = empty("seatback", R, (-0.12, 0.0, -0.06))
        self.seatback.rotation_euler = (0, -math.radians(25), 0)
        rbox("back", (-0.08, 0.0, 0.36), (0.14, 0.48, 0.7), self.FABRIC, self.seatback, 0.06)
        for s in (-1, 1):
            rbox(f"backbolster{s}", (-0.04, s * 0.235, 0.32), (0.16, 0.08, 0.6), self.FABRIC, self.seatback, 0.05)
            capsule(f"post{s}", (-0.06, s * 0.08, 0.68), (-0.06, s * 0.08, 0.8), 0.006, 0.006, self.CHROME,
                    self.seatback)
        rbox("headrest", (-0.05, 0.0, 0.88), (0.12, 0.27, 0.17), self.FABRIC, self.seatback, 0.05)
        # buckle (on its stalk, inboard) and the lap anchor
        rbox("buckle_stalk", (BUCKLE.x - 0.02, BUCKLE.y - 0.01, BUCKLE.z - 0.1), (0.04, 0.02, 0.16), self.DASH, R, 0.01,
             rot=(0, math.radians(25), 0))
        rbox("buckle", (BUCKLE.x, BUCKLE.y, BUCKLE.z), (0.075, 0.03, 0.04), self.BLACKGLOSS, R, 0.012,
             rot=(0, math.radians(25), 0))
        rbox("buckle_btn", (BUCKLE.x + 0.03, BUCKLE.y, BUCKLE.z + 0.016), (0.02, 0.022, 0.012), self.RED, R, 0.004,
             rot=(0, math.radians(25), 0))
        rbox("tongue", (BUCKLE.x - 0.045, BUCKLE.y, BUCKLE.z + 0.02), (0.05, 0.034, 0.006), self.CHROME, R, 0.003,
             rot=(0, math.radians(25), 0))
        rbox("lap_anchor", LAP_ANCHOR + Vector((0, 0.03, 0)), (0.05, 0.02, 0.05), self.CHROME, R, 0.01)
        # steering wheel: rim (leather), three spokes, hub (with the airbag cover)
        self.wheel = empty("wheel", R, WHEEL_C)
        self.wheel.rotation_euler = (0, -(math.pi / 2 - WHEEL_TILT), 0)
        bm = bmesh.new()
        bmesh.ops.create_circle(bm, segments=96, radius=WHEEL_R)
        rim_path = [v.co.copy() for v in bm.verts]
        bm.free()
        rim = bmesh.new()
        seg = 18
        rings = []
        for i, c in enumerate(rim_path):
            rad = c.normalized()
            rings.append([rim.verts.new(c + rad * 0.017 * math.cos(2 * math.pi * k / seg) +
                                        Vector((0, 0, 0.017 * math.sin(2 * math.pi * k / seg)))) for k in range(seg)])
        n = len(rings)
        for i in range(n):
            for k in range(seg):
                rim.faces.new((rings[i][k], rings[i][(k + 1) % seg], rings[(i + 1) % n][(k + 1) % seg],
                               rings[(i + 1) % n][k]))
        bmesh.ops.recalc_face_normals(rim, faces=rim.faces)
        mesh_from_bm("wheelrim", rim, self.LEATHER, self.wheel, smooth=True)
        for a in (0, 180, 270):
            r = math.radians(a)
            capsule(f"spoke{a}", (0, 0, -0.02), (WHEEL_R * 0.9 * math.cos(r), WHEEL_R * 0.9 * math.sin(r), 0), 0.018, 0.012,
                    self.DASH, self.wheel)
        rbox("hub", (0, 0, -0.03), (0.15, 0.13, 0.06), self.DASH, self.wheel, 0.03)
        rbox("column", (0.12, 0, -0.03), (0.2, 0.07, 0.07), self.DASH, self.wheel, 0.03, rot=(0, math.radians(90), 0))
        # the phone, face up on the passenger seat
        self.phone = rbox("phone", PHONE, (0.15, 0.075, 0.009), self.BLACKGLOSS, R, 0.006, 1, rot=(0, 0, math.radians(20)))
        rbox("phonescreen", PHONE + Vector((0, 0, 0.0048)), (0.14, 0.068, 0.0004), self.SCREEN, R, 0.003, 0,
             rot=(0, 0, math.radians(20)))

    # ---------------- the belt ----------------
    def ribbon(self, name, pts, width=0.048, thick=0.0018, normal_hint=None, old=None):
        """A belt ribbon along a polyline (Catmull–Rom smoothed), its face turned toward `normal_hint(p)`."""
        sm = []
        P = [pts[0]] + pts + [pts[-1]]
        for i in range(1, len(P) - 2):
            p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
            n = max(2, int((p2 - p1).length / 0.02))
            for k in range(n):
                t = k / n
                t2, t3 = t * t, t * t * t
                sm.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
                                 (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
        sm.append(pts[-1])
        bm = bmesh.new()
        uv = bm.loops.layers.uv.new()
        left, right, vs = [], [], []
        acc = 0.0
        prev_side = None
        for i, p in enumerate(sm):
            d = (sm[min(i + 1, len(sm) - 1)] - sm[max(i - 1, 0)]).normalized()
            side = d.cross(normal_hint(p) if normal_hint else Vector((1, 0, 0)))
            if side.length < 1e-4:
                side = prev_side or Vector((0, 1, 0))
            side.normalize()
            if prev_side is not None and side.dot(prev_side) < 0:
                side = -side
            prev_side = side
            if i > 0:
                acc += (p - sm[i - 1]).length
            left.append(bm.verts.new(p + side * width / 2))
            right.append(bm.verts.new(p - side * width / 2))
            vs.append(acc)
        for i in range(len(sm) - 1):
            f = bm.faces.new((left[i], right[i], right[i + 1], left[i + 1]))
            for lp, (u, v) in zip(f.loops, ((0, vs[i]), (width, vs[i]), (width, vs[i + 1]), (0, vs[i + 1]))):
                lp[uv].uv = (u, v)
        me = bpy.data.meshes.new(name)
        bm.to_mesh(me)
        bm.free()
        for poly in me.polygons:
            poly.use_smooth = True
        me.materials.append(self.WEB)
        if old is None:
            ob = bpy.data.objects.new(name, me)
            link(ob)
            sl = ob.modifiers.new("solid", "SOLIDIFY")
            sl.thickness = thick
            sl.offset = 0
            return ob
        oldme = old.data
        old.data = me
        bpy.data.meshes.remove(oldme)
        return old

    # ---------------- state ----------------
    def set_state(self, st):
        """st keys (all optional):
        payout: belt paid out of the retractor, mm (from remotion/model.ts: the same number as the HUD) ·
        exit: [x, y, z] where the belt leaves the frame toward the (unseen) occupant's shoulder, before any payout ·
        tremor: belt tension shiver, m (a locked belt hums) · drive: metres travelled (canopy shadows slide) ·
        shake: cabin vibration, m · roll: the car rolled about x, deg · phone: 0/1 · sun: strength multiplier"""
        self.root.rotation_euler = (math.radians(st.get("roll", 0.0)), 0, 0)
        sh = st.get("shake", 0.0)
        self.root.location = (0, 0, sh)
        bpy.context.view_layer.update()
        R = self.root.matrix_world
        payout = st.get("payout", 0.0) / 1000.0
        slot = R @ (RETRACTOR + Vector((0.0, -0.03, 0.17)))
        behind = R @ (DRING + Vector((0.0, 0.004, -0.05)))
        dr = R @ (DRING + Vector((0.0, -0.010, -0.002)))
        front = R @ (DRING + Vector((0.004, -0.022, -0.03)))
        ex0 = R @ Vector(st.get("exit", (0.12, 0.18, 0.40)))
        out = (ex0 - dr).normalized()
        ex = ex0 + out * payout
        mid = front + (ex - front) * 0.5 + Vector((0, 0, -0.004))
        tr = st.get("tremor", 0.0)
        if tr:
            mid += Vector((0, tr, 0))
        path = [slot, slot.lerp(behind, 0.5) + Vector((0.004, 0.004, 0)), behind, dr, front, mid, ex]
        cabin_n = (R.to_3x3() @ Vector((0, -1, 0))).normalized()
        chest_n = (R.to_3x3() @ Vector((1, -0.4, 0.2))).normalized()
        def hint(p):
            # flat against the pillar and through the ring (facing the cabin), then turning gradually to lie on the chest
            if p.z >= front.z - 0.002:
                return cabin_n
            w = max(0.0, min(1.0, (front - p).length / 0.18))
            return cabin_n.lerp(chest_n, w).normalized()
        self.belt = self.ribbon("belt", path, normal_hint=hint, old=self.belt)
        set_slide(self.WEB, -payout)
        self.phone.hide_render = not st.get("phone", 0)
        self.CANOPY_MAP.inputs["Location"].default_value = (st.get("drive", 0.0) / 12.0, 0, 0)
        self.sun.data.energy = 4.0 * st.get("sun", 1.0)

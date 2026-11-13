"""Film 2 re-package (2026-11-13): the car falling in its shaft, a Cycles still for the new thumbnails (PLAYBOOK §13.3).

Why a new plate: BUILT TO SLIP on the calm car earned 0.6% CTR (PLAYBOOK §16). At phone size that car read as a white
box, nothing said "elevator", nothing said "danger", and its glowing gears showed the answer. This plate shows the
moment the viewer is asking about and hides the answer:
- the familiar object, made unmistakable: brushed doors with a warm light spilling from their seam, the crosshead and
  its ropes, the guide rails, painted floor numbers on the shaft wall;
- the danger: the ropes snapped and frayed above the car, their broken upper ends whipping; the camera falls with the
  car, so the shaft streaks past (motion blur) and the floors below drop away into the dark;
- no answer: the safety gears are dark and closed (no heat, no shavings); the question is "how far?", not "how".
An illustration: the car is a plain box, the ropes are drawn thicker than real ones so they read at phone size, the
front wall of the shaft is cut away so the camera can see in. Metres; z up; the camera on +y looking in.

Usage: blender -b --factory-startup -P films/elevator-safety/blender/fall_shot.py -- OUT.png
       [--width 1920] [--samples 128] [--blur 0.5] [--cam x,y,z,tx,ty,tz,lens]
Writes an RGBA PNG (transparent film: the blueprint shows through in Remotion where nothing is drawn).
"""
import argparse
import math
import random
import sys

import bmesh
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--width", type=int, default=1920)
ap.add_argument("--samples", type=int, default=128)
ap.add_argument("--blur", type=float, default=0.5, help="metres the car falls during the shutter (the streak)")
ap.add_argument("--cam", default="")
ap.add_argument("--key", type=float, default=1.0)
a = ap.parse_args(argv)


def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return (*[x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c], 1.0)


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.device = "CPU"
sc.cycles.samples = a.samples
sc.cycles.use_denoising = True
sc.cycles.denoiser = "OPENIMAGEDENOISE"
sc.render.film_transparent = True
sc.render.resolution_x = a.width
sc.render.resolution_y = a.width * 9 // 16
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "AgX"
sc.view_settings.look = "AgX - Punchy"
world = bpy.data.worlds.new("w")
sc.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.010, 0.012, 0.018, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0


def mat(name, base, metal=1.0, rough=0.3, emit=None, emit_strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = lin(base)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    if emit:
        p.inputs["Emission Color"].default_value = lin(emit)
        p.inputs["Emission Strength"].default_value = emit_strength
    return m


def box(name, x0, x1, y0, y1, z0, z1, material, bevel=0.004, parent=None):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector(((x0 + x1) / 2 + v.co.x * (x1 - x0), (y0 + y1) / 2 + v.co.y * (y1 - y0), (z0 + z1) / 2 + v.co.z * (z1 - z0)))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    sc.collection.objects.link(ob)
    ob.data.materials.append(material)
    if bevel:
        b = ob.modifiers.new("bevel", "BEVEL")
        b.width, b.segments = bevel, 2
    if parent:
        ob.parent = parent
    return ob


WALL = mat("wall", "#14181E", 0.0, 0.9)
SIDEWALL = mat("sidewall", "#07090C", 0.0, 0.95)  # the side walls stay nearly black: the shaft reads as a slot
RAIL = mat("rail", "#8E99A4", 1.0, 0.30)
BRACKET = mat("bracket", "#3A4452", 0.7, 0.5)
CARSTEEL = mat("carsteel", "#B4BCC6", 1.0, 0.30)
DARK = mat("dark", "#1C232D", 0.5, 0.5)
ROPE = mat("rope", "#8A939E", 1.0, 0.42)
PAINT = mat("paint", "#E8ECF0", 0.0, 0.6, emit="#E8ECF0", emit_strength=1.2)
WARM = mat("warm", "#FFE2B0", 0.0, 0.5, emit="#FFD08A", emit_strength=18.0)
SILL = mat("sill", "#59636F", 1.0, 0.35)

# ---------------- the shaft (static): the camera falls with the car, so all of this streaks
RX = 0.72          # rail blade tips face the car at x = ±(RX - 0.062)
WX, WY = 1.35, -0.95  # side walls at x = ±WX, back wall at y = WY
Z_LO, Z_HI = -34.0, 12.0
box("backwall", -WX, WX, WY - 0.2, WY, Z_LO, Z_HI, WALL, 0)
for sd in (-1, 1):
    box(f"side{sd}", sd * WX, sd * (WX + 0.2), WY - 0.2, 0.8, Z_LO, Z_HI, SIDEWALL, 0)
    box(f"blade{sd}", sd * (RX - 0.062), sd * RX, -0.008, 0.008, Z_LO, Z_HI, RAIL, 0.001)
    box(f"base{sd}", sd * RX, sd * (RX + 0.010), -0.045, 0.045, Z_LO, Z_HI, RAIL, 0.001)
    z = Z_LO
    while z < Z_HI:  # rail brackets every 2.5 m, back to the side wall
        box(f"brk{sd}{z:.1f}", sd * (RX + 0.010), sd * WX, -0.05, 0.05, z, z + 0.12, BRACKET, 0.003)
        z += 2.5

FLOOR = 3.2
CAR_FLOOR = 7  # the car is passing floor 7 (its floor line at z = 0)
for k in range(-10, 4):
    n = CAR_FLOOR + k
    if n < 1:
        continue
    zf = k * FLOOR
    box(f"sill{n}", -WX, WX, WY, WY + 0.04, zf - 0.06, zf, SILL, 0.002)  # a landing line on the back wall
    cu = bpy.data.curves.new(f"num{n}", "FONT")
    cu.body = str(n)
    cu.size = 0.75
    cu.extrude = 0.004
    cu.align_x = "CENTER"
    ob = bpy.data.objects.new(f"num{n}", cu)
    sc.collection.objects.link(ob)
    ob.data.materials.append(PAINT)
    ob.location = (-1.06, WY + 0.01, zf + 0.35)  # camera on +y: image right is -x
    ob.rotation_euler = (math.pi / 2, 0, math.pi)  # reads left to right from the camera

# ---------------- the car (moving): an empty that falls during the shutter
rig = bpy.data.objects.new("rig", None)
sc.collection.objects.link(rig)
box("car", -0.55, 0.55, -0.70, 0.70, 0.0, 2.30, CARSTEEL, 0.012, rig)
# the front: two brushed door leaves with a lit gap between them (the car's light spilling out)
for sd in (-1, 1):
    box(f"leaf{sd}", sd * 0.03, sd * 0.45, 0.70, 0.715, 0.06, 2.16, CARSTEEL, 0.004, rig)
box("doorlight", -0.03, 0.03, 0.69, 0.705, 0.06, 2.16, WARM, 0, rig)
box("doorframe_l", -0.48, -0.45, 0.70, 0.725, 0.04, 2.20, DARK, 0, rig)
box("doorframe_r", 0.45, 0.48, 0.70, 0.725, 0.04, 2.20, DARK, 0, rig)
box("doorframe_t", -0.48, 0.48, 0.70, 0.725, 2.16, 2.20, DARK, 0, rig)
box("lightband", -0.55, 0.55, 0.70, 0.704, 2.25, 2.27, WARM, 0, rig)
box("toe", -0.55, 0.55, 0.70, 0.74, -0.02, 0.04, DARK, 0, rig)
for sd in (-1, 1):
    box(f"stile{sd}", sd * 0.565, sd * 0.62, -0.05, 0.05, -0.32, 2.55, DARK, 0.004, rig)
    xb = RX - 0.062
    # the safety gears: closed and dark (the answer stays hidden)
    box(f"gear{sd}", sd * (xb - 0.05), sd * (RX - 0.002), -0.055, 0.055, -0.34, -0.10, DARK, 0.004, rig)
    for zz in (2.30, -0.20):  # guide shoes
        box(f"shoe{sd}{zz}", sd * (xb - 0.04), sd * (RX - 0.002), -0.04, 0.04, zz, zz + 0.14, DARK, 0.003, rig)
box("crosshead", -0.64, 0.64, -0.06, 0.06, 2.45, 2.58, DARK, 0.004, rig)
box("plank", -0.64, 0.64, -0.08, 0.08, -0.36, -0.24, DARK, 0.004, rig)
bpy.ops.object.light_add(type="POINT", location=(0, 1.6, 0.6))  # the spill from the door seam
spill = bpy.context.object
spill.data.energy, spill.data.color, spill.data.shadow_soft_size = 6 * a.key, (1.0, 0.78, 0.5), 0.05
spill.parent = rig

ROPE_R = 0.022  # drawn thick so it reads at phone size (a real rope is about 10–13 mm)
rnd = random.Random(11)


def tube(name, pts, r, parent=None):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = r
    cu.bevel_resolution = 4
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    ob = bpy.data.objects.new(name, cu)
    sc.collection.objects.link(ob)
    ob.data.materials.append(ROPE)
    if parent:
        ob.parent = parent
    return ob


def fray(p, d, parent=None):
    """Splayed strands at a broken end p, opening along direction d (unit)."""
    d = Vector(d).normalized()
    side = d.orthogonal().normalized()
    for k in range(10):
        ang = k / 10 * 2 * math.pi + rnd.uniform(-0.3, 0.3)
        q = side.copy()
        q.rotate(__import__("mathutils").Quaternion(d, ang))
        L = rnd.uniform(0.08, 0.16)
        spread = rnd.uniform(0.35, 0.9)
        tip = Vector(p) + d * L + q * L * spread
        mid = Vector(p) + d * L * 0.5 + q * L * spread * 0.3
        tube(f"strand{rnd.random():.6f}", [Vector(p), mid, tip], 0.006, parent)


# the stubs left on the car: short, bent, frayed (they move with the car)
for i, xr in enumerate((-0.10, -0.035, 0.035, 0.10)):
    h = 0.32 + rnd.uniform(-0.08, 0.10)
    lean = Vector((rnd.uniform(-0.12, 0.12), rnd.uniform(-0.05, 0.10), 0))
    p0 = Vector((xr, 0, 2.58))
    p1 = p0 + Vector((0, 0, h * 0.55)) + lean * 0.3
    p2 = p0 + Vector((0, 0, h)) + lean
    tube(f"stub{i}", [p0, p1, p2], ROPE_R, rig)
    fray(p2, (p2 - p1), rig)

# the broken upper ends (static, hanging from the machine room): whipping, recoiled upward, frayed at the bottom
for i, xr in enumerate((-0.11, -0.04, 0.04, 0.11)):
    bot = Vector((xr * 1.6 + rnd.uniform(-0.15, 0.15), rnd.uniform(-0.1, 0.25), 3.55 + rnd.uniform(-0.2, 0.3)))
    w = rnd.uniform(0.25, 0.5) * (1 if i % 2 else -1)
    pts = [bot, bot + Vector((w, 0.05, 0.9)), bot + Vector((-w * 0.6, -0.05, 2.0)), Vector((xr, 0, 9.0))]
    tube(f"upper{i}", pts, ROPE_R)
    fray(bot, (bot - pts[1]))

# ---------------- light: a cool key from above-front, a rim from the shaft top, darkness below


def area(name, loc, rot, size, energy, color):
    bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
    l = bpy.context.object
    l.data.size, l.data.energy, l.data.color = size, energy * a.key, color
    return l


area("key", (-1.6, 3.2, 4.2), (math.radians(-48), math.radians(-28), 0), 1.6, 1400, (0.82, 0.9, 1.0))
area("rim", (1.0, -0.6, 5.5), (math.radians(20), math.radians(25), 0), 1.2, 900, (0.7, 0.85, 1.0))
area("fill", (1.8, 2.6, 0.8), (math.radians(-80), math.radians(40), 0), 1.0, 220, (0.7, 0.8, 1.0))

# ---------------- camera: falls with the car (so the car is sharp and the shaft streaks)
cam_data = bpy.data.cameras.new("cam")
cam = bpy.data.objects.new("cam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
loc, target, lens = Vector((0.0, 2.7, 4.1)), Vector((-0.55, 0.0, -0.2)), 14.0
if a.cam:
    v = [float(x) for x in a.cam.split(",")]
    loc, target, lens = Vector(v[:3]), Vector(v[3:6]), v[6]
cam.location = loc
cam_data.lens = lens
d = target - loc
cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
cam.parent = rig

sc.frame_start, sc.frame_end = 1, 2
rig.location = (0, 0, a.blur / 2)
rig.keyframe_insert("location", frame=1)
rig.location = (0, 0, -a.blur / 2)
rig.keyframe_insert("location", frame=2)
for fc in rig.animation_data.action.fcurves if hasattr(rig.animation_data.action, "fcurves") else []:
    for kp in fc.keyframe_points:
        kp.interpolation = "LINEAR"
sc.frame_set(1)
sc.render.use_motion_blur = a.blur > 0
sc.render.motion_blur_shutter = 1.0
sc.cycles.motion_blur_position = "START" if hasattr(sc.cycles, "motion_blur_position") else None

# bloom on what glows, so the door light reads at phone size
sc.use_nodes = True
ct = sc.node_tree
rl = ct.nodes.get("Render Layers") or ct.nodes.new("CompositorNodeRLayers")
comp = ct.nodes.get("Composite") or ct.nodes.new("CompositorNodeComposite")
gl = ct.nodes.new("CompositorNodeGlare")
gl.glare_type = "FOG_GLOW"
gl.quality = "HIGH"
for k, v in (("threshold", 1.0), ("size", 7)):
    if hasattr(gl, k):
        setattr(gl, k, v)
ct.links.new(rl.outputs["Image"], gl.inputs["Image"])
ct.links.new(gl.outputs["Image"], comp.inputs["Image"])
if "Alpha" in comp.inputs:
    ct.links.new(rl.outputs["Alpha"], comp.inputs["Alpha"])

sc.render.filepath = a.out
bpy.ops.render.render(write_still=True)
print("wrote", a.out)

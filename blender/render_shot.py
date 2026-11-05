"""Render one hero shot of a film in Blender Cycles from the JSON that scripts/export_blender_shot.mjs writes.

The meshes, camera and poses come from the film's own picture code (one driver for the plate, the HUD and every
callout); this file only sets the look: Cycles with soft studio lights on the Abyss Black (transparent film, so the
blueprint shows through), brushed and polished steel, rails with a bright running band, a shadow catcher under the track, and motion blur. The blueprint layer (rail edge lines, sleepers, drawn rail paths)
stays live three.js over the plate (plates.tsx), occluded by the same wheelset drawn depth-only: the lines match every
other scene, and Freestyle cost half of each frame (film 1, measured 2026-11-04).

Usage: blender -b --factory-startup -P blender/render_shot.py -- SHOT.json OUT_DIR [--start N] [--end N]
       [--width 1920] [--samples 64] [--threads 0]
Writes OUT_DIR/NNNNN.png (RGBA, frame N of the shot, 0-based) for frames start..end-1.
"""
import argparse
import base64
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("json")
ap.add_argument("out")
ap.add_argument("--start", type=int, default=0)
ap.add_argument("--end", type=int, default=-1)
ap.add_argument("--width", type=int, default=1920)
ap.add_argument("--samples", type=int, default=64)
ap.add_argument("--threads", type=int, default=0)
ap.add_argument("--no-blur", action="store_true", help="diagnostics: no motion blur")
ap.add_argument("--hide", default="", help="diagnostics: comma-separated object name prefixes to hide")
a = ap.parse_args(argv)

data = json.load(open(a.json))
frames = data["frames"]
end = len(frames) if a.end < 0 else min(a.end, len(frames))

# three.js (y up) → Blender (z up): (x, y, z) → (x, −z, y)
C = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
CI = C.inverted()


def v3(p):
    return Vector((p[0], -p[2], p[1]))


def lin(hexstr):
    """sRGB hex → linear RGBA."""
    h = hexstr.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, 1.0)


# ---------------------------------------------------------------- scene
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = a.samples
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.02
scene.cycles.use_denoising = True
scene.cycles.denoiser = "OPENIMAGEDENOISE"
scene.cycles.max_bounces = 4
scene.cycles.diffuse_bounces = 2
scene.cycles.transmission_bounces = 0
scene.cycles.volume_bounces = 0
scene.cycles.use_denoising = True
scene.cycles.denoising_input_passes = "RGB_ALBEDO_NORMAL"
scene.render.use_persistent_data = True  # the scene is synced once, not per frame
scene.cycles.glossy_bounces = 3
scene.cycles.transparent_max_bounces = 8
scene.render.threads_mode = "FIXED" if a.threads else "AUTO"
if a.threads:
    scene.render.threads = a.threads
scene.render.film_transparent = True
scene.render.resolution_x = a.width
scene.render.resolution_y = a.width * 9 // 16
scene.render.resolution_percentage = 100
scene.render.fps = data["fps"]
scene.render.use_motion_blur = not a.no_blur
scene.render.motion_blur_shutter = 0.5  # a 180° shutter
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.color_depth = "8"
scene.view_settings.view_transform = "Standard"
scene.view_settings.look = "None"
scene.view_settings.exposure = 0.0
scene.frame_start = 0
scene.frame_end = len(frames) - 1

# the world: a studio for the steel to reflect (the film is transparent, so the camera never sees it): a dark floor,
# a crisp bright band at the horizon (the long highlight on a turned tread) and a soft ceiling, as three.js's
# RoomEnvironment does for the live layer
world = bpy.data.worlds.new("studio")
scene.world = world
world.use_nodes = True
wn = world.node_tree
bg = wn.nodes["Background"]
tc = wn.nodes.new("ShaderNodeTexCoord")
sepw = wn.nodes.new("ShaderNodeSeparateXYZ")
wn.links.new(tc.outputs["Generated"], sepw.inputs["Vector"])
ramp = wn.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.interpolation = "EASE"
el = ramp.color_ramp.elements
el[0].position, el[0].color = 0.0, (0.02, 0.022, 0.026, 1)
el[1].position, el[1].color = 1.0, (0.85, 0.88, 0.92, 1)
for pos, val in ((0.40, 0.05), (0.485, 0.14), (0.50, 2.6), (0.515, 0.22), (0.62, 0.26), (0.80, 0.8)):
    e = el.new(pos)
    e.color = (val, val * 1.02, val * 1.06, 1)
mapz = wn.nodes.new("ShaderNodeMapRange")  # z of the view direction, −1…1 → 0…1
mapz.inputs["From Min"].default_value = -1
mapz.inputs["From Max"].default_value = 1
wn.links.new(sepw.outputs["Z"], mapz.inputs["Value"])
wn.links.new(mapz.outputs["Result"], ramp.inputs["Fac"])
# two tall softboxes (left and right of the set) added over the dome: shaped reflections on the flat webs
box = wn.nodes.new("ShaderNodeMath")
box.operation = "ADD"
def softbox(cx, half):
    sepx = sepw.outputs["X"]
    d = wn.nodes.new("ShaderNodeMath")
    d.operation = "SUBTRACT"
    d.inputs[1].default_value = cx
    wn.links.new(sepx, d.inputs[0])
    ab = wn.nodes.new("ShaderNodeMath")
    ab.operation = "ABSOLUTE"
    wn.links.new(d.outputs[0], ab.inputs[0])
    sm = wn.nodes.new("ShaderNodeMapRange")
    sm.interpolation_type = "SMOOTHSTEP"
    sm.inputs["From Min"].default_value = half
    sm.inputs["From Max"].default_value = half * 0.6
    wn.links.new(ab.outputs[0], sm.inputs["Value"])
    up = wn.nodes.new("ShaderNodeMapRange")  # only above the horizon
    up.inputs["From Min"].default_value = 0.0
    up.inputs["From Max"].default_value = 0.15
    wn.links.new(sepw.outputs["Z"], up.inputs["Value"])
    m = wn.nodes.new("ShaderNodeMath")
    m.operation = "MULTIPLY"
    wn.links.new(sm.outputs["Result"], m.inputs[0])
    wn.links.new(up.outputs["Result"], m.inputs[1])
    return m.outputs[0]
wn.links.new(softbox(0.75, 0.18), box.inputs[0])
wn.links.new(softbox(-0.7, 0.12), box.inputs[1])
gain = wn.nodes.new("ShaderNodeMath")
gain.operation = "MULTIPLY"
gain.inputs[1].default_value = 2.2
wn.links.new(box.outputs[0], gain.inputs[0])
addc = wn.nodes.new("ShaderNodeMix")
addc.data_type = "RGBA"
addc.blend_type = "ADD"
addc.inputs["Factor"].default_value = 1.0
wn.links.new(ramp.outputs["Color"], addc.inputs["A"])
cg = wn.nodes.new("ShaderNodeCombineColor")
for k in ("Red", "Green", "Blue"):
    wn.links.new(gain.outputs[0], cg.inputs[k])
wn.links.new(cg.outputs[0], addc.inputs["B"])
wn.links.new(addc.outputs["Result"], bg.inputs["Color"])
bg.inputs["Strength"].default_value = 1.0


# ---------------------------------------------------------------- materials
def principled(name, base, metal, rough, aniso=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = lin(base)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    if aniso:
        p.inputs["Anisotropic"].default_value = aniso
    return m, p


def turned(m, p, base, rough):
    """A turned steel surface: fine concentric lathe rings round the axle axis (in the roughness), a faint tonal drift,
    and one white service mark on the web, so a turning wheel visibly turns (as the three.js layer's paint dab)."""
    nt = m.node_tree
    tc = nt.nodes.new("ShaderNodeTexCoord")
    rings = nt.nodes.new("ShaderNodeTexWave")
    rings.wave_type = "RINGS"
    rings.rings_direction = "X"
    rings.inputs["Scale"].default_value = 60.0
    rings.inputs["Distortion"].default_value = 0.4
    rings.inputs["Detail"].default_value = 2.0
    nt.links.new(tc.outputs["Object"], rings.inputs["Vector"])
    rr = nt.nodes.new("ShaderNodeMapRange")
    rr.inputs["To Min"].default_value = rough - 0.1
    rr.inputs["To Max"].default_value = rough + 0.1
    nt.links.new(rings.outputs["Fac"], rr.inputs["Value"])
    nt.links.new(rr.outputs["Result"], p.inputs["Roughness"])
    bump = nt.nodes.new("ShaderNodeBump")  # the rings catch the light
    bump.inputs["Strength"].default_value = 0.12
    bump.inputs["Distance"].default_value = 0.0004
    nt.links.new(rings.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3.0
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    tone = nt.nodes.new("ShaderNodeMix")
    tone.data_type = "RGBA"
    tone.inputs["A"].default_value = lin(base)
    tone.inputs["B"].default_value = tuple(c * 0.8 for c in lin(base)[:3]) + (1.0,)
    fac = nt.nodes.new("ShaderNodeMath")
    fac.operation = "MULTIPLY"
    fac.inputs[1].default_value = 0.35
    nt.links.new(noise.outputs["Fac"], fac.inputs[0])
    nt.links.new(fac.outputs[0], tone.inputs["Factor"])
    # the service mark: a short radial stroke of white paint on the web (radius 0.30–0.37 m, a 3° wedge)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    ang = nt.nodes.new("ShaderNodeMath")
    ang.operation = "ARCTAN2"
    nt.links.new(sep.outputs["Z"], ang.inputs[0])
    nt.links.new(sep.outputs["Y"], ang.inputs[1])
    yy = nt.nodes.new("ShaderNodeVectorMath")
    yy.operation = "LENGTH"
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(sep.outputs["Y"], comb.inputs["Y"])
    nt.links.new(sep.outputs["Z"], comb.inputs["Z"])
    nt.links.new(comb.outputs[0], yy.inputs[0])

    def window(src, lo, hi):
        a1 = nt.nodes.new("ShaderNodeMath")
        a1.operation = "GREATER_THAN"
        a1.inputs[1].default_value = lo
        nt.links.new(src, a1.inputs[0])
        a2 = nt.nodes.new("ShaderNodeMath")
        a2.operation = "LESS_THAN"
        a2.inputs[1].default_value = hi
        nt.links.new(src, a2.inputs[0])
        mm = nt.nodes.new("ShaderNodeMath")
        mm.operation = "MULTIPLY"
        nt.links.new(a1.outputs[0], mm.inputs[0])
        nt.links.new(a2.outputs[0], mm.inputs[1])
        return mm.outputs[0]

    w1 = window(ang.outputs[0], 0.60, 0.65)
    w2 = window(yy.outputs["Value"], 0.30, 0.37)
    mark = nt.nodes.new("ShaderNodeMath")
    mark.operation = "MULTIPLY"
    nt.links.new(w1, mark.inputs[0])
    nt.links.new(w2, mark.inputs[1])
    paint = nt.nodes.new("ShaderNodeMix")
    paint.data_type = "RGBA"
    nt.links.new(mark.outputs[0], paint.inputs["Factor"])
    nt.links.new(tone.outputs["Result"], paint.inputs["A"])
    paint.inputs["B"].default_value = lin("#E8ECF0")
    nt.links.new(paint.outputs["Result"], p.inputs["Base Color"])
    met = nt.nodes.new("ShaderNodeMapRange")  # the paint is not metal
    met.inputs["To Min"].default_value = p.inputs["Metallic"].default_value
    met.inputs["To Max"].default_value = 0.0
    nt.links.new(mark.outputs[0], met.inputs["Value"])
    nt.links.new(met.outputs["Result"], p.inputs["Metallic"])


mats = {}
m, p = principled("body", "#7A838E", 0.92, 0.3)
turned(m, p, "#7A838E", 0.3)
mats["body"] = (m, p)
mats["band"] = principled("band", "#DCE3EA", 1.0, 0.17, aniso=0.35)
m, p = principled("flange", "#7A838E", 0.92, 0.28)
turned(m, p, "#7A838E", 0.28)
mats["flange"] = (m, p)
mats["axle"] = principled("axle", "#8A95A2", 0.9, 0.3)
mats["journal"] = principled("journal", "#C9D1D9", 1.0, 0.14)

# the rails: dark steel, the running band on the head polished bright by the wheels (where the normal points up)
rail_m, rail_p = principled("rail", "#1A2433", 0.75, 0.42)
nt = rail_m.node_tree
geo = nt.nodes.new("ShaderNodeNewGeometry")
sep = nt.nodes.new("ShaderNodeSeparateXYZ")
nt.links.new(geo.outputs["Normal"], sep.inputs["Vector"])
top = nt.nodes.new("ShaderNodeMapRange")
top.inputs["From Min"].default_value = 0.93
top.inputs["From Max"].default_value = 0.995
nt.links.new(sep.outputs["Z"], top.inputs["Value"])
mixc = nt.nodes.new("ShaderNodeMix")
mixc.data_type = "RGBA"
mixc.inputs["A"].default_value = lin("#1A2433")
mixc.inputs["B"].default_value = lin("#B8C4D0")
nt.links.new(top.outputs["Result"], mixc.inputs["Factor"])
nt.links.new(mixc.outputs["Result"], rail_p.inputs["Base Color"])
mixr = nt.nodes.new("ShaderNodeMapRange")
mixr.inputs["To Min"].default_value = 0.42
mixr.inputs["To Max"].default_value = 0.16
nt.links.new(top.outputs["Result"], mixr.inputs["Value"])
nt.links.new(mixr.outputs["Result"], rail_p.inputs["Roughness"])
rail_p.inputs["Alpha"].default_value = 1.0


# ---------------------------------------------------------------- meshes
def build(name, enc_pos, enc_idx, material, parent=None):
    pos = np.frombuffer(base64.b64decode(enc_pos), dtype=np.float32).reshape(-1, 3)
    idx = np.frombuffer(base64.b64decode(enc_idx), dtype=np.uint32).reshape(-1, 3)
    pos = np.stack([pos[:, 0], -pos[:, 2], pos[:, 1]], axis=1)  # to z up
    me = bpy.data.meshes.new(name)
    me.from_pydata(pos.tolist(), [], idx.tolist())
    me.validate()
    for poly in me.polygons:
        poly.use_smooth = True
    me.materials.append(material)
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    if parent:
        ob.parent = parent
    # keep the lathe's hard edges (tread to flange, chamfers) crisp while the surfaces stay smooth
    me.set_sharp_from_angle(angle=math.radians(35))
    return ob


track_col = bpy.data.collections.new("track")
scene.collection.children.link(track_col)

wheelsets = []
for k in range(data["wheelsets"]):
    root = bpy.data.objects.new(f"wheelset{k}", None)
    root.rotation_mode = "QUATERNION"
    bpy.context.collection.objects.link(root)
    own = {}
    for part in ("band", "flange", "axle"):  # glows are per wheelset
        m = mats[part][0].copy()
        own[part] = (m, m.node_tree.nodes["Principled BSDF"])
    for msh in data["wheelset"]:
        mat = own[msh["material"]][0] if msh["material"] in own else mats[msh["material"]][0]
        build(f"w{k}_{msh['name']}", msh["pos"], msh["idx"], mat, root)
    wheelsets.append((root, own))

rails = []
for r in data["rails"]:
    ob = build(r["name"], r["pos"], r["idx"], rail_m)
    bpy.context.collection.objects.unlink(ob)
    track_col.objects.link(ob)
    rails.append(ob)

# the shadow catcher under the track
bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, -0.193))
catcher = bpy.context.active_object
catcher.is_shadow_catcher = True
catcher.visible_glossy = False

# ---------------------------------------------------------------- light: the channel's key, cool rim and warm under
def area(name, loc_three, power, color, size):
    L = bpy.data.lights.new(name, "AREA")
    L.energy = power
    L.color = lin(color)[:3]
    L.size = size
    ob = bpy.data.objects.new(name, L)
    scene.collection.objects.link(ob)
    ob.location = v3(loc_three) * 1.6
    d = Vector((0, 0, 0.4)) - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return ob


area("key", (3, 5, -2.5), 1300, "#FFFFFF", 3.0)
area("rim", (-4, 1.5, 3), 650, "#9EC9FF", 2.0)
area("under", (0, -3, 2), 60, "#FF9F1C", 2.0)
area("strip", (0.5, 6, 2.5), 300, "#E8EEF5", 6.0)  # a long overhead strip: the tread's highlight


# the edge lights (viewer review of v4, 2026-11-05: the grey steel sank into the Abyss Black in the cold open): two cool
# softboxes kept behind the wheelset, opposite the camera, keyed every frame so they follow the roll and every camera
# move. They draw a thin bright line along the flange crowns, the far wheel's back edge and the axle's top, which
# separates the silhouette from the dark grid. Cool, never amber or cyan: amber is the paradox point (the tread lights
# amber on "the shape of the wheel"), cyan is compression and flow; a backlight carries no meaning, so it stays
# steel-white with a blue cast. No shadows from them (a backlight's shadow would run at the camera across the catcher),
# and the camera never sees the panels.
def edge(name, power, color, size):
    L = bpy.data.lights.new(name, "AREA")
    L.energy = power
    L.color = lin(color)[:3]
    L.size = size
    L.use_shadow = False
    ob = bpy.data.objects.new(name, L)
    ob.rotation_mode = "QUATERNION"
    ob.visible_camera = False
    ob.visible_diffuse = False  # reflections only: the faces keep the key's modelling, the edges get the line
    scene.collection.objects.link(ob)
    return ob


# (light, distance behind, sideways, height above the hub): the high one rims the flange crowns and the far wheel; the
# low one, on the other side, the near wheel's outer edge and the rail heads
# only on shots that ask for them (shots3d.ts SHOTS[...].edgeLights): on the s03 close-up they blew the rail head white
# under the amber tread
EDGES = [
    (edge("edge_high", 1400, "#CFE6FF", 2.4), 3.2, 1.1, 1.7),
    (edge("edge_low", 700, "#B8D4F5", 1.8), 3.0, -1.6, 0.4),
] if data.get("edgeLights") else []

# ---------------------------------------------------------------- camera
cam_data = bpy.data.cameras.new("cam")
cam_data.sensor_fit = "VERTICAL"
cam_data.clip_start = 0.01
cam_data.clip_end = 400
cam = bpy.data.objects.new("cam", cam_data)
cam.rotation_mode = "QUATERNION"
scene.collection.objects.link(cam)
scene.camera = cam

# ---------------------------------------------------------------- keys, one per frame
def key_inputs(node, name, value, frame):
    node.inputs[name].default_value = value
    node.inputs[name].keyframe_insert("default_value", frame=frame)


prev_q = [None] * len(wheelsets)
prev_cq = None
amber, crimson, white = Vector(lin("#FF9F1C")[:3]), Vector(lin("#FF3B30")[:3]), Vector(lin("#F0F4F8")[:3])
steel = Vector(lin("#DCE3EA")[:3])
for fr in frames:
    n = fr["f"]
    # camera: position, aim, vertical field of view
    c = fr["cam"]
    loc, tgt = v3(c["position"]), v3(c["target"])
    q = (tgt - loc).to_track_quat("-Z", "Y")
    if prev_cq is not None and prev_cq.dot(q) < 0:
        q.negate()
    prev_cq = q
    cam.location = loc
    cam.rotation_quaternion = q
    cam.keyframe_insert("location", frame=n)
    cam.keyframe_insert("rotation_quaternion", frame=n)
    cam_data.lens = (cam_data.sensor_height / 2) / math.tan(math.radians(c["fov"]) / 2)
    cam_data.keyframe_insert("lens", frame=n)
    # wheelsets: world matrix from three.js, glows
    for k, (root, own) in enumerate(wheelsets):
        w = fr["wheelsets"][k]
        mt = Matrix([w["m"][i::4] for i in range(4)])  # three.js stores column-major
        mb = C @ mt @ CI
        l, rq, _ = mb.decompose()
        if prev_q[k] is not None and prev_q[k].dot(rq) < 0:
            rq.negate()
        prev_q[k] = rq
        root.location = l
        root.rotation_quaternion = rq
        root.keyframe_insert("location", frame=n)
        root.keyframe_insert("rotation_quaternion", frame=n)
        g, h = w["glow"], w["heat"]
        bp = own["band"][1]
        key_inputs(bp, "Emission Color", (*(amber * g + crimson * h * 1.4), 1.0), n)
        key_inputs(bp, "Emission Strength", 0.7 * min(1.0, g + h), n)
        # a glowing tread tints its own reflections (metal reflects in its base colour): steel → amber or crimson, so
        # the polished band never mirrors the studio in white over the glow (it read as peach)
        tint = (amber * g + crimson * h) / max(1e-6, g + h)
        key_inputs(bp, "Base Color", (*steel.lerp(tint * 0.8, min(1.0, g + h) * 0.9), 1.0), n)
        fp = own["flange"][1]
        key_inputs(fp, "Emission Color", (*amber, 1.0), n)
        key_inputs(fp, "Emission Strength", 1.8 * w["flangeGlow"], n)
        xp = own["axle"][1]
        key_inputs(xp, "Emission Color", (*white, 1.0), n)
        key_inputs(xp, "Emission Strength", 0.9 * w["axleGlow"], n)
    # edge lights: behind the first wheelset as seen from the camera (horizontal), aimed at its hub
    if wheelsets and EDGES:
        hub = wheelsets[0][0].location.copy()  # the axle centre (the root carries the full three.js matrix)
        back = hub - loc
        back.z = 0
        if back.length > 1e-6:
            back.normalize()
            side = back.cross(Vector((0, 0, 1)))
            for ob, dist, sd, up in EDGES:
                ob.location = hub + back * dist + side * sd + Vector((0, 0, up))
                eq = (hub - ob.location).to_track_quat("-Z", "Y")
                ob.rotation_quaternion = eq
                ob.keyframe_insert("location", frame=n)
                ob.keyframe_insert("rotation_quaternion", frame=n)
    # track: rails fade with the drawing; edge lines with it
    t = fr["track"]
    key_inputs(rail_p, "Alpha", t["draw"], n)

# transforms interpolate linearly (motion blur sees the true motion); material keys hold per frame
for ad in [o.animation_data for o in bpy.data.objects if o.animation_data] + [cam_data.animation_data]:
    for fc in ad.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"

# ---------------------------------------------------------------- render
for ob in bpy.data.objects:
    if a.hide and any(ob.name.startswith(h) for h in a.hide.split(",")):
        ob.hide_render = True
os.makedirs(a.out, exist_ok=True)
for n in range(a.start, end):
    target = os.path.join(a.out, f"{n:05d}.png")
    if os.path.exists(target):
        continue
    scene.frame_set(n)
    scene.render.filepath = target + ".tmp.png"
    bpy.ops.render.render(write_still=True)
    os.replace(target + ".tmp.png", target)
    print(f"PLATE {n} done", flush=True)

"""Film 2 thumbnails: the safety gear gripping its guide rail, a Cycles still (PLAYBOOK §13.3, §10.6).

One lit subject (the film's own wedge gear: the T-rail blade, the housing's 8° slots, the two wedges, the disc-spring
stacks) cut open so the wedges show, and one disruptor (heat at the wedge faces and the scrape the car leaves on the
rail above them; the words go on in Remotion, Thumbs.tsx). Proportions from model.ts (8° slot, 3 mm gap closed, the
wedge 22 × 70 mm, the stack behind the jaw); the rail is a T89/B blade (15.88 mm thick, 62 mm tall). It is drawn as
the film draws it, an illustration of the mechanism, not a photograph of a real gear.

Usage: blender -b --factory-startup -P films/elevator-safety/blender/gear_still.py -- OUT.png
       [--shot close|wide] [--width 1920] [--samples 96]
Writes an RGBA PNG (transparent film: the blueprint shows through in Remotion).
"""
import argparse
import math
import sys

import bmesh
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--shot", default="close", choices=["close", "wide", "car"])
ap.add_argument("--width", type=int, default=1920)
ap.add_argument("--samples", type=int, default=96)
ap.add_argument("--cam", default="", help="tuning: x,y,z,tx,ty,tz,lens")
ap.add_argument("--key", type=float, default=25.0)
a = ap.parse_args(argv)

MM = 0.001
T8 = math.tan(math.radians(8))  # the slot's taper (model.ts SLOT_DEG)
BLADE_HALF = 15.88 / 2  # T89/B blade thickness / 2
BLADE_H = 62.0  # blade height (y, toward the car)
BASE_W, BASE_T = 89.0, 10.0
WB, WH = 22.0, 70.0  # wedge foot width, height (Wedge.tsx)
SLOT_TOP = WH + 60
HOUSE_OUT = BLADE_HALF + WB + 46  # the housing's outer face
Y0 = 8.0  # the gear's body starts this far along the blade (it straddles the blade's tip end)
CUT_Y = 34.0  # the cutaway: the near half of the housing is removed above this depth
CLIMB = 12.0  # the wedges have climbed (gripping): they sit this far up their slots


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
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.012, 0.014, 0.02, 1)
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


def hot_face(name, z0, z1, strength):
    """Steel whose emission glows amber→crimson in a band (object z, metres): the heat of the slip at the contact."""
    m = mat(name, "#9AA3AD", 1.0, 0.22)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = z0
    mr.inputs["From Max"].default_value = z1
    nt.links.new(sep.outputs["Z"], mr.inputs["Value"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.0, (0, 0, 0, 1)
    e[1].position, e[1].color = 1.0, (0, 0, 0, 1)
    for pos, col in ((0.15, lin("#FF9F1C")), (0.5, lin("#FFB54A")), (0.85, lin("#E8402A"))):
        x = e.new(pos)
        x.color = col
    nt.links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Emission Color"])
    p.inputs["Emission Strength"].default_value = strength
    return m


STEEL = mat("steel", "#B8C0C8", 1.0, 0.18)
RAIL = mat("rail", "#8E99A4", 1.0, 0.32)
HOUSING = mat("housing", "#2B3442", 0.6, 0.48)
SECTION = mat("section", "#4A5666", 0.3, 0.62)  # the cut faces: flat and matte, a section in a drawing
SPRING = mat("spring", "#7FD8FF", 1.0, 0.25, emit="#2EC4F0", emit_strength=1.6)  # cyan = compression


def hot_section(name):
    """A wedge's cut face: heat from the slip at its contact with the blade (|x| = BLADE_HALF), cooling outward."""
    m = mat(name, "#6B5A48", 0.4, 0.5)
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    ab = nt.nodes.new("ShaderNodeMath")
    ab.operation = "ABSOLUTE"
    nt.links.new(sep.outputs["X"], ab.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = BLADE_HALF * MM
    mr.inputs["From Max"].default_value = (BLADE_HALF + WB) * MM
    nt.links.new(ab.outputs[0], mr.inputs["Value"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.0, lin("#FFD27A")
    e[1].position, e[1].color = 1.0, lin("#7A2A12")
    x = e.new(0.35)
    x.color = lin("#FF9F1C")
    nt.links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Emission Color"])
    p.inputs["Emission Strength"].default_value = 4.0
    return m


def prism(name, outline, y0, y1, material, section_at=None, section_mat=None):
    """Extrude a closed outline in the x–z plane (mm) along y (mm) from y0 to y1."""
    bm = bmesh.new()
    lo = [bm.verts.new((x * MM, y0 * MM, z * MM)) for x, z in outline]
    hi = [bm.verts.new((x * MM, y1 * MM, z * MM)) for x, z in outline]
    f0 = bm.faces.new(lo)
    f1 = bm.faces.new(hi)
    n = len(outline)
    sides = [bm.faces.new((lo[i], lo[(i + 1) % n], hi[(i + 1) % n], hi[i])) for i in range(n)]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    sc.collection.objects.link(ob)
    ob.data.materials.append(material)
    bev = ob.modifiers.new("bevel", "BEVEL")  # edges catch the light
    bev.width = 0.8 * MM
    bev.segments = 3
    bev.limit_method = "ANGLE"
    if section_at is not None:  # the face at y1 is a cut: give it the section material
        ob.data.materials.append(section_mat or SECTION)
        for poly in me.polygons:
            if abs(poly.center.y - section_at * MM) < 1e-6:
                poly.material_index = 1
    return ob


CAR_SHOT = a.shot == "car"
if not CAR_SHOT:
    # ---- the rail: the T-section, vertical (z), long enough to leave the frame
    RZ0, RZ1 = -900.0, 1400.0
    blade = [(-BLADE_HALF, RZ0), (BLADE_HALF, RZ0), (BLADE_HALF, RZ1), (-BLADE_HALF, RZ1)]
    prism("blade", blade, 0.0, BLADE_H, hot_face("blade_hot", (CLIMB - 5) * MM, (CLIMB + WH + 260) * MM, 0.0))
    prism("base", [(-BASE_W / 2, RZ0), (BASE_W / 2, RZ0), (BASE_W / 2, RZ1), (-BASE_W / 2, RZ1)], -BASE_T, 0.0, RAIL)


    # the scrape the car leaves: the gear slides down the rail while it grips, so the blade above the wedges is marked;
    # thin emissive streaks on both blade faces, hottest at the wedges, cooling upward
    def scrape(sd):
        m = hot_face(f"scrape{sd}", (CLIMB + WH + 380) * MM, CLIMB * MM, 7.0)
        for i, (y, w) in enumerate(((14, 3.2), (22, 1.6), (29, 4.0), (37, 2.2), (44, 3.0), (51, 1.4))):
            x = sd * (BLADE_HALF + 0.05)
            prism(f"scr{sd}{i}", [(x, CLIMB + 2), (x + sd * 0.05, CLIMB + 2), (x + sd * 0.05, CLIMB + WH + 380 - i * 40), (x, CLIMB + WH + 380 - i * 40)], y, y + w, m)


    for sd in (-1, 1):
        scrape(sd)


    # ---- one side of the gear, in section: everything nearer the camera than CUT_Y is cut away (a cutaway drawing), so
    # the cheek, the wedge and the bolts show their cut faces; the disc springs sit on a tie bolt between the cheek and the
    # outer plate, pressed by the jaw
    def side(sd):
        xin = lambda z: sd * (BLADE_HALF + WB - z * T8)  # the housing's inclined face, closed on the wedge
        cheek = [(xin(-20), -20), (sd * HOUSE_OUT, -20), (sd * HOUSE_OUT, SLOT_TOP), (xin(SLOT_TOP), SLOT_TOP)]
        prism(f"cheek{sd}", cheek, Y0 - 30, CUT_Y, HOUSING, section_at=CUT_Y)
        # the wedge: inner face on the blade (gap closed), outer face on the 8° slot, climbed CLIMB mm
        z0, z1 = CLIMB, CLIMB + WH
        wedge = [(sd * BLADE_HALF, z0), (xin(z0), z0), (xin(z1), z1), (sd * BLADE_HALF, z1)]
        prism(f"wedge{sd}", wedge, Y0 - 20, CUT_Y, hot_face(f"wedge_hot{sd}", z0 * MM, z1 * MM, 2.2), section_at=CUT_Y,
              section_mat=hot_section(f"wedge_cut{sd}"))
        # two tie bolts through each stack, the outer plate on them
        xo = HOUSE_OUT + 3 + 7 * 3.4 + 2
        for zc in (CLIMB + 14, CLIMB + WH - 14):
            bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=5 * MM, depth=(xo + 40 - HOUSE_OUT) * MM,
                                                location=(sd * (HOUSE_OUT + xo + 40) / 2 * MM, (Y0 + CUT_Y) / 2 * MM, zc * MM),
                                                rotation=(0, math.pi / 2, 0))
            bpy.context.object.data.materials.append(STEEL)
            for i in range(7):  # Belleville discs, alternating, each a shallow cone
                bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=14 * MM, radius2=6 * MM, depth=2.0 * MM,
                                                location=(sd * (HOUSE_OUT + 3 + i * 3.4) * MM, (Y0 + CUT_Y) / 2 * MM, zc * MM),
                                                rotation=(0, math.pi / 2 * (1 if (i % 2) else -1), 0))
                bpy.context.object.data.materials.append(SPRING)
        plate = [(sd * xo, -20), (sd * (xo + 18), -20), (sd * (xo + 18), SLOT_TOP), (sd * xo, SLOT_TOP)]
        prism(f"plate{sd}", plate, Y0 - 30, CUT_Y, HOUSING, section_at=CUT_Y)


    for sd in (-1, 1):
        side(sd)


if CAR_SHOT:
    exec(open(__file__.replace("gear_still.py", "car_shot.py")).read())

KEY = a.key
# ---- lights: a cool key high left, a rim right, warm fill from the contact
def area(name, loc, rot, size, energy, color):
    bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
    l = bpy.context.object
    l.data.size = size
    l.data.energy = energy
    l.data.color = color
    return l


area("key", (-0.35, 0.45, 0.45), (math.radians(-55), math.radians(-30), 0), 0.35, KEY, (0.85, 0.92, 1.0))
area("rim", (0.4, -0.15, 0.35), (math.radians(60), math.radians(45), 0), 0.25, KEY * 0.8, (0.75, 0.88, 1.0))
area("low", (0.05, 0.35, -0.25), (math.radians(-120), 0, 0), 0.4, KEY * 0.25, (0.7, 0.8, 1.0))
bpy.ops.object.light_add(type="POINT", location=(0, 0.06, (CLIMB + WH / 2) * MM))
bpy.context.object.data.energy = 6
bpy.context.object.data.color = (1.0, 0.6, 0.2)

# ---- camera: in front of the cut, a little below, looking up the rail past the gear
cam_data = bpy.data.cameras.new("cam")
cam = bpy.data.objects.new("cam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
if a.shot == "close":
    cam.location = (0.17, 0.30, -0.06)
    target = Vector((0.0, 0.02, 0.06))
    cam_data.lens = 50
else:
    cam.location = (0.32, 0.62, -0.12)
    target = Vector((-0.03, 0.02, 0.12))
    cam_data.lens = 40
if a.cam:
    v = [float(x) for x in a.cam.split(",")]
    cam.location, target, cam_data.lens = Vector(v[:3]), Vector(v[3:6]), v[6]
d = target - cam.location
cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
cam_data.dof.use_dof = True
cam_data.dof.focus_distance = d.length
cam_data.dof.aperture_fstop = 5.6

sc.render.filepath = a.out
bpy.ops.render.render(write_still=True)
print("wrote", a.out)

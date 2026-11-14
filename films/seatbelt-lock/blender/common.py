"""Film 3's photoreal sets (owner's review of cut v2, 2026-11-13; PLAYBOOK §16 "Realism over diagrams"): shared look,
materials and mesh helpers for blender/retractor.py and blender/cabin.py. Units are metres, z up.

Look: Cycles, AgX, a dark studio (near-black backdrop with a soft falloff, so the plate reads as a real object on a
table, not a cut-out), a warm key, a cool rim, a large soft fill. Steel is the real material of the retractor; the
webbing is woven nylon (a weave bump that moves with the belt, so a viewer sees it slide).
"""
import math

import bmesh
import bpy
from mathutils import Vector

MM = 0.001


def lin(h, a=1.0):
    """sRGB hex → linear RGBA."""
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return (*[x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c], a)


def setup_scene(width, samples, fps=30):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.03
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    sc.cycles.denoising_input_passes = "RGB_ALBEDO_NORMAL"
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 2
    sc.cycles.glossy_bounces = 3
    sc.cycles.transmission_bounces = 4
    sc.cycles.transparent_max_bounces = 6
    sc.cycles.volume_bounces = 0
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 1.0
    sc.render.use_persistent_data = True
    sc.render.film_transparent = False
    sc.render.resolution_x = width
    sc.render.resolution_y = width * 9 // 16
    sc.render.fps = fps
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    sc.render.image_settings.compression = 15
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.render.use_motion_blur = True
    sc.render.motion_blur_shutter = 0.5
    w = bpy.data.worlds.new("w")
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = lin("#06080C")
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.6
    return sc


def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    return m, nt, nt.nodes["Principled BSDF"]


def mat(name, base, metal=0.0, rough=0.5, coat=0.0, emit=None, emit_strength=0.0, aniso=0.0):
    m, nt, p = node_mat(name)
    p.inputs["Base Color"].default_value = lin(base)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    p.inputs["Coat Weight"].default_value = coat
    if aniso:
        p.inputs["Anisotropic"].default_value = aniso
    if emit:
        p.inputs["Emission Color"].default_value = lin(emit)
        p.inputs["Emission Strength"].default_value = emit_strength
    return m


def steel(name, base="#9AA3AD", rough=0.28, scale=900.0, scratch=0.25):
    """Stamped / machined steel: a fine noise in roughness and a faint bump, so highlights break up like real metal."""
    m, nt, p = node_mat(name)
    p.inputs["Base Color"].default_value = lin(base)
    p.inputs["Metallic"].default_value = 1.0
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = scale
    nz.inputs["Detail"].default_value = 8
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["To Min"].default_value = rough * (1 - scratch)
    mr.inputs["To Max"].default_value = rough * (1 + scratch)
    nt.links.new(nz.outputs["Fac"], mr.inputs["Value"])
    nt.links.new(mr.outputs["Result"], p.inputs["Roughness"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.05
    bump.inputs["Distance"].default_value = 0.0002
    nt.links.new(nz.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return m


def webbing(name, base="#2A2F36", rows=2600.0):
    """Woven nylon belt webbing: a twill of fine ribs along the belt (UV v = along the belt, in metres × rows).
    The material reads a value node 'slide' (metres) so the weave moves when the belt pays out."""
    m, nt, p = node_mat(name)
    p.inputs["Base Color"].default_value = lin(base)
    p.inputs["Roughness"].default_value = 0.62
    p.inputs["Sheen Weight"].default_value = 0.6
    p.inputs["Sheen Roughness"].default_value = 0.4
    uv = nt.nodes.new("ShaderNodeUVMap")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(uv.outputs["UV"], sep.inputs["Vector"])
    slide = nt.nodes.new("ShaderNodeValue")
    slide.name = "slide"
    slide.outputs[0].default_value = 0.0
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    nt.links.new(sep.outputs["Y"], add.inputs[0])
    nt.links.new(slide.outputs[0], add.inputs[1])
    # twill: diagonal ribs = sin((v + u·0.35)·rows)
    mix = nt.nodes.new("ShaderNodeMath")
    mix.operation = "MULTIPLY_ADD"
    nt.links.new(sep.outputs["X"], mix.inputs[0])
    mix.inputs[1].default_value = 0.35
    nt.links.new(add.outputs[0], mix.inputs[2])
    sc_ = nt.nodes.new("ShaderNodeMath")
    sc_.operation = "MULTIPLY"
    sc_.inputs[1].default_value = rows
    nt.links.new(mix.outputs[0], sc_.inputs[0])
    sn = nt.nodes.new("ShaderNodeMath")
    sn.operation = "SINE"
    nt.links.new(sc_.outputs[0], sn.inputs[0])
    # the edges of the belt: a slightly raised selvedge
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.35
    bump.inputs["Distance"].default_value = 0.0003
    nt.links.new(sn.outputs[0], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    # faint colour variation along the weave
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -1
    mr.inputs["To Min"].default_value = 0.85
    mr.inputs["To Max"].default_value = 1.0
    nt.links.new(sn.outputs[0], mr.inputs["Value"])
    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    mul.inputs[6].default_value = lin(base)
    comb = nt.nodes.new("ShaderNodeCombineColor")
    for k in ("Red", "Green", "Blue"):
        nt.links.new(mr.outputs["Result"], comb.inputs[k])
    nt.links.new(comb.outputs["Color"], mul.inputs[7])
    nt.links.new(mul.outputs[2], p.inputs["Base Color"])
    return m


def set_slide(material, metres):
    material.node_tree.nodes["slide"].outputs[0].default_value = metres


def link(ob, parent=None, material=None):
    bpy.context.scene.collection.objects.link(ob)
    if material is not None:
        ob.data.materials.append(material)
    if parent is not None:
        ob.parent = parent
    return ob


def empty(name, parent=None, loc=(0, 0, 0)):
    e = bpy.data.objects.new(name, None)
    e.location = loc
    return link(e, parent)


def mesh_from_bm(name, bm, material=None, parent=None, smooth=False):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for poly in me.polygons:
            poly.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    return link(ob, parent, material)


def bevel(ob, width, segments=2, angle=math.radians(40)):
    b = ob.modifiers.new("bevel", "BEVEL")
    b.width = width
    b.segments = segments
    b.limit_method = "ANGLE"
    b.angle_limit = angle
    return ob


def subsurf(ob, levels=2):
    s = ob.modifiers.new("sub", "SUBSURF")
    s.levels = levels
    s.render_levels = levels
    return ob


def prism_xz(name, outline, y0, y1, material=None, parent=None, holes=()):
    """Extrude a closed outline drawn in the x–z plane (metres) from y0 to y1. `holes` are further outlines cut through.
    Built as a face with holes via bmesh triangle fill, so stamped plates and toothed rings come out clean."""
    bm = bmesh.new()
    loops = [outline, *holes]
    edges = []
    for lp in loops:
        vs = [bm.verts.new((x, y0, z)) for (x, z) in lp]
        for i in range(len(vs)):
            edges.append(bm.edges.new((vs[i], vs[(i + 1) % len(vs)])))
    bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=True, edges=edges)
    faces = list(bm.faces)
    ext = bmesh.ops.extrude_face_region(bm, geom=faces)
    moved = [g for g in ext["geom"] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=moved, vec=(0, y1 - y0, 0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_from_bm(name, bm, material, parent)


def circle_pts(r, n, a0=0.0, cx=0.0, cz=0.0):
    return [(cx + r * math.cos(a0 + 2 * math.pi * i / n), cz + r * math.sin(a0 + 2 * math.pi * i / n)) for i in range(n)]


def cylinder_y(name, r, y0, y1, material=None, parent=None, n=96, r_in=0.0):
    """A disc / tube along y (the reel axis)."""
    outline = circle_pts(r, n)
    holes = (list(reversed(circle_pts(r_in, n))),) if r_in > 0 else ()
    return prism_xz(name, outline, y0, y1, material, parent, holes)


def area_light(name, loc, target, size, power, color="#FFFFFF", shape="RECTANGLE", size_y=None):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy = power
    ld.color = lin(color)[:3]
    ld.shape = shape
    ld.size = size
    if size_y is not None:
        ld.size_y = size_y
    ob = bpy.data.objects.new(name, ld)
    ob.location = loc
    link(ob)
    look_at(ob, target)
    return ob


def look_at(ob, target, roll=0.0):
    d = Vector(target) - Vector(ob.location)
    q = d.to_track_quat("-Z", "Y")
    ob.rotation_mode = "QUATERNION"
    ob.rotation_quaternion = q
    if roll:
        from mathutils import Quaternion
        ob.rotation_quaternion = q @ Quaternion((0, 0, 1), roll)


def camera(name="cam"):
    cd = bpy.data.cameras.new(name)
    cd.sensor_width = 36
    cd.sensor_fit = "HORIZONTAL"
    cd.clip_start = 0.002
    cd.clip_end = 200
    ob = bpy.data.objects.new(name, cd)
    link(ob)
    bpy.context.scene.camera = ob
    return ob


def set_camera(cam, c):
    """c = {pos:[x,y,z], target:[x,y,z], lens: mm, fstop?: f-number, focus?: metres (default: distance to target),
    roll?: rad}. The same pinhole the Remotion side projects callouts with (shots3d.ts)."""
    cam.location = c["pos"]
    look_at(cam, c["target"], c.get("roll", 0.0))
    cam.data.lens = c["lens"]
    f = c.get("fstop", 0)
    cam.data.dof.use_dof = bool(f)
    if f:
        cam.data.dof.aperture_fstop = f
        cam.data.dof.focus_distance = c.get("focus", (Vector(c["target"]) - Vector(c["pos"])).length)


def backdrop(z0=-0.5, size=40.0, color="#0A0D12", rough=0.85, name="backdrop"):
    """An infinite studio sweep: floor curving up into a wall behind, so light falls off softly instead of a hard edge."""
    bm = bmesh.new()
    n = 24
    prof = []
    R = size * 0.25
    for i in range(n + 1):
        a = (math.pi / 2) * i / n
        prof.append((size * 0.5 + R * math.sin(a) - R, z0 + R - R * math.cos(a)))
    prof = [(-size, z0)] + prof + [(size * 0.5, z0 + size)]
    rows = []
    for (y, z) in prof:
        rows.append([bm.verts.new((x, y, z)) for x in (-size, size)])
    for i in range(len(rows) - 1):
        bm.faces.new((rows[i][0], rows[i][1], rows[i + 1][1], rows[i + 1][0]))
    ob = mesh_from_bm(name, bm, mat(name, color, 0.0, rough), smooth=True)
    return ob

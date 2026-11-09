# The car shot for film 2's thumbnail, run inside gear_still.py (--shot car; same scene, materials and helpers).
# The familiar object (an elevator car in its shaft, its ropes snapped and frayed above it) and the film's answer at
# its lower corners: the safety gears biting the guide rails, hot from the slip, shedding shavings (claim C22: the
# maker's manual, "steel being shaved"), the rail above each gear scraped. Metres; z up, y toward the camera.
# An illustration: the car is a plain box, the gears are drawn as the film draws them, not to a maker's drawing.
import random as _r

RX = 0.72  # rail blade tips face the car at x = ±(RX - 0.062)


def box(name, x0, x1, y0, y1, z0, z1, material, bevel=0.004):
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
    return ob


CARSTEEL = mat("carsteel", "#AEB6BF", 1.0, 0.34)
DARK = mat("dark", "#1C232D", 0.5, 0.5)
ROPE = mat("rope", "#7D8691", 1.0, 0.45)
GLOWLINE = mat("glowline", "#FFFFFF", 0.0, 0.5, emit="#FFE7B8", emit_strength=6.0)
HOT = mat("hot", "#FF9F1C", 0.0, 0.4, emit="#FF9F1C", emit_strength=40.0)
SHAVING = mat("shaving", "#FFB54A", 0.0, 0.4, emit="#FFB54A", emit_strength=60.0)
CYAN = mat("cyanstack", "#7FD8FF", 1.0, 0.25, emit="#2EC4F0", emit_strength=4.0)

# ---- rails: T-sections, blades facing the car, scraped above each gear
for sd in (-1, 1):
    box(f"blade{sd}", sd * (RX - 0.062), sd * RX, -0.008, 0.008, -2.5, 5.0, RAIL, 0.001)
    box(f"base{sd}", sd * RX, sd * (RX + 0.010), -0.045, 0.045, -2.5, 5.0, RAIL, 0.001)
    sm = hot_face(f"railscrape{sd}", 1.9, -0.06, 9.0)
    for k, (y0, w) in enumerate(((0.0086, 0.0), (-0.0086, 0.0))):
        for j, zz in enumerate((-0.04, -0.02, 0.0)):  # streaks on both blade faces
            fy = 0.0081 if k == 0 else -0.0081
            box(f"scr{sd}{k}{j}", sd * (RX - 0.060 + j * 0.016), sd * (RX - 0.056 + j * 0.016), fy - 0.0003, fy + 0.0003, -0.06, 1.9 - j * 0.35, sm, 0)

# ---- the car and its sling
box("car", -0.55, 0.55, -0.70, 0.70, 0.0, 2.30, CARSTEEL, 0.012)
box("seam", -0.004, 0.004, 0.70, 0.705, 0.08, 2.18, DARK, 0)  # the door seam on the front
box("doorframe_l", -0.47, -0.45, 0.70, 0.71, 0.05, 2.20, DARK, 0)
box("doorframe_r", 0.45, 0.47, 0.70, 0.71, 0.05, 2.20, DARK, 0)
box("doorframe_t", -0.47, 0.47, 0.70, 0.71, 2.18, 2.20, DARK, 0)
box("lightband", -0.55, 0.55, 0.70, 0.703, 2.24, 2.26, GLOWLINE, 0)  # the car's light, leaking at the top edge
for sd in (-1, 1):
    box(f"stile{sd}", sd * 0.565, sd * 0.62, -0.05, 0.05, -0.32, 2.55, DARK)
box("crosshead", -0.64, 0.64, -0.06, 0.06, 2.45, 2.58, DARK)
box("plank", -0.64, 0.64, -0.08, 0.08, -0.36, -0.24, DARK)

# ---- the safety gears at the bottom of each stile, gripping the blade
for sd in (-1, 1):
    xb = RX - 0.062  # blade tip
    box(f"gearbody{sd}", sd * (xb - 0.05), sd * (RX - 0.002), -0.055, 0.055, -0.34, -0.10, HOUSING)
    for fy in (-1, 1):  # the wedges' hot faces on each side of the blade
        box(f"jaw{sd}{fy}", sd * (xb + 0.002), sd * (RX - 0.004), fy * 0.0084, fy * 0.016, -0.30, -0.14, HOT, 0.001)
        for i in range(5):  # disc springs behind each jaw (cyan = compression)
            bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.022, radius2=0.009, depth=0.004,
                                            location=(sd * (RX - 0.03), fy * (0.06 + i * 0.006), -0.22),
                                            rotation=(math.pi / 2 * (1 if i % 2 else -1), 0, 0))
            bpy.context.object.data.materials.append(CYAN)
    # shavings: short curls flung down and out from the contact (deterministic)
    rnd = _r.Random(7 + sd)
    for i in range(140):
        t = rnd.random()
        z = -0.30 - t * 0.9 - rnd.random() * 0.15
        spread = 0.03 + t * 0.35
        x = sd * (xb + 0.01 + rnd.uniform(-0.2, 1.0) * spread * 0.5)
        y = rnd.uniform(-1, 1) * spread
        L = 0.006 + rnd.random() * 0.012
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.0022, depth=L * 1.6, location=(x, y, z),
                                            rotation=(rnd.uniform(0, math.pi), rnd.uniform(0, math.pi), 0))
        bpy.context.object.data.materials.append(SHAVING)
    bpy.ops.object.light_add(type="POINT", location=(sd * (xb + 0.02), 0.08, -0.22))
    bpy.context.object.data.energy = 60
    bpy.context.object.data.color = (1.0, 0.55, 0.15)
    bpy.context.object.data.shadow_soft_size = 0.02

# ---- the snapped ropes: four from the crosshead hitch, ending in splayed strands just above the car
rnd = _r.Random(3)
for i, xr in enumerate((-0.09, -0.03, 0.03, 0.09)):
    top = 2.95 + rnd.uniform(-0.12, 0.12)
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.007, depth=top - 2.58, location=(xr, 0, (top + 2.58) / 2))
    bpy.context.object.data.materials.append(ROPE)
    for k in range(8):  # the frayed end
        a_ = k / 8 * 2 * math.pi + rnd.uniform(-0.3, 0.3)
        tilt = rnd.uniform(0.25, 0.7)
        L = rnd.uniform(0.04, 0.09)
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.0016, depth=L,
                                            location=(xr + math.cos(a_) * math.sin(tilt) * L / 2, math.sin(a_) * math.sin(tilt) * L / 2, top + math.cos(tilt) * L / 2),
                                            rotation=(-math.sin(a_) * tilt, math.cos(a_) * tilt, 0))
        bpy.context.object.data.materials.append(ROPE)

# ---- lights at shaft scale
def carlight(loc, rot, size, energy, color):
    bpy.ops.object.light_add(type="AREA", location=loc, rotation=rot)
    l = bpy.context.object
    l.data.size, l.data.energy, l.data.color = size, energy, color


carlight((-2.0, 2.5, 3.5), (math.radians(-50), math.radians(-35), 0), 1.5, 900 * a.key / 25, (0.82, 0.9, 1.0))
carlight((2.5, -1.0, 2.5), (math.radians(70), math.radians(60), 0), 1.0, 700 * a.key / 25, (0.7, 0.85, 1.0))
carlight((0.0, 3.0, -2.0), (math.radians(-120), 0, 0), 2.0, 200 * a.key / 25, (0.7, 0.8, 1.0))

# the hot contact seen from outside: the blade glows where the jaws bite, just below and above the gear body
for sd in (-1, 1):
    xb = RX - 0.062
    for z0, z1 in ((-0.38, -0.34), (-0.10, -0.06)):
        for fy in (-1, 1):
            box(f"bite{sd}{z0}{fy}", sd * (xb + 0.001), sd * (RX - 0.012), fy * 0.0082, fy * 0.0095, z0, z1, HOT, 0)

# bloom on what glows (the compositor's glare), so the heat reads at phone size
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

"""Film 3's photoreal plates: render frames of one shot from the JSON that scripts/export_blender_shot.mjs writes from
remotion/blenderExport.ts (one driver for the plate, the HUD and every callout; PLAYBOOK §10.6).

JSON: {"set": "retractor" | "cabin", "fps": 30, "frames": [{"cam": {...}, "state": {...}, "lights"?: {...}}, ...]}
Usage: blender -b --factory-startup -P films/seatbelt-lock/blender/render.py -- SHOT.json OUT_DIR
       [--start N] [--end N] [--width 1920] [--samples 24]
Writes OUT_DIR/NNNNN.png (RGB, frame N of the shot, 0-based) for frames start..end-1, and prints "PLATE n/N s" lines.
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import bpy  # noqa: E402

from common import area_light, camera, set_camera, setup_scene  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("json")
ap.add_argument("out")
ap.add_argument("--start", type=int, default=0)
ap.add_argument("--end", type=int, default=-1)
ap.add_argument("--width", type=int, default=1920)
ap.add_argument("--samples", type=int, default=24)
a = ap.parse_args(argv)

data = json.load(open(a.json))
frames = data["frames"]
end = len(frames) if a.end < 0 else min(a.end, len(frames))
sc = setup_scene(a.width, a.samples, data.get("fps", 30))
cam = camera()

if data["set"] == "retractor":
    from retractor import Retractor
    rig = Retractor()
    # studio: a warm key high left, a cool rim behind right, a broad soft fill from the camera side
    area_light("key", (-0.25, -0.35, 0.30), (0, 0.02, 0), 0.25, 3.0, "#FFE6C8")
    area_light("rim", (0.30, 0.20, 0.25), (0, 0.02, 0), 0.15, 2.4, "#BFD9FF")
    area_light("fill", (0.34, -0.36, 0.14), (0, 0.02, 0), 0.6, 0.6, "#E8EEF5")  # to the side: a mirror-like disc must not reflect it head-on
    area_light("under", (0.05, -0.15, -0.25), (0, 0, -0.04), 0.12, 0.3, "#FFD7A8")
    area_light("side", (0.30, 0.02, -0.12), (0, 0.027, -0.01), 0.15, 1.2, "#F3F6FA")
elif data["set"] == "cabin":
    from cabin import Cabin
    rig = Cabin()
else:
    raise SystemExit(f"unknown set {data['set']}")

os.makedirs(a.out, exist_ok=True)
t_all = time.time()
for n in range(a.start, end):
    fr = frames[n]
    t0 = time.time()
    set_camera(cam, fr["cam"])
    rig.set_state(fr["state"])
    sc.frame_set(n)
    sc.render.filepath = os.path.join(a.out, f"{n:05d}.png")
    bpy.ops.render.render(write_still=True)
    print(f"PLATE {n + 1}/{end} {time.time() - t0:.1f}s", flush=True)
print(f"PLATE done {end - a.start} frames in {time.time() - t_all:.0f}s", flush=True)

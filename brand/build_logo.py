"""Build the channel logo SVGs: the Locked Trio (PLAYBOOK §6.2).

Three equal cycloidal gears, 15 teeth each, mesh in a closed ring. The geometry is real (every mesh is checked to
0.01°), and so is the paradox: three external gears in a ring can never turn, because each one must spin the opposite
way to both of its neighbours (an odd ring). The plates have real thickness and sit in one plane, so the teeth
interleave and nothing overlaps; an over/under "impossible depth" version was tried and dropped (2026-10-31) because
meshing gears cannot overlap, and the brand is "pure scientific truth". The amber glow sits on the mesh where the
motion jams; the delta crosshair marks the void at the centre. Tooth form: radial flanks (rolling circle = half the
pitch radius) and ogival tips, the classic clock-wheel profile.

Writes assets/brand/logo.svg (master, with blueprint construction lines), logo_mark.svg (no construction lines, for
stings and the watermark), avatar.svg (solid white plates for the 98 px profile picture) and favicon.svg (solid, 9 teeth, reads at 16 px).
Run: python3 brand/build_logo.py
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).parent))
from gears import Gear, mesh_error_deg, outline, to_svg_path  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
BRAND = yaml.safe_load((ROOT / "config/brand.yaml").read_text())
C = BRAND["colors"]
OUT = ROOT / "assets/brand"

SQ3 = math.sqrt(3)


def centres(R: float) -> dict[str, tuple[float, float]]:
    """Pitch circles tangent: centres on an equilateral triangle of side 2R, centroid at the origin, apex up."""
    return {"A": (-R, -R / SQ3), "B": (R, -R / SQ3), "C": (0.0, 2 * R / SQ3)}


def circle(cx: float, cy: float, r: float, **attrs: str) -> str:
    a = " ".join(f'{k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    return f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" {a}/>'


def windows(g: Gear, cx: float, cy: float, n: int, spin_deg: float) -> list[list[tuple[float, float]]]:
    """Lightening windows between hub and rim, with n spokes: the wheel crossing of a clock wheel."""
    R = g.pitch_radius
    r_out, r_in = g.root_radius - 0.55 * g.module, 0.36 * R
    spoke = 0.11 * R                                    # spoke width
    shapes = []
    for k in range(n):
        a0 = math.radians(spin_deg) + k * 2 * math.pi / n
        a1 = a0 + 2 * math.pi / n
        da_out, da_in = spoke / 2 / r_out, spoke / 2 / r_in
        pts = []
        steps = 40
        for i in range(steps + 1):
            a = a0 + da_out + (a1 - a0 - 2 * da_out) * i / steps
            pts.append((cx + r_out * math.cos(a), cy + r_out * math.sin(a)))
        for i in range(steps + 1):
            a = a1 - da_in - (a1 - a0 - 2 * da_in) * i / steps
            pts.append((cx + r_in * math.cos(a), cy + r_in * math.sin(a)))
        shapes.append(pts)
    return shapes


def build(size: int, teeth: int, construction: bool, stroke: float, detail: bool, solid: bool = False) -> str:
    """solid=True: white plates on the abyss (profile picture and favicon, where line art turns to mist)."""
    half = size / 2
    # Fit: the farthest tooth tip is |centre| + tip radius = R(2/√3 + 1 + addendum·2/N) from the centroid.
    probe = Gear(teeth, 1.0)
    extent = 2 / SQ3 + probe.tip_radius
    margin = 0.80 if construction else 0.86               # the profile picture is cropped to a circle
    R = half * margin / extent
    cs = centres(R)
    gears = {k: Gear(teeth, R, phase_deg=0.0) for k in cs}
    for a, b in (("A", "B"), ("B", "C"), ("C", "A")):
        err = mesh_error_deg(gears[a], cs[a], gears[b], cs[b])
        assert err < 0.01, f"{a}-{b} mesh off by {err:.3f}°"
    paths = {k: to_svg_path(outline(g, *cs[k]), half, half) for k, g in gears.items()}

    def m(p: tuple[float, float]) -> tuple[float, float]:
        return half + p[0], half - p[1]

    sw = stroke
    out: list[str] = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">',
        "<defs>",
        f'<radialGradient id="glow"><stop offset="0" stop-color="{C["amber"]}" stop-opacity="0.95"/>'
        f'<stop offset="0.35" stop-color="{C["amber"]}" stop-opacity="0.35"/>'
        f'<stop offset="1" stop-color="{C["amber"]}" stop-opacity="0"/></radialGradient>',
        f'<radialGradient id="bgfall" cx="0.5" cy="0.46" r="0.62"><stop offset="0" stop-color="{C["bg_lift"]}"/>'
        f'<stop offset="1" stop-color="{C["bg"]}"/></radialGradient>',
    ]
    clip_r = (gears["A"].tip_radius - gears["A"].root_radius) * (1.15 if solid else 1.9)
    ab = ((cs["A"][0] + cs["B"][0]) / 2, (cs["A"][1] + cs["B"][1]) / 2)   # the mesh where the ring jams
    out.append(f'<clipPath id="clipAB">{circle(*m(ab), clip_r)}</clipPath>')
    out.append("</defs>")
    out.append(f'<rect width="{size}" height="{size}" fill="url(#bgfall)"/>')

    line = C["line"]
    if construction:
        # Blueprint layer: a faint 12-cell grid, pitch circles dashed, centre lines, the pitch triangle.
        step = size / 24
        grid = " ".join(f"M{i * step:.1f},0 V{size}" for i in range(1, 24)) + " " + \
               " ".join(f"M0,{i * step:.1f} H{size}" for i in range(1, 24))
        out.append(f'<path d="{grid}" stroke="{C["grid"]}" stroke-width="{sw * 0.4:.2f}" fill="none"/>')
        for k, g in gears.items():
            x, y = m(cs[k])
            out.append(circle(x, y, g.pitch_radius, fill="none", stroke=C["muted"], stroke_width=f"{sw * 0.35:.2f}",
                              stroke_dasharray=f"{sw * 4:.1f} {sw * 2.5:.1f}", opacity="0.55"))
        tri = " ".join(f"{'M' if i == 0 else 'L'}{m(cs[k])[0]:.2f},{m(cs[k])[1]:.2f}" for i, k in enumerate("ABC")) + " Z"
        out.append(f'<path d="{tri}" fill="none" stroke="{C["muted"]}" stroke-width="{sw * 0.35:.2f}" opacity="0.5"/>')

    plate, side = (C["specular"], C["grid"]) if solid else (C["bg_lift"], C["grid"])
    depth = (0.075 * R if detail else 0.09 * R) * (1 if teeth > 9 else 1.2)   # plate thickness, drawn down-right

    def face(k: str) -> str:
        """Gear outline with the lightening windows cut through (even-odd)."""
        g, (x0, y0) = gears[k], cs[k]
        d = paths[k]
        if detail:
            spin = {"A": 90.0, "B": 90.0, "C": -90.0}[k]   # spokes point at the centroid: the triangle repeats inside
            d += " " + " ".join(to_svg_path(w, half, half) for w in windows(g, x0, y0, 3, spin + 60))
        return d

    # The three gears are solid plates in one plane, so their teeth interleave and nothing overlaps. Depth: the back
    # face (dim line), the side walls (the face stacked back to front), then the front face.
    layers = 8
    out.append("<defs>" + "".join(f'<path id="face{k}" d="{face(k)}" fill-rule="evenodd"/>' for k in "ABC") + "</defs>")
    for i in range(layers, 0, -1):
        off = depth * i / layers
        for k in "ABC":
            stroke_attr = (f'stroke="{line}" stroke-opacity="0.55" stroke-width="{sw * 0.6:.2f}"' if i == layers
                           else 'stroke="none"')
            out.append(f'<use href="#face{k}" transform="translate({off:.1f},{off:.1f})" fill="{side}" {stroke_attr} '
                       f'stroke-linejoin="round"/>')
    for k in "ABC":
        g = gears[k]
        x, y = m(cs[k])
        edge = C["bg"] if solid else line
        out.append(f'<use href="#face{k}" fill="{plate}" stroke="{edge}" stroke-width="{sw:.2f}" '
                   f'stroke-linejoin="round"/>')
        if solid:
            out.append(circle(x, y, (0.20 if detail else 0.30) * g.pitch_radius, fill=C["bg"]))
        elif detail:
            out.append(circle(x, y, 0.16 * g.pitch_radius, fill="none", stroke=line, stroke_width=f"{sw * 0.8:.2f}"))
            out.append(circle(x, y, 0.055 * g.pitch_radius, fill=line))
        else:
            out.append(circle(x, y, 0.30 * g.pitch_radius, fill=C["bg"], stroke=line, stroke_width=f"{sw * 0.85:.2f}"))

    # The jam: amber light where A drives B, the mesh that locks the ring.
    gx, gy = m(ab)
    out.append(circle(gx, gy, clip_r * 1.25, fill="url(#glow)", style="mix-blend-mode:screen"))
    if solid:   # the jammed teeth themselves turn amber
        out.append(f'<g clip-path="url(#clipAB)"><path d="{face("A")} {face("B")}" fill="{C["amber"]}" '
                   f'fill-rule="evenodd" stroke="{C["bg"]}" stroke-width="{sw:.2f}" stroke-linejoin="round"/></g>')
    else:
        out.append(f'<g clip-path="url(#clipAB)"><path d="{paths["A"]}" fill="none" stroke="{C["amber"]}" '
                   f'stroke-width="{sw * 1.05:.2f}" stroke-linejoin="round"/></g>')

    # The delta crosshair in the void at the centre.
    cx, cy = m((0.0, 0.0))
    d = 0.075 * R if detail else 0.10 * R
    tri = " ".join(f"{'M' if i == 0 else 'L'}{cx + d * math.cos(math.radians(90 + 120 * i)):.2f},"
                   f"{cy - d * math.sin(math.radians(90 + 120 * i)):.2f}" for i in range(3)) + " Z"
    if not solid:
        out.append(f'<path d="{tri}" fill="none" stroke="{line}" stroke-width="{sw * 0.8:.2f}" stroke-linejoin="miter"/>')
    if construction:
        t0, t1 = d * 1.5, d * 2.3
        ticks = " ".join(f"M{cx + t0 * math.cos(a):.2f},{cy + t0 * math.sin(a):.2f} "
                         f"L{cx + t1 * math.cos(a):.2f},{cy + t1 * math.sin(a):.2f}"
                         for a in (math.radians(90 + 120 * i) for i in range(3)))
        out.append(f'<path d="{ticks}" stroke="{C["amber"]}" stroke-width="{sw * 0.5:.2f}" opacity="0.9"/>')
    out.append("</svg>")
    return "\n".join(out)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "logo.svg").write_text(build(1024, 15, construction=True, stroke=2.5 * 1024 / 800, detail=True))
    (OUT / "logo_mark.svg").write_text(build(1024, 15, construction=False, stroke=2.5 * 1024 / 800 * 1.25, detail=True))
    (OUT / "avatar.svg").write_text(build(1024, 15, construction=False, stroke=3.0, detail=True, solid=True))
    (OUT / "favicon.svg").write_text(build(64, 9, construction=False, stroke=0.6, detail=False, solid=True))
    print("wrote", ", ".join(p.name for p in sorted(OUT.glob("*.svg"))))


if __name__ == "__main__":
    main()

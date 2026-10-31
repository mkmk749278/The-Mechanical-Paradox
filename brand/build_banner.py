"""Build the channel banner (2560×1440) from code (owner's blueprint §1.2, PLAYBOOK §6.2).

Right side: an exploded isometric cycloidal reduction drive whose geometry is real. The disc profile is the standard
cycloid-drive parametric curve, and the build checks that all 12 ring pins touch it (error under 0.01 units) before
drawing. Every callout is true of the drawing itself (11 lobes, 12 pins, eccentricity e, ratio −11 : 1). The blueprint's
sample callouts (σ_yield = 1,150 MPa and so on) were left out: a stress figure printed on a drive that has no stated
material would be a number without a source (PLAYBOOK §9).

YouTube (Help 10456525, read 2026-10-31): upload at least 2048×1152, 16:9, ≤ 6 MB; the safe area for text and logos
is 1235×338 at that size, so 1546×423 centred at 2560×1440 (x 507-2053, y 508-931). Phones show only the safe area;
desktop shows the full width at the safe height; TVs show everything.

Writes brand/banner/banner.html, then shoot it:
  node scripts/shoot.mjs brand/banner/banner.html assets/brand/banner_2560x1440.png 2560 1440
"""
from __future__ import annotations

import math
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
C = yaml.safe_load((ROOT / "config/brand.yaml").read_text())["colors"]

# Drive geometry (unitless drawing units)
N_PINS, R_PIN_CIRCLE, R_PIN, ECC = 12, 100.0, 7.0, 4.5
LOBES = N_PINS - 1
OUT_PINS, R_OUT_CIRCLE, R_OUT_PIN = 6, 52.0, 9.0
PIN_ROT = math.pi / N_PINS          # pins sit half a pitch round from the disc's first lobe

# Isometric view placement on the banner
CX, CY, S = 1630.0, 790.0, 1.12
FLANGE_SHIFT = (305.0, -40.0)       # the output flange is exploded sideways along a dog-leg (screen px)
COS30 = math.cos(math.radians(30))
_shift = [0.0, 0.0]


def iso(x: float, y: float, z: float) -> tuple[float, float]:
    return CX + _shift[0] + S * (x - y) * COS30, CY + _shift[1] + S * (x + y) * 0.5 - S * z


def disc_profile(samples: int = 1400) -> list[tuple[float, float]]:
    """Cycloid disc outline in disc coordinates (centre at the origin)."""
    pts = []
    for i in range(samples):
        t = 2 * math.pi * i / samples
        a = math.sin((1 - N_PINS) * t)
        b = R_PIN_CIRCLE / (ECC * N_PINS) - math.cos((1 - N_PINS) * t)
        psi = math.atan(a / b)
        pts.append((R_PIN_CIRCLE * math.cos(t) - R_PIN * math.cos(t + psi) - ECC * math.cos(N_PINS * t),
                    -R_PIN_CIRCLE * math.sin(t) + R_PIN * math.sin(t + psi) + ECC * math.sin(N_PINS * t)))
    return pts


DISC = disc_profile()
DISC_OFFSET = (-ECC, 0.0)           # crank at 180°: the disc centre sits e from the axis


def check_geometry() -> None:
    worst = 0.0
    for k in range(N_PINS):
        a = 2 * math.pi * k / N_PINS + PIN_ROT
        px, py = R_PIN_CIRCLE * math.cos(a), R_PIN_CIRCLE * math.sin(a)
        d = min(math.hypot(x + DISC_OFFSET[0] - px, y + DISC_OFFSET[1] - py) for x, y in DISC)
        worst = max(worst, abs(d - R_PIN))
    assert worst < 0.01, f"pins not tangent to the disc: worst error {worst:.3f}"
    radii = [math.hypot(*p) for p in DISC]
    lobes = sum(1 for i in range(len(radii)) if radii[i] > radii[i - 1] and radii[i] >= radii[(i + 1) % len(radii)])
    assert lobes == LOBES, f"disc has {lobes} lobes"


def path(pts3: list[tuple[float, float, float]], close: bool = True) -> str:
    xy = [iso(*p) for p in pts3]
    return " ".join(f"{'M' if i == 0 else 'L'}{x:.1f},{y:.1f}" for i, (x, y) in enumerate(xy)) + (" Z" if close else "")


def ring(cx: float, cy: float, r: float, z: float, n: int = 120) -> list[tuple[float, float, float]]:
    return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n), z) for i in range(n)]


def cylinder(cx: float, cy: float, r: float, z0: float, z1: float, fill: str, stroke: str, sw: float,
             opacity: float = 1.0) -> str:
    """A vertical cylinder in iso: the body (silhouette between the two ellipses), then the top ellipse."""
    t_left, t_right = math.radians(135), math.radians(-45)        # screen-x extremes of an iso circle
    lo, hi = min(z0, z1), max(z0, z1)
    body = [(cx + r * math.cos(t_right + math.pi * i / 60), cy + r * math.sin(t_right + math.pi * i / 60), lo)
            for i in range(61)]                                    # near half of the bottom ellipse
    body += [(cx + r * math.cos(t_left - math.pi * i / 60), cy + r * math.sin(t_left - math.pi * i / 60), hi)
             for i in range(61)]                                   # far half of the top ellipse, back the other way
    top = ring(cx, cy, r, hi, 60)
    return (f'<g opacity="{opacity}"><path d="{path(body)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" '
            f'stroke-linejoin="round"/><path d="{path(top)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/></g>')


def plate(outline: list[tuple[float, float]], holes: list[list[tuple[float, float]]], z: float, thick: float,
          sw: float) -> str:
    """A flat part with thickness: the lower face dim, then the upper face filled to hide what is below."""
    low = path([(x, y, z - thick) for x, y in outline])
    up = path([(x, y, z) for x, y in outline])
    hole_d = " ".join(path([(x, y, z) for x, y in h]) for h in holes)
    return (f'<path d="{low}" fill="{C["bg"]}" stroke="{C["line"]}" stroke-opacity="0.35" stroke-width="{sw * 0.7}"/>'
            f'<path d="{up} {hole_d}" fill="{C["bg_lift"]}" fill-opacity="0.94" fill-rule="evenodd" '
            f'stroke="{C["line"]}" stroke-width="{sw}" stroke-linejoin="round"/>')


def circle_pts(cx: float, cy: float, r: float, n: int = 90) -> list[tuple[float, float]]:
    return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def drive_svg() -> str:
    check_geometry()
    sw = 2.4
    L, M, A = C["line"], C["muted"], C["amber"]
    parts: list[str] = []
    z_house, z_disc, z_flange = 0.0, 66.0, 40.0
    dash = 'stroke-width="1.6" stroke-dasharray="22 7 4 7"'

    # Axis: the centre line through the housing and disc, then a dog-leg to the flange exploded to the side.
    ax0, ax1 = iso(0, 0, -16), iso(0, 0, 150)
    parts.append(f'<line x1="{ax0[0]:.1f}" y1="{ax0[1]:.1f}" x2="{ax1[0]:.1f}" y2="{ax1[1]:.1f}" stroke="{M}" {dash}/>')
    _shift[:] = FLANGE_SHIFT
    fx0, fx1 = iso(0, 0, z_flange - 70), iso(0, 0, z_flange + 105)
    _shift[:] = [0.0, 0.0]
    parts.append(f'<path d="M{ax1[0]:.1f},{ax1[1]:.1f} L{fx0[0]:.1f},{ax1[1]:.1f} L{fx0[0]:.1f},{fx1[1]:.1f}" '
                 f'fill="none" stroke="{M}" {dash}/>')

    # Housing: a ring with the 12 pins standing in it.
    outer = circle_pts(0, 0, 138, 160)
    inner = circle_pts(0, 0, R_PIN_CIRCLE - R_PIN - 4, 160)
    parts.append(plate(outer, [inner], z_house, 16, sw))
    parts.append(f'<path d="{path(ring(0, 0, R_PIN_CIRCLE, z_house, 160))}" fill="none" stroke="{M}" '
                 f'stroke-width="1.4" stroke-dasharray="6 6"/>')
    pins = []
    for k in range(N_PINS):
        a = 2 * math.pi * k / N_PINS + PIN_ROT
        px, py = R_PIN_CIRCLE * math.cos(a), R_PIN_CIRCLE * math.sin(a)
        pins.append((iso(px, py, 0)[1], cylinder(px, py, R_PIN, z_house, z_house + 26, C["bg_lift"], L, sw * 0.8)))
    parts += [svg for _, svg in sorted(pins)]                     # back pins first

    # The cycloid disc, eccentric by e, with its output holes and the bearing bore.
    dx, dy = DISC_OFFSET
    disc = [(x + dx, y + dy) for x, y in DISC]
    holes = [circle_pts(dx + R_OUT_CIRCLE * math.cos(2 * math.pi * k / OUT_PINS),
                        dy + R_OUT_CIRCLE * math.sin(2 * math.pi * k / OUT_PINS), R_OUT_PIN + ECC, 60)
             for k in range(OUT_PINS)]
    holes.append(circle_pts(dx, dy, 26, 80))
    parts.append(plate(disc, holes, z_disc, 12, sw))
    # Eccentric bearing in the bore, on the input shaft's cam.
    parts.append(cylinder(dx, dy, 22, z_disc - 12, z_disc + 6, C["bg_lift"], A, sw * 0.9))
    parts.append(cylinder(0, 0, 9, z_disc + 6, z_disc + 14, C["bg_lift"], L, sw * 0.8))

    # Output flange with its 6 pins hanging down (they ride in the disc's holes), and the output shaft.
    _shift[:] = FLANGE_SHIFT
    opins = []
    for k in range(OUT_PINS):
        a = 2 * math.pi * k / OUT_PINS
        px, py = R_OUT_CIRCLE * math.cos(a), R_OUT_CIRCLE * math.sin(a)
        opins.append((iso(px, py, 0)[1], cylinder(px, py, R_OUT_PIN, z_flange - 40, z_flange - 10, C["bg_lift"], L,
                                                  sw * 0.8)))
    parts += [svg for _, svg in sorted(opins)]
    parts.append(plate(circle_pts(0, 0, 84, 140), [circle_pts(0, 0, 10, 40)], z_flange, 10, sw))
    parts.append(cylinder(0, 0, 20, z_flange, z_flange + 62, C["bg_lift"], L, sw))
    out_top = (0, -20, z_flange + 62)
    out_label = iso(*out_top)
    _shift[:] = [0.0, 0.0]

    # Callouts: leader from a point on the part to a label, in the mono kicker style.
    def callout(p3: tuple[float, float, float], dx_: float, dy_: float, text: str, colour: str = L) -> str:
        x0, y0 = iso(*p3)
        x1, y1 = x0 + dx_, y0 + dy_
        x2 = x1 + (56 if dx_ > 0 else -56)
        anchor = "start" if dx_ > 0 else "end"
        tx = x2 + (12 if dx_ > 0 else -12)
        return (f'<circle cx="{x0:.1f}" cy="{y0:.1f}" r="4" fill="{colour}"/>'
                f'<path d="M{x0:.1f},{y0:.1f} L{x1:.1f},{y1:.1f} L{x2:.1f},{y1:.1f}" fill="none" stroke="{colour}" '
                f'stroke-width="1.6"/>'
                f'<text x="{tx:.1f}" y="{y1 + 7:.1f}" text-anchor="{anchor}" class="call" fill="{colour}">{text}</text>')

    a_pin = 2 * math.pi * 2 / N_PINS + PIN_ROT
    parts.append(callout((R_PIN_CIRCLE * math.cos(a_pin), R_PIN_CIRCLE * math.sin(a_pin), 26), 34, 74,
                         'z<tspan class="sb">2</tspan> = 12 RING PINS'))
    i_right = max(range(len(disc)), key=lambda i: iso(disc[i][0], disc[i][1], z_disc)[0])
    parts.append(callout((disc[i_right][0], disc[i_right][1], z_disc - 6), 58, 96, 'z<tspan class="sb">1</tspan> = 11 LOBES'))
    parts.append(callout((dx - 22, dy, z_disc + 6), -60, -160, "ECCENTRIC  e", A))
    ox, oy = out_label
    parts.append(f'<circle cx="{ox:.1f}" cy="{oy:.1f}" r="4" fill="{L}"/><path d="M{ox:.1f},{oy:.1f} '
                 f'L{ox - 40:.1f},{oy - 70:.1f} L{ox - 96:.1f},{oy - 70:.1f}" fill="none" stroke="{L}" '
                 f'stroke-width="1.6"/><text x="{ox - 108:.1f}" y="{oy - 63:.1f}" text-anchor="end" class="call" '
                 f'fill="{L}">OUTPUT  <tspan fill="{A}">i = −11 : 1</tspan></text>')
    parts.append(callout((0, 0, z_disc + 14), -150, 130, "INPUT  ω"))
    return "\n".join(parts)


def banner_html() -> str:
    grid = 50
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><title>The Mechanical Paradox banner</title>
<style>
@font-face {{ font-family: Archivo; src: url(../../public/fonts/Archivo-Variable.woff2) format('woff2');
  font-weight: 100 900; font-stretch: 62% 125%; }}
@font-face {{ font-family: Inter; src: url(../../public/fonts/Inter-500.woff2) format('woff2'); font-weight: 500; }}
@font-face {{ font-family: Inter; src: url(../../public/fonts/Inter-400.woff2) format('woff2'); font-weight: 400; }}
@font-face {{ font-family: JBM; src: url(../../public/fonts/JetBrainsMono-500.woff2) format('woff2'); font-weight: 500; }}
@font-face {{ font-family: JBM; src: url(../../public/fonts/JetBrainsMono-greek-500.woff2) format('woff2'); font-weight: 500;
  unicode-range: U+0370-03FF; }}
@font-face {{ font-family: JBM; src: url(../../public/fonts/JetBrainsMono-700.woff2) format('woff2'); font-weight: 700; }}
html, body {{ margin: 0; background: {C['bg']}; }}
.stage {{ position: relative; width: 2560px; height: 1440px; overflow: hidden; background:
  radial-gradient(ellipse 1000px 520px at 1800px 720px, {C['bg_lift']} 0%, {C['bg']} 70%), {C['bg']}; }}
.grid {{ position: absolute; inset: 0;
  background-image: linear-gradient({C['grid']} 1.5px, transparent 1.5px), linear-gradient(90deg, {C['grid']} 1.5px, transparent 1.5px);
  background-size: {grid}px {grid}px; background-position: -1px 8px;
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.25) 22%, rgba(0,0,0,1) 62%, rgba(0,0,0,1) 100%);
  opacity: 0.95; }}
.glow {{ position: absolute; left: 1440px; top: 600px; width: 420px; height: 330px;
  background: radial-gradient(closest-side, rgba(255,159,28,0.16), rgba(255,159,28,0)); }}
.vignette {{ position: absolute; inset: 0; background: radial-gradient(ellipse 1500px 900px at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%); }}
svg {{ position: absolute; inset: 0; }}
.call {{ font-family: JBM; font-weight: 500; font-size: 19px; letter-spacing: 1.5px; }}
.sb {{ font-size: 13px; baseline-shift: sub; letter-spacing: 0; }}
.text {{ position: absolute; left: 560px; top: 536px; width: 1000px; }}
.kicker {{ font-family: JBM; font-weight: 500; font-size: 21px; letter-spacing: 3px; color: {C['muted']}; }}
.kicker b {{ color: {C['amber']}; font-weight: 700; }}
h1 {{ margin: 16px 0 0; font-family: Archivo; font-weight: 900; font-stretch: 112%; font-size: 78px; line-height: 0.98; white-space: nowrap;
  letter-spacing: -0.5px; color: {C['ink']}; }}
.sub {{ margin-top: 18px; font-family: Inter; font-weight: 400; font-size: 31px; color: {C['sub']}; }}
.badge {{ display: inline-block; margin-top: 22px; padding: 10px 18px 9px; border: 2px solid {C['amber']};
  font-family: JBM; font-weight: 700; font-size: 19px; letter-spacing: 3px; color: {C['amber']}; }}
.safe {{ display: none; position: absolute; left: 507px; top: 508px; width: 1546px; height: 423px; outline: 2px dashed #f0f; }}
</style></head>
<body><div class="stage">
<div class="grid"></div><div class="glow"></div>
<svg width="2560" height="1440" viewBox="0 0 2560 1440">
{drive_svg()}
</svg>
<div class="vignette"></div>
<div class="text">
  <div class="kicker"><b>//</b> MECHANICAL FORENSICS &amp; APPLIED PHYSICS</div>
  <h1>THE MECHANICAL<br>PARADOX</h1>
  <div class="sub">Why things work when intuition says they shouldn't.</div>
  <div class="badge">NEW DEEP DIVE EVERY SUNDAY</div>
</div>
<div class="safe"></div>
</div></body></html>
"""


def main() -> None:
    out = ROOT / "brand/banner/banner.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(banner_html())
    print("wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()

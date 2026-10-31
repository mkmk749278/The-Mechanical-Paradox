"""Exact cycloidal gear outlines for the channel's brand art (PLAYBOOK §6.2).

A cycloidal tooth (the clockmaker's profile) has an epicycloid face above the pitch circle and a hypocycloid flank
below it, both traced by the same rolling circle, so two equal gears cut this way are conjugate: they mesh with a
constant speed ratio. Unlike involute teeth, cycloidal teeth stay strong at low tooth counts, which is why clock
pinions use them.

Every function here is pure geometry in "math" coordinates (y up); `to_svg_path` flips y for SVG.
"""
from __future__ import annotations

import math
from dataclasses import dataclass

Point = tuple[float, float]


@dataclass(frozen=True)
class Gear:
    teeth: int
    pitch_radius: float
    phase_deg: float = 0.0          # angle of tooth 0's centre line
    roll_ratio: float = 0.5         # rolling circle radius / pitch radius (0.5 = radial flanks)
    addendum: float = 1.25          # tip height, in modules
    dedendum: float = 1.45          # root depth, in modules
    samples: int = 24               # points per flank curve

    @property
    def module(self) -> float:
        return 2 * self.pitch_radius / self.teeth

    @property
    def pitch_angle(self) -> float:
        return 2 * math.pi / self.teeth

    @property
    def tip_radius(self) -> float:
        return self.pitch_radius + self.addendum * self.module

    @property
    def root_radius(self) -> float:
        return self.pitch_radius - self.dedendum * self.module

    def tooth_angles_deg(self) -> list[float]:
        return [(self.phase_deg + k * 360 / self.teeth) % 360 for k in range(self.teeth)]


def _epicycloid(R: float, r: float, start: float, sign: int, t: float) -> Point:
    x = (R + r) * math.cos(t) - r * math.cos((R + r) / r * t)
    y = (R + r) * math.sin(t) - r * math.sin((R + r) / r * t)
    return _rot(x, sign * y, start)


def _hypocycloid(R: float, r: float, start: float, sign: int, t: float) -> Point:
    x = (R - r) * math.cos(t) + r * math.cos((R - r) / r * t)
    y = (R - r) * math.sin(t) - r * math.sin((R - r) / r * t)
    return _rot(x, sign * y, start)


def _rot(x: float, y: float, a: float) -> Point:
    c, s = math.cos(a), math.sin(a)
    return (x * c - y * s, x * s + y * c)


def _polar(p: Point) -> tuple[float, float]:
    return math.hypot(*p), math.atan2(p[1], p[0])


def _ang_diff(a: float, b: float) -> float:
    return (a - b + math.pi) % (2 * math.pi) - math.pi


def _solve(f, lo: float, hi: float, it: int = 60) -> float:
    """Bisection for the first root of a monotone condition f(t) >= 0 on [lo, hi]."""
    for _ in range(it):
        mid = (lo + hi) / 2
        if f(mid) >= 0:
            hi = mid
        else:
            lo = mid
    return hi


def tooth_flank(g: Gear, centre: float) -> list[Point]:
    """One side of one tooth (the side at lower angle), root → pitch → tip, for a tooth whose centre line is `centre`."""
    R, r = g.pitch_radius, g.roll_ratio * g.pitch_radius
    pitch_pt = centre - g.pitch_angle / 4               # equal tooth and space at the pitch circle
    # Face: epicycloid from the pitch point toward the tooth centre, up to the tip circle or the centre line.
    t_max = math.pi * r / R                              # half a turn of the rolling circle: plenty

    def face_done(t: float) -> float:
        rad, ang = _polar(_epicycloid(R, r, pitch_pt, +1, t))
        return max(rad - g.tip_radius, _ang_diff(ang, centre))

    t_face = _solve(face_done, 0.0, t_max)
    # Flank: hypocycloid from the pitch point away from the tooth, down to the root circle.
    def flank_done(t: float) -> float:
        rad, _ = _polar(_hypocycloid(R, r, pitch_pt, -1, t))
        return g.root_radius - rad

    t_flank = _solve(flank_done, 0.0, t_max)
    flank = [_hypocycloid(R, r, pitch_pt, -1, t_flank * (1 - i / g.samples)) for i in range(g.samples + 1)]
    face = [_epicycloid(R, r, pitch_pt, +1, t_face * i / g.samples) for i in range(1, g.samples + 1)]
    return flank + face


def outline(g: Gear, cx: float = 0.0, cy: float = 0.0) -> list[Point]:
    """Closed outline of the whole gear, counter-clockwise, in math coordinates."""
    pts: list[Point] = []
    one = tooth_flank(g, 0.0)
    mirror = [(x, -y) for x, y in reversed(one)]         # the other side of the same tooth, tip → root
    tooth = one + mirror[1:]
    for k in range(g.teeth):
        a = math.radians(g.phase_deg) + k * g.pitch_angle
        rotated = [_rot(x, y, a) for x, y in tooth]
        if pts:
            # root arc from the previous tooth's last point to this tooth's first point
            r0, a0 = _polar(pts[-1])
            r1, a1 = _polar(rotated[0])
            span = (a1 - a0) % (2 * math.pi)
            n = 6
            pts += [(g.root_radius * math.cos(a0 + span * i / n), g.root_radius * math.sin(a0 + span * i / n))
                    for i in range(1, n)]
        pts += rotated
    r0, a0 = _polar(pts[-1])
    r1, a1 = _polar(pts[0])
    span = (a1 - a0) % (2 * math.pi)
    pts += [(g.root_radius * math.cos(a0 + span * i / 6), g.root_radius * math.sin(a0 + span * i / 6)) for i in range(1, 6)]
    return [(x + cx, y + cy) for x, y in pts]


def mesh_error_deg(a: Gear, a_centre: Point, b: Gear, b_centre: Point) -> float:
    """How far two equal gears are from a clean mesh, in degrees of tooth phase (0 = tooth sits exactly in a gap)."""
    th_ab = math.degrees(math.atan2(b_centre[1] - a_centre[1], b_centre[0] - a_centre[0]))
    th_ba = th_ab + 180
    p = 360 / a.teeth
    s = (th_ab - a.phase_deg) + (th_ba - b.phase_deg) - p / 2
    return abs(((s + p / 2) % p) - p / 2)


def to_svg_path(pts: list[Point], ox: float, oy: float, scale: float = 1.0, close: bool = True) -> str:
    """Math coordinates → SVG path data (y flipped) around the SVG origin (ox, oy)."""
    out = [f"{'M' if i == 0 else 'L'}{ox + x * scale:.1f},{oy - y * scale:.1f}" for i, (x, y) in enumerate(pts)]
    return " ".join(out) + (" Z" if close else "")

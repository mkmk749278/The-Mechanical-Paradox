// Exact cycloidal gear outlines (TypeScript port of brand/gears.py; PLAYBOOK §6.2, §8.3).
// Epicycloid faces above the pitch circle, hypocycloid flanks below it, one rolling circle: two equal gears cut this
// way are conjugate. rollRatio 0.5 gives radial flanks (the clock-wheel form). Math coordinates, y up.

export type Pt = readonly [number, number];

export type GearSpec = {
	teeth: number;
	pitchRadius: number;
	phaseDeg?: number;
	rollRatio?: number;
	addendum?: number; // in modules
	dedendum?: number; // in modules
	samples?: number; // points per flank curve
};

type Full = Required<GearSpec>;

const full = (g: GearSpec): Full => ({
	phaseDeg: 0,
	rollRatio: 0.5,
	addendum: 1.25,
	dedendum: 1.45,
	samples: 20,
	...g,
});

export const gearModule = (g: GearSpec): number => (2 * g.pitchRadius) / g.teeth;
export const tipRadius = (g: GearSpec): number => g.pitchRadius + full(g).addendum * gearModule(g);
export const rootRadius = (g: GearSpec): number => g.pitchRadius - full(g).dedendum * gearModule(g);

const rot = (x: number, y: number, a: number): Pt => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const angDiff = (a: number, b: number): number => ((((a - b + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

const epi = (R: number, r: number, start: number, sign: number, t: number): Pt =>
	rot((R + r) * Math.cos(t) - r * Math.cos(((R + r) / r) * t), sign * ((R + r) * Math.sin(t) - r * Math.sin(((R + r) / r) * t)), start);
const hypo = (R: number, r: number, start: number, sign: number, t: number): Pt =>
	rot((R - r) * Math.cos(t) + r * Math.cos(((R - r) / r) * t), sign * ((R - r) * Math.sin(t) - r * Math.sin(((R - r) / r) * t)), start);

const solve = (f: (t: number) => number, lo: number, hi: number): number => {
	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2;
		if (f(mid) >= 0) hi = mid;
		else lo = mid;
	}
	return hi;
};

/** One tooth (both sides), root → tip → root, centred on angle 0. */
const tooth = (spec: GearSpec): Pt[] => {
	const g = full(spec);
	const R = g.pitchRadius;
	const r = g.rollRatio * R;
	const p = (2 * Math.PI) / g.teeth;
	const pitchPt = -p / 4;
	const tMax = (Math.PI * r) / R;
	const tip = tipRadius(g);
	const root = rootRadius(g);
	const tFace = solve((t) => {
		const [x, y] = epi(R, r, pitchPt, 1, t);
		return Math.max(Math.hypot(x, y) - tip, angDiff(Math.atan2(y, x), 0));
	}, 0, tMax);
	const tFlank = solve((t) => {
		const [x, y] = hypo(R, r, pitchPt, -1, t);
		return root - Math.hypot(x, y);
	}, 0, tMax);
	const side: Pt[] = [];
	for (let i = 0; i <= g.samples; i++) side.push(hypo(R, r, pitchPt, -1, tFlank * (1 - i / g.samples)));
	for (let i = 1; i <= g.samples; i++) side.push(epi(R, r, pitchPt, 1, (tFace * i) / g.samples));
	const mirror = side.slice().reverse().map(([x, y]) => [x, -y] as Pt);
	return [...side, ...mirror.slice(1)];
};

/** Closed outline of the gear, counter-clockwise, centred on (cx, cy). */
export const gearOutline = (spec: GearSpec, cx = 0, cy = 0): Pt[] => {
	const g = full(spec);
	const p = (2 * Math.PI) / g.teeth;
	const root = rootRadius(g);
	const one = tooth(g);
	const pts: Pt[] = [];
	const arc = (from: Pt, to: Pt) => {
		const a0 = Math.atan2(from[1], from[0]);
		let span = Math.atan2(to[1], to[0]) - a0;
		span = ((span % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
		for (let i = 1; i < 6; i++) pts.push([root * Math.cos(a0 + (span * i) / 6), root * Math.sin(a0 + (span * i) / 6)]);
	};
	for (let k = 0; k < g.teeth; k++) {
		const a = (g.phaseDeg * Math.PI) / 180 + k * p;
		const t = one.map(([x, y]) => rot(x, y, a));
		if (pts.length) arc(pts[pts.length - 1], t[0]);
		pts.push(...t);
	}
	arc(pts[pts.length - 1], pts[0]);
	return pts.map(([x, y]) => [x + cx, y + cy] as Pt);
};

/** SVG path data, y flipped, around the SVG point (ox, oy). */
export const toPath = (pts: readonly Pt[], ox = 0, oy = 0, close = true): string =>
	pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(ox + x).toFixed(2)},${(oy - y).toFixed(2)}`).join(' ') + (close ? ' Z' : '');

/** Mesh error (degrees of tooth phase) between two equal gears: 0 = each tooth sits exactly in a gap. */
export const meshErrorDeg = (a: GearSpec, ac: Pt, b: GearSpec, bc: Pt): number => {
	const th = (Math.atan2(bc[1] - ac[1], bc[0] - ac[0]) * 180) / Math.PI;
	const p = 360 / a.teeth;
	const s = th - (a.phaseDeg ?? 0) + (th + 180 - (b.phaseDeg ?? 0)) - p / 2;
	return Math.abs(((((s + p / 2) % p) + p) % p) - p / 2);
};

/** Lightening windows between hub and rim, n spokes (the crossing of a clock wheel). Same as brand/build_logo.py. */
export const gearWindows = (spec: GearSpec, n: number, spinDeg: number): Pt[][] => {
	const R = spec.pitchRadius;
	const rOut = rootRadius(spec) - 0.55 * gearModule(spec);
	const rIn = 0.36 * R;
	const spoke = 0.11 * R;
	const shapes: Pt[][] = [];
	for (let k = 0; k < n; k++) {
		const a0 = (spinDeg * Math.PI) / 180 + (k * 2 * Math.PI) / n;
		const a1 = a0 + (2 * Math.PI) / n;
		const dOut = spoke / 2 / rOut;
		const dIn = spoke / 2 / rIn;
		const pts: Pt[] = [];
		for (let i = 0; i <= 40; i++) {
			const a = a0 + dOut + ((a1 - a0 - 2 * dOut) * i) / 40;
			pts.push([rOut * Math.cos(a), rOut * Math.sin(a)]);
		}
		for (let i = 0; i <= 40; i++) {
			const a = a1 - dIn - ((a1 - a0 - 2 * dIn) * i) / 40;
			pts.push([rIn * Math.cos(a), rIn * Math.sin(a)]);
		}
		shapes.push(pts);
	}
	return shapes;
};

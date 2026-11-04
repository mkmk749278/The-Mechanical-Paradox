import {WS} from './model';

// The wheel and rail in cross-section, at true scale in millimeters, and the contact between them (PLAYBOOK §8.3).
// The wheel's tread is a 1:20 cone (C05) ending in a flange; the rail head is crowned and the rail is inclined 1:20
// toward the track centre, as rails normally are (NTNU: "Rails are normally inclined inward, for example 1:20").
// The flange shape (height, angle) is a generic drawing, not a standard profile: it is drawn, never quoted.
//
// Coordinates: u is measured across the wheel from its nominal contact point, positive away from the track centre
// (toward the wheel's outer face); v across the rail head from its centre, same sense. z is up, in mm.

/** Wheel radius at u. Tread: r0 − λu (bigger toward the flange). */
export const FLANGE_ROOT = -36.5; // u where the tread meets the flange flank (tuned so the play is 7 mm, check below)
const FLANK_SLOPE = Math.tan((70 * Math.PI) / 180); // a 70° flank, the angle Nadal's limit uses (C17)
const FLANGE_TIP_R = WS.r0 + 28;
const TIP_U = FLANGE_ROOT - (FLANGE_TIP_R - 3 - (WS.r0 - WS.cone * FLANGE_ROOT)) / FLANK_SLOPE - 3;
const BACK_U = TIP_U - 11;
const OUTER_U = 96;
const CHAMFER_U = 82;

export const wheelR = (u: number): number => {
	const tread = (x: number) => WS.r0 - WS.cone * x;
	if (u >= FLANGE_ROOT) {
		if (u <= CHAMFER_U) return tread(u);
		return tread(CHAMFER_U) - (u - CHAMFER_U) * 0.12; // outer chamfer
	}
	const rootR = tread(FLANGE_ROOT);
	const flankTopU = FLANGE_ROOT - (FLANGE_TIP_R - 3 - rootR) / FLANK_SLOPE;
	if (u >= flankTopU) return rootR + (FLANGE_ROOT - u) * FLANK_SLOPE;
	// rounded tip: a quarter-ish arc from the flank top over to the back face
	if (u >= BACK_U) {
		const c = (flankTopU + BACK_U) / 2;
		const half = (flankTopU - BACK_U) / 2;
		const t = (u - c) / half; // -1 … 1
		return FLANGE_TIP_R - 3 * t * t + (t > 0 ? 0 : 0);
	}
	return FLANGE_TIP_R - 3; // back face (drawn vertical by the outline)
};

/** The wheel's outline from the back face to the outer face, as (u, r) pairs. */
export const wheelOutline = (step = 0.5): [number, number][] => {
	const pts: [number, number][] = [];
	for (let u = BACK_U; u <= OUTER_U + 1e-9; u += step) pts.push([u, wheelR(u)]);
	return pts;
};
export const WHEEL_SPAN = {back: BACK_U, outer: OUTER_U, tip: TIP_U};

// ---- the rail (a generic flat-bottom rail: head 64 mm, crown radius 300 mm, inclined 1:20) ----
const HEAD = 32; // half head width
const CROWN = 300;
const INCL = Math.atan(WS.cone);

/** Rail outline before inclination, (v, z) with z = 0 at the crown top. Head, web, foot. */
const railLocal = (): [number, number][] => {
	const top: [number, number][] = [];
	for (let v = -HEAD + 6; v <= HEAD - 6 + 1e-9; v += 0.5) top.push([v, -(v * v) / (2 * CROWN)]);
	const e = -((HEAD - 6) ** 2) / (2 * CROWN);
	const corner = (cx: number, sgn: number): [number, number][] => {
		const pts: [number, number][] = [];
		for (let k = 1; k <= 8; k++) {
			const a = (k / 8) * (Math.PI / 2);
			pts.push([cx + sgn * 6 * Math.sin(a), e - 6 + 6 * Math.cos(a)]);
		}
		return pts;
	};
	return [
		[-75, -172],
		[-75, -160],
		[-10, -150],
		[-8, -55],
		[-HEAD, -42],
		...corner(-HEAD + 6, -1).reverse(),
		...top,
		...corner(HEAD - 6, 1),
		[HEAD, -42],
		[8, -55],
		[10, -150],
		[75, -160],
		[75, -172],
	];
};

/**
 * The rail in the wheel's frame: inclined so its top slopes down toward the track centre (−v), at the same 1:20 as
 * the tread, with the crown tangent point at v = 0, z = 0.
 */
export const railOutline = (): [number, number][] =>
	railLocal().map(([v, z]) => [v * Math.cos(INCL) - z * Math.sin(INCL), v * Math.sin(INCL) + z * Math.cos(INCL)]);

/**
 * Where the wheel sits on the rail when the wheelset is shifted y mm toward this wheel's outer side.
 * Returns the axle height above the crown point (mm), the contact's v, and the rolling radius there.
 */
export const contact = (y: number): {axleZ: number; v: number; r: number} => {
	const rail = railOutline();
	let best = {axleZ: -Infinity, v: 0, r: 0};
	// the wheel's point above rail point v is at u = v − y; the wheel rests where z_rail + r is highest
	for (const [v, z] of rail) {
		const u = v - y;
		if (u < BACK_U || u > OUTER_U) continue;
		const a = z + wheelR(u);
		if (a > best.axleZ) best = {axleZ: a, v, r: wheelR(u)};
	}
	// refine on the crown with a fine sweep
	for (let v = best.v - 1; v <= best.v + 1; v += 0.01) {
		const zc = -(v * v) / (2 * CROWN);
		const vz: [number, number] = [v * Math.cos(INCL) - zc * Math.sin(INCL), v * Math.sin(INCL) + zc * Math.cos(INCL)];
		const a = vz[1] + wheelR(vz[0] - y);
		if (a > best.axleZ) best = {axleZ: a, v: vz[0], r: wheelR(vz[0] - y)};
	}
	return best;
};

/** The shift at which the flange root reaches the gauge corner: the tread contact jumps to the flange. */
export const playAt = (): number => {
	for (let y = 0; y <= 20; y += 0.01) {
		if (Math.abs(contact(y).r - (WS.r0 + WS.cone * y)) > 0.02) return y;
	}
	return Infinity;
};

// ---- checks: the cone gives r0 + λy at every shift up to the play; the play is 7 mm (C09) ----
for (const y of [0, 2, 4, 6, 7]) {
	const c = contact(y);
	if (Math.abs(c.r - (WS.r0 + WS.cone * y)) > 0.02) throw new Error(`contact radius at y=${y}: ${c.r}`);
	if (Math.abs(c.v) > 0.6) throw new Error(`contact left the crown at y=${y}: v=${c.v}`);
}
{
	const play = playAt();
	if (play < WS.clear || play > WS.clear + 0.3) throw new Error(`flange play ${play.toFixed(2)} mm, want 7`);
}

/** The play left before the flange meets the rail, at shift y (mm). */
export const PLAY = playAt();
export const flangeGap = (y: number): number => Math.max(0, PLAY - y);

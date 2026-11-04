import * as THREE from 'three';
import {WS} from './model';
import {railOutline, WHEEL_SPAN, wheelR} from './profiles';

// The film's solid geometry in metres (1 unit = 1 m), built from the same outlines the contact solver uses, so the
// 3D wheel that rolls on screen is the one whose numbers the HUD reads (PLAYBOOK §8.3). Proportions from real
// wheelsets: research/visual_refs.md.
//
// Axes: x across the track (positive toward the right-hand rail), y up (rail crown at y = 0), z along the track.

const MM = 1 / 1000;

/** A closed (r, axial) contour, mm; split into smooth runs at corners so each lathe keeps hard edges. */
type Contour = [number, number][];

const splitRuns = (pts: Contour, cornerDeg = 28): Contour[] => {
	const runs: Contour[] = [];
	let run: Contour = [pts[0]];
	for (let i = 1; i < pts.length; i++) {
		run.push(pts[i]);
		if (i < pts.length - 1) {
			const a = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
			const b = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]);
			let d = Math.abs(b - a);
			if (d > Math.PI) d = 2 * Math.PI - d;
			if ((d * 180) / Math.PI > cornerDeg) {
				runs.push(run);
				run = [pts[i]];
			}
		}
	}
	runs.push(run);
	return runs.filter((r) => r.length > 1);
};

/** Lathe a contour (r, a) in mm around the x axis; `a` maps to world x = offset + side·a. */
const latheX = (contour: Contour, side: 1 | -1, offset: number, segments: number): THREE.BufferGeometry[] =>
	splitRuns(contour).map((run) => {
		// LatheGeometry sweeps (x = radius, y = axial) round its y axis; we rotate y → x after.
		const pts = run.map(([r, a]) => new THREE.Vector2(r * MM, (offset + side * a) * MM));
		const g = new THREE.LatheGeometry(pts, segments);
		g.rotateZ(-Math.PI / 2);
		return g;
	});

// ---- the wheel (u: across the wheel from the nominal contact, + toward the outer face) ----
const RIM_IN = WS.r0 - 70; // rim depth about 70 mm below the tread
const WEB_T = 28;
const HUB_R = 135;
const BORE_R = 100;
const HUB_U = [-120, 60] as const; // the hub boss stands proud of the inner face
/** The web's mid-surface: dished about 40 mm toward the inner face between rim and hub. */
const webMid = (r: number): number => {
	const t = (r - 150) / (RIM_IN - 150); // 0 at the hub, 1 at the rim
	return -26 + 46 * (3 * t * t - 2 * t * t * t);
};

/** The wheel's tread band (where it rolls): u from the flange root to the chamfer. */
export const TREAD_U = [-30, 82] as const;

const wheelContours = (): {band: Contour; body: Contour} => {
	const step = 0.5;
	const outline: Contour = [];
	for (let u = WHEEL_SPAN.back; u <= WHEEL_SPAN.outer + 1e-9; u += step) outline.push([wheelR(u), u]);
	const band: Contour = outline.filter(([, u]) => u >= TREAD_U[0] && u <= TREAD_U[1]);
	const webOuter: Contour = [];
	const webInner: Contour = [];
	for (let r = RIM_IN - 8; r >= HUB_R + 12; r -= 8) webOuter.push([r, webMid(r) + WEB_T / 2]);
	for (let r = HUB_R + 12; r <= RIM_IN - 8; r += 8) webInner.push([r, webMid(r) - WEB_T / 2]);
	const body: Contour = [
		...outline,
		[RIM_IN + 6, WHEEL_SPAN.outer],
		[RIM_IN, WHEEL_SPAN.outer - 6],
		[RIM_IN, webMid(RIM_IN) + WEB_T / 2 + 14],
		...webOuter,
		[HUB_R + 4, webMid(HUB_R) + WEB_T / 2 + 10],
		[HUB_R, HUB_U[1] - 6],
		[HUB_R - 6, HUB_U[1]],
		[BORE_R, HUB_U[1]],
		[BORE_R, HUB_U[0]],
		[HUB_R - 6, HUB_U[0]],
		[HUB_R, HUB_U[0] + 6],
		[HUB_R + 4, webMid(HUB_R) - WEB_T / 2 - 10],
		...webInner,
		[RIM_IN, webMid(RIM_IN) - WEB_T / 2 - 14],
		[RIM_IN, WHEEL_SPAN.back + 6],
		[RIM_IN + 6, WHEEL_SPAN.back],
		outline[0],
	];
	return {band, body};
};

export type WheelGeometry = {body: THREE.BufferGeometry[]; band: THREE.BufferGeometry[]; flange: THREE.BufferGeometry[]};

/** One wheel at side ±1, its nominal contact at x = side·b0. */
export const wheelGeometry = (side: 1 | -1, segments = 160): WheelGeometry => {
	const {band, body} = wheelContours();
	// the band sits a hair proud of the body so it never z-fights
	const bandProud: Contour = band.map(([r, u]) => [r + 0.15, u]);
	// the flange's skin (root to back face), a hair proud: its own material, so it can be lit on its own
	const flange: Contour = [];
	for (let u = WHEEL_SPAN.back; u <= -34; u += 0.5) flange.push([wheelR(u) + 0.2, u]);
	return {
		body: latheX(body, side, side * WS.b0, segments),
		band: latheX(bandProud, side, side * WS.b0, segments),
		flange: latheX(flange, side, side * WS.b0, segments),
	};
};

// ---- the axle (a: distance from the wheelset centre, mm) ----
const AXLE: Contour = (() => {
	const seatIn = WS.b0 + HUB_U[0] - 10; // wheel seat runs a little inside the hub
	const seatOut = WS.b0 + HUB_U[1];
	const pts: Contour = [
		[0.001, -1030],
		[60, -1030],
		[65, -1025],
		[65, -seatOut - 28],
		[82, -seatOut - 24],
		[82, -seatOut - 8],
		[BORE_R - 1, -seatOut],
		[BORE_R - 1, -seatIn],
		[85, -seatIn + 40],
		[85, seatIn - 40],
		[BORE_R - 1, seatIn],
		[BORE_R - 1, seatOut],
		[82, seatOut + 8],
		[82, seatOut + 24],
		[65, seatOut + 28],
		[65, 1025],
		[60, 1030],
		[0.001, 1030],
	];
	return pts;
})();

export const axleGeometry = (segments = 96): THREE.BufferGeometry[] => latheX(AXLE, 1, 0, segments);
/** The journals (bright, machined), for a separate material. */
export const journalGeometry = (segments = 96): THREE.BufferGeometry[] => {
	const seatOut = WS.b0 + HUB_U[1];
	const j: Contour = [
		[65.2, seatOut + 30],
		[65.2, 1024],
	];
	return [...latheX(j, 1, 0, segments), ...latheX(j, -1, 0, segments)];
};

// ---- track paths and rails ----

/** A track centreline sample: position (m, in the x–z plane) and unit tangent. */
export type PathSample = {p: THREE.Vector2; t: THREE.Vector2};

/** Straight track along +z from z0 to z1. */
export const straightPath = (z0: number, z1: number, n = 2): PathSample[] =>
	Array.from({length: n}, (_, i) => ({p: new THREE.Vector2(0, z0 + ((z1 - z0) * i) / (n - 1)), t: new THREE.Vector2(0, 1)}));

/**
 * Straight lead-in, then a circular curve of radius R (m) bending toward −x (a left-hand bend), through `deg`.
 * Starts at z = z0 heading +z; the straight is `lead` m long.
 */
export const curvePath = (R: number, deg: number, lead: number, z0 = 0, n = 240): PathSample[] => {
	const out: PathSample[] = [];
	const nl = Math.max(2, Math.round((n * lead) / (lead + (R * deg * Math.PI) / 180)));
	for (let i = 0; i < nl; i++) out.push({p: new THREE.Vector2(0, z0 + (lead * i) / nl), t: new THREE.Vector2(0, 1)});
	const na = n - nl;
	for (let i = 0; i <= na; i++) {
		const th = ((deg * Math.PI) / 180) * (i / na);
		// centre of the bend at (−R, z0 + lead)
		out.push({
			p: new THREE.Vector2(-R + R * Math.cos(th), z0 + lead + R * Math.sin(th)),
			t: new THREE.Vector2(-Math.sin(th), Math.cos(th)),
		});
	}
	return out;
};

/** Sweep a closed (lateral, up) profile in mm along a path; lateral is measured to the right of the tangent. */
export const sweep = (profile: [number, number][], path: PathSample[], lateralOffset: number): THREE.BufferGeometry => {
	const ring = profile.length;
	const pos: number[] = [];
	for (const {p, t} of path) {
		const n = new THREE.Vector2(t.y, -t.x); // right of the tangent (x–z plane, y up)
		for (const [v, z] of profile) {
			const lat = (lateralOffset + v) * MM;
			pos.push(p.x + n.x * lat, z * MM, p.y + n.y * lat);
		}
	}
	const idx: number[] = [];
	for (let i = 0; i < path.length - 1; i++) {
		for (let k = 0; k < ring; k++) {
			const a = i * ring + k;
			const b = i * ring + ((k + 1) % ring);
			const c = (i + 1) * ring + k;
			const d = (i + 1) * ring + ((k + 1) % ring);
			idx.push(a, c, b, b, c, d);
		}
	}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	g.setIndex(idx);
	g.computeVertexNormals();
	return g;
};

/**
 * The two rails along a path: the profile from profiles.ts (inclined 1:20 toward the track centre, crown at the
 * contact). Right rail: v outward = +lateral; left rail mirrored. Returns [left, right].
 */
export const railGeometries = (path: PathSample[]): [THREE.BufferGeometry, THREE.BufferGeometry] => {
	const prof = railOutline();
	const right = sweep(prof, path, WS.b0);
	const leftProf = prof.map(([v, z]) => [-v, z] as [number, number]).reverse();
	const left = sweep(leftProf, path, -WS.b0);
	return [left, right];
};

/** Arc length positions of sleepers (m) every `spacing` m along a path; returns position, tangent pairs. */
export const sleepersAlong = (path: PathSample[], spacing = 0.6): PathSample[] => {
	const out: PathSample[] = [];
	let acc = 0;
	let next = spacing / 2;
	for (let i = 1; i < path.length; i++) {
		const seg = path[i].p.clone().sub(path[i - 1].p);
		const len = seg.length();
		while (next <= acc + len) {
			const f = (next - acc) / len;
			out.push({p: path[i - 1].p.clone().lerp(path[i].p, f), t: path[i - 1].t.clone().lerp(path[i].t, f).normalize()});
			next += spacing;
		}
		acc += len;
	}
	return out;
};

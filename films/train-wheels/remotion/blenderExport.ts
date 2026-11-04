import * as THREE from 'three';
import {axleGeometry, journalGeometry, railGeometries, sleepersAlong, wheelGeometry} from './geometry3d';
import {WS} from './model';
import {contact} from './profiles';
import {PATHS, SHOTS, ShotId} from './shots3d';

// Everything Blender needs for one hero shot, from the film's own code (scripts/export_blender_shot.mjs → JSON →
// blender/render_shot.py): the meshes (the lathed wheels, axle, journals, end caps, the rails swept along the shot's
// path, the sleepers) and, per frame, the camera, the wheelset's world matrix and glows, the track's opacity and the
// drawn rail paths. Coordinates are three.js world metres (y up); render_shot.py converts to Blender's z up.

type Mesh = {name: string; material: string; pos: string; idx: string};

const b64f = (a: ArrayLike<number>) => Buffer.from(new Float32Array(a).buffer).toString('base64');
const b64i = (a: ArrayLike<number>) => Buffer.from(new Uint32Array(a).buffer).toString('base64');

const mesh = (name: string, material: string, g: THREE.BufferGeometry): Mesh => {
	const geo = g.index ? g : g.clone().setIndex(Array.from({length: g.attributes.position.count}, (_, i) => i));
	return {name, material, pos: b64f(geo.attributes.position.array as Float32Array), idx: b64i((geo.index as THREE.BufferAttribute).array as ArrayLike<number>)};
};

const wheelsetMeshes = (): Mesh[] => {
	const out: Mesh[] = [];
	for (const side of [1, -1] as const) {
		const w = wheelGeometry(side);
		w.body.forEach((g, i) => out.push(mesh(`body${side}_${i}`, 'body', g)));
		w.band.forEach((g, i) => out.push(mesh(`band${side}_${i}`, 'band', g)));
		w.flange.forEach((g, i) => out.push(mesh(`flange${side}_${i}`, 'flange', g)));
	}
	axleGeometry().forEach((g, i) => out.push(mesh(`axle_${i}`, 'axle', g)));
	journalGeometry().forEach((g, i) => out.push(mesh(`journal_${i}`, 'journal', g)));
	// the end caps and their three bolts, as Wheelset3D draws them
	for (const side of [1, -1]) {
		const cap = new THREE.CylinderGeometry(0.058, 0.058, 0.014, 64).rotateZ(Math.PI / 2).translate(side * 1.037, 0, 0);
		out.push(mesh(`cap${side}`, 'axle', cap));
		for (let k = 0; k < 3; k++) {
			const a = (k * 2 * Math.PI) / 3 + 0.3;
			const hex = new THREE.CylinderGeometry(0.011, 0.011, 0.012, 6)
				.rotateZ(Math.PI / 2)
				.translate(side * 1.037 + side * 0.012, 0.034 * Math.cos(a), 0.034 * Math.sin(a));
			out.push(mesh(`bolt${side}_${k}`, 'journal', hex));
		}
	}
	return out;
};

/** The wheelset's world matrix, composed exactly as Wheelset3D nests its groups. */
const wheelsetMatrix = (w: {rolled?: number; shift?: number; yaw?: number; at?: [number, number]; lift?: number}): number[] => {
	const outer = new THREE.Object3D();
	outer.position.set(w.at?.[0] ?? 0, 0, w.at?.[1] ?? 0);
	outer.rotation.set(0, w.yaw ?? 0, 0);
	const inner = new THREE.Object3D();
	const shift = w.shift ?? 0;
	inner.position.set(shift / 1000, contact(Math.abs(shift)).axleZ / 1000, 0);
	inner.rotation.set(0, 0, w.lift ?? 0);
	const spin = new THREE.Object3D();
	spin.rotation.set((w.rolled ?? 0) / (WS.r0 / 1000), 0, 0);
	outer.add(inner);
	inner.add(spin);
	outer.updateMatrixWorld(true);
	return spin.matrixWorld.elements.map((v) => +v.toFixed(7));
};

export const exportShot = (id: ShotId) => {
	const shot = SHOTS[id];
	const from = shot.from();
	const to = shot.to();
	const s0 = shot.state(from);
	const path = PATHS[s0.track.path]();
	const [railL, railR] = railGeometries(path);
	const sleepers = sleepersAlong(path, 0.6).map(({p, t}) => [+p.x.toFixed(5), +p.y.toFixed(5), +t.x.toFixed(6), +t.y.toFixed(6)]);
	// the drawn rail paths: each as its polyline on the rail top, with the arc length of every point
	const railPathLines = s0.railPaths.length
		? s0.railPaths
		: shot.state(to - 1).railPaths;
	const lines = railPathLines.map((r) => {
		const pts = path.map((s) => {
			const n = new THREE.Vector2(s.t.y, -s.t.x);
			return [s.p.x + n.x * r.lateral, 0.012, s.p.y + n.y * r.lateral];
		});
		const len = [0];
		for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][2] - pts[i - 1][2]));
		return {color: r.color, pts: pts.map((p) => p.map((v) => +v.toFixed(5))), len: len.map((v) => +v.toFixed(5)), z: path.map((s) => s.p.y)};
	});
	const frames = [];
	for (let f = from; f < to; f++) {
		const s = shot.state(f);
		frames.push({
			f: f - from,
			cam: s.cam,
			track: {draw: +s.track.draw.toFixed(4), edge: +s.track.edgeOpacity.toFixed(4)},
			wheelsets: s.wheelsets.map((w) => ({m: wheelsetMatrix(w), glow: w.glow ?? 0, heat: w.heat ?? 0, flangeGlow: w.flangeGlow ?? 0, axleGlow: w.axleGlow ?? 0})),
			railPaths: s.railPaths.map((r, i) => {
				const L = lines[i];
				const first = L.z.findIndex((z) => z >= r.from);
				const start = first < 0 ? 1 : L.len[first] / L.len[L.len.length - 1];
				return {start: +start.toFixed(5), end: +(start + r.draw * (1 - start)).toFixed(5)};
			}),
		});
	}
	return {
		shot: id,
		fps: 60,
		frames,
		wheelset: wheelsetMeshes(),
		wheelsets: s0.wheelsets.length,
		rails: [mesh('railL', 'rail', railL), mesh('railR', 'rail', railR)],
		sleepers,
		railPaths: lines.map((l) => ({color: l.color, pts: l.pts})),
	};
};
